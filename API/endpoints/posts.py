from bleach import clean
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
import logging
from fastapi import APIRouter, logger
from sqlalchemy import desc, exists, func
from database.database_initializer import Post, User, post_likes, followers
from api_models import UserPostBase
from typing import List, Dict
from .users import get_profile_picture

from database.database_session import SessionLocal

from sqlalchemy.sql.functions import coalesce



def get_db() -> Session:
    """
    Get a database session using dependency injection.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()


@router.post("/post")
def create_post(user_post: UserPostBase, db: Session = Depends(get_db)):
    """
    Create a post for a user.
    """
    try:
        sanitized_content = clean(user_post.post_content)
        user = db.query(User).filter(User.id == user_post.user_poster_id).first()
        if user is None or sanitized_content == "":
            raise HTTPException(status_code=400, detail="Invalid user or content")

        db_post = Post(user_poster_id=user.id, content=sanitized_content, reply_to=user_post.reply_to)
        db.add(db_post)
        db.commit()
        return {"status": "success", "post_id": db_post.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/post/{post_id}/comments")
def read_comments(post_id: int, page: int = 1, per_page: int = 6, db: Session = Depends(get_db)):
    try:
        offset = (page - 1) * per_page
        comments = (db.query(Post, User.account_name, User.bio, User.display_name, User.profile_picture)
                    .join(User, Post.user_poster_id == User.id)  # Join the User table
                    .filter(Post.reply_to == post_id)  # Filter by reply_to field
                    .order_by(desc(Post.date_of_post))
                    .offset(offset)
                    .limit(per_page)
                    .all())
        return [{"comment": {**comment.__dict__, "user": {"account_name": account_name, "bio": bio, "display_name": display_name, "profile_picture": profile_picture}}} for comment, account_name, bio, display_name, profile_picture in comments]
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))


@router.get("/post/{post_id}/likes_count")
def get_likes_count(post_id: int): 
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    likes_count = post.liked_by.count()  # count the number of users who liked this post
    session.close()
    return {"likes_count": likes_count}

@router.get("/post/{post_id}/comments_count")
def get_comments_count(post_id: int): 
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    comment_count = post.replies.count()  # count the number of users who commented on this post
    session.close()
    return {"comment_count": comment_count}

@router.post("/post/{post_id}/toggle_like/{user_id}")  # include user_id in the path
def toggle_like(post_id: int, user_id: int):
    session = SessionLocal()
    try:
        post = session.query(Post).get(post_id)
        user = session.query(User).get(user_id)
        if post is None or user is None:
            return {"status": "error", "message": "Post or User not found"}
        if post in user.liked_posts:
            # If the post is already liked by the user, unlike it
            logging.info("unliking")
            user.liked_posts.remove(post)
            post.likes_count -= 1  # decrement the likes_count field
        else:
            # If the post is not liked by the user, like it
            logging.info("liking")
            user.liked_posts.append(post)
            post.likes_count += 1  # increment the likes_count field
        session.flush()  # flush the session to update the relationship immediately
        session.commit()
    except:
        session.rollback()
        logging.error("Error occurred", exc_info=True)
        return {"status": "error"}
    session.close()
    return {"status": "success"}  # return success message

@router.get("/post/{post_id}/is_liked_by/{user_id}")
def is_liked_by(post_id: int, user_id: int):
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    user = session.query(User).get(user_id)
    is_liked = post in user.liked_posts
    session.close()
    return {"isLiked": is_liked}

logger = logging.getLogger("uvicorn")

def check_for_more_replies(session, post_id, max_depth):
    # Check for existence of further replies beyond max_depth
    replies_exist = session.query(Post.id).filter(Post.reply_to == post_id).first() is not None
    return replies_exist if max_depth > 0 else False


def build_reply_tree(posts_dict, users_dict, comment_count_dict, post_id, max_depth=100, depth=0, liked_posts_by_user=None):
    if depth > max_depth:
        return []

    if post_id not in posts_dict:
        return []  # or some other placeholder value

    post = posts_dict[post_id]
    user = users_dict.get(post.user_poster_id)

    try:
        is_liked = post in liked_posts_by_user
    except:
        is_liked = False

    user_display_name = user.display_name if user else 'Unknown User'
    replies_data = []

    for reply in post.replies:
        if reply.id in posts_dict:
            reply_data = build_reply_tree(posts_dict, users_dict, comment_count_dict, reply.id, max_depth, depth + 1, liked_posts_by_user)
            replies_data.append(reply_data)

    # Recursive count of all nested replies
    total_comment_count = sum(reply['comment_count'] for reply in replies_data) + len(post.replies)

    post_data = {
        'id': post.id,
        'content': post.content,
        'user_display_name': user_display_name,
        'date_of_post': post.date_of_post,
        'reply_to': post.reply_to,
        'likes_count': post.likes_count,
        'user_poster_id': post.user_poster_id,
        'is_liked': is_liked,
        'hasChildren': len(post.replies) > 0,
        'profile_picture': get_profile_picture(post.user_poster_id)['url'],
        'comment_count': total_comment_count,
        'replies': replies_data
    }
    return post_data


@router.get("/posts/{post_id}/comments")
def read_post_comments(post_id: int, page: int = 1, per_page: int = 100, max_depth=30, user_id: int = None):
    offset = (page - 1) * per_page
    session = SessionLocal()






    # Fetch the initial post
    initial_post = session.query(Post).get(post_id)


    # Determine if the post is a reply to another post
    is_reply = initial_post.reply_to is not None
    reply_to_post_id = initial_post.reply_to if is_reply else None

    # Fetch the user who is viewing the post
    #print("user_id: ", user_id)
    user_looking_at_post = session.query(User).get(user_id)
    try:
        #print("user_looking_at_post: ", user_looking_at_post)
        #print("user_looking_at_post.liked_posts: ", user_looking_at_post.liked_posts)
        liked_posts_by_user = user_looking_at_post.liked_posts.all()
        #print(liked_posts_by_user)
    except AttributeError:
        liked_posts_by_user = []

    # Fetch all replies for the post, including nested replies
    # Pagination is applied at the top level of replies
    all_posts = [initial_post] if initial_post else []
    current_replies = [initial_post] if initial_post else []
    for depth in range(max_depth):
        if depth == 0:
            # Apply pagination only at the first level of replies
            next_replies = (session.query(Post, User)
                            .join(User, Post.user_poster_id == User.id)
                            .filter(Post.reply_to == post_id)
                            .order_by(Post.date_of_post)  # Order by date_of_post
                            .offset(offset)
                            .limit(per_page)
                            .all())
        else:
            # Fetch all nested replies for the current set of replies
            next_replies = (session.query(Post, User)
                            .join(User, Post.user_poster_id == User.id)
                            .filter(Post.reply_to.in_([post.id for post in current_replies]))
                            .all())
        # Check if there are more replies for each post in next_replies
        for post, _ in next_replies:
            post.more_replies = check_for_more_replies(session, post.id, max_depth - 1 - depth)

        current_replies = [post for post, _ in next_replies]
        all_posts.extend(current_replies)

    # Assuming all_posts is a list of Post objects
    posts_dict = {post.id: post for post in all_posts}

    # Fetch user data for all posts and create users_dict
    user_ids = {post.user_poster_id for post in all_posts}
    users = session.query(User).filter(User.id.in_(user_ids)).all()
    users_dict = {user.id: user for user in users}

    comment_counts = session.query(
    Post.reply_to, func.count(Post.id).label('comment_count')
    ).group_by(Post.reply_to).all()

    comment_count_dict = {count[0]: count[1] for count in comment_counts}

    reply_tree = build_reply_tree(posts_dict, users_dict, comment_count_dict, post_id, max_depth=100, liked_posts_by_user=liked_posts_by_user)
    
    # Adds a flag to the top-level post indicating if there are more top-level comments
    has_more_top_level_comments = session.query(Post.id).filter(Post.reply_to == post_id).offset(offset + per_page).limit(1).scalar() is not None
    reply_tree['has_more_top_level_comments'] = has_more_top_level_comments

    reply_tree['is_reply'] = is_reply
    reply_tree['reply_to_post_id'] = reply_to_post_id
    
    session.close()
    return reply_tree

@router.get("/posts/{user_id}/")
def read_friend_posts(user_id: int, page: int = 1, per_page: int = 6):
    offset = (page - 1) * per_page
    session = SessionLocal()

    # Subquery to check if the user has liked each post
    user_liked_subquery = (session.query(post_likes.c.post_id)
                           .filter(post_likes.c.user_id == user_id)
                           .subquery())

    # Subquery to check if the user has commented on each post
    user_commented_subquery = (session.query(Post.id)
                               .filter(Post.user_poster_id == user_id, Post.reply_to != None)
                               .subquery())

    # Subquery to count comments for each post
    comments_subquery = (session.query(Post.reply_to.label('post_id'), func.count('*').label('comments_count'))
                        .group_by(Post.reply_to)
                        .subquery())

    # Main query
    posts = (session.query(Post, User.account_name, User.bio, User.display_name, User.profile_picture,
                        func.count(post_likes.c.post_id).label('likes_count'),
                        coalesce(func.max(comments_subquery.c.comments_count), 0).label('comments_count'),
                        exists().where(Post.id == user_liked_subquery.c.post_id).label('user_has_liked'),
                        exists().where(Post.id == user_commented_subquery.c.id).label('user_has_commented'))
            .join(User, Post.user_poster_id == User.id)
            .join(followers, followers.c.followed_id == User.id)  # Join followers table
            .outerjoin(post_likes, Post.id == post_likes.c.post_id)
            .outerjoin(comments_subquery, Post.id == comments_subquery.c.post_id)
            .filter(Post.reply_to == None, followers.c.follower_id == user_id)  # Filter posts by followed users
            .group_by(Post.id, User.id)
            .order_by(desc(Post.date_of_post))
            .offset(offset)
            .limit(per_page)
            .all())

    session.close()
    return [
        {
            "post": {
                **post.__dict__,
                "user": {
                    "account_name": account_name,
                    "bio": bio,
                    "display_name": display_name,
                    "profile_picture": get_profile_picture(post.user_poster_id)['url'] if profile_picture is None else profile_picture
                },
                "likes_count": likes_count,
                "comments_count": comments_count,
                "user_has_liked": user_has_liked,
                "user_has_commented": user_has_commented,
                "reply_to": post.reply_to
            }
        }
        for post, account_name, bio, display_name, profile_picture, likes_count, comments_count, user_has_liked, user_has_commented in posts
    ]

@router.get("/posts/{user_id}/user/")
def read_own_posts(user_id: int, page: int = 1, per_page: int = 6):
    offset = (page - 1) * per_page
    session = SessionLocal()

    # Subquery to check if the user has liked each post
    user_liked_subquery = (session.query(post_likes.c.post_id)
                           .filter(post_likes.c.user_id == user_id)
                           .subquery())

    # Subquery to check if the user has commented on each post
    user_commented_subquery = (session.query(Post.id)
                               .filter(Post.user_poster_id == user_id, Post.reply_to != None)
                               .subquery())

    # Subquery to count comments for each post
    comments_subquery = (session.query(Post.reply_to.label('post_id'), func.count('*').label('comments_count'))
                        .group_by(Post.reply_to)
                        .subquery())

    # Main query
    posts = (session.query(Post, User.account_name, User.bio, User.display_name, User.profile_picture,
                        func.count(post_likes.c.post_id).label('likes_count'),
                        coalesce(func.max(comments_subquery.c.comments_count), 0).label('comments_count'),
                        exists().where(Post.id == user_liked_subquery.c.post_id).label('user_has_liked'),
                        exists().where(Post.id == user_commented_subquery.c.id).label('user_has_commented'))
            .join(User, Post.user_poster_id == User.id)
            .outerjoin(post_likes, Post.id == post_likes.c.post_id)
            .outerjoin(comments_subquery, Post.id == comments_subquery.c.post_id)
            .filter(Post.reply_to == None, User.id == user_id)  # Filter posts by user_id
            .group_by(Post.id, User.id)
            .order_by(desc(Post.date_of_post))
            .offset(offset)
            .limit(per_page)
            .all())

    session.close()
    return [
        {
            "post": {
                **post.__dict__,
                "user": {
                    "account_name": account_name,
                    "bio": bio,
                    "display_name": display_name,
                    "profile_picture": get_profile_picture(post.user_poster_id)['url'] if profile_picture is None else profile_picture
                },
                "likes_count": likes_count,
                "comments_count": comments_count,
                "user_has_liked": user_has_liked,
                "user_has_commented": user_has_commented
            }
        }
        for post, account_name, bio, display_name, profile_picture, likes_count, comments_count, user_has_liked, user_has_commented in posts
    ]

@router.get("/posts/{user_id}/trending/")
def read_trending_posts(user_id: int, page: int = 1, per_page: int = 6):
    offset = (page - 1) * per_page
    session = SessionLocal()

    # Subquery to check if the user has liked each post
    user_liked_subquery = (session.query(post_likes.c.post_id)
                           .filter(post_likes.c.user_id == user_id)
                           .subquery())

    # Subquery to check if the user has commented on each post
    user_commented_subquery = (session.query(Post.id)
                               .filter(Post.user_poster_id == user_id, Post.reply_to != None)
                               .subquery())

    # Subquery to count comments for each post
    comments_subquery = (session.query(Post.reply_to.label('post_id'), func.count('*').label('comments_count'))
                        .group_by(Post.reply_to)
                        .subquery())

    # Main query
    posts = (session.query(Post, User.account_name, User.bio, User.display_name, User.profile_picture,
                        func.count(post_likes.c.post_id).label('likes_count'),
                        coalesce(func.max(comments_subquery.c.comments_count), 0).label('comments_count'),
                        exists().where(Post.id == user_liked_subquery.c.post_id).label('user_has_liked'),
                        exists().where(Post.id == user_commented_subquery.c.id).label('user_has_commented'))
            .join(User, Post.user_poster_id == User.id)
            .outerjoin(post_likes, Post.id == post_likes.c.post_id)
            .outerjoin(comments_subquery, Post.id == comments_subquery.c.post_id)
            .group_by(Post.id, User.id)
            .order_by(desc(Post.date_of_post))
            .offset(offset)
            .limit(per_page)
            .all())

    session.close()
    return [
        {
            "post": {
                **post.__dict__,
                "user": {
                    "account_name": account_name,
                    "bio": bio,
                    "display_name": display_name,
                    "profile_picture": get_profile_picture(post.user_poster_id)['url'] if profile_picture is None else profile_picture
                },
                "likes_count": likes_count,
                "comments_count": comments_count,
                "user_has_liked": user_has_liked,
                "user_has_commented": user_has_commented
            }
        }
        for post, account_name, bio, display_name, profile_picture, likes_count, comments_count, user_has_liked, user_has_commented in posts
    ]


def get_comments_recursive(post_id, parent_id=None):
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    comments = session.query(Post).filter(Post.reply_to == post_id).all()

    # Convert the post and its comments to dictionaries
    post_dict = post.__dict__
    comments_dict = [comment.__dict__ for comment in comments]

    # Add a 'replies' field to each comment
    for comment in comments_dict:
        if comment['id'] != parent_id:
            replies = session.query(Post).filter(Post.reply_to == comment['id']).all()
            if replies:
                comment['replies'] = [reply.__dict__ for reply in replies]
                for reply in comment['replies']:
                    reply_replies = session.query(Post).filter(Post.reply_to == reply['id']).all()
                    if reply_replies:
                        reply['replies'] = get_comments_recursive(reply['id'], comment['id'])
                    else:
                        reply['replies'] = []
            else:
                comment['replies'] = []

    # Add the comments to the post
    post_dict['comments'] = comments_dict

    session.close()

    return post_dict

@router.get("/posts/{post_id}/all_comments")
def read_all_post_comments(post_id: int):
    return get_comments_recursive(post_id)


def fetch_replies(comment_id: int, session, depth: int, max_depth: int) -> List[Dict]:
    if depth >= max_depth:
        return []
    
    replies = session.query(Post).filter(Post.reply_to == comment_id).all()
    replies_dict = [reply.__dict__ for reply in replies]

    for reply in replies_dict:
        reply['replies'] = fetch_replies(reply['id'], session, depth + 1, max_depth)

    return replies_dict

def get_comments_limited(post_id, top_level_limit=100, depth=1, max_depth=100):
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    comments = session.query(Post).filter(Post.reply_to == post_id).limit(top_level_limit).all()

    post_dict = post.__dict__
    comments_dict = [comment.__dict__ for comment in comments]

    for comment in comments_dict:
        comment['replies'] = fetch_replies(comment['id'], session, depth, max_depth)

    post_dict['comments'] = comments_dict
    session.close()

    return post_dict

@router.get("/posts/{post_id}/post_comments")
def read_post_comments(post_id: int):
    return get_comments_limited(post_id)