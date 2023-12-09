import logging
from fastapi import APIRouter, logger
from sqlalchemy import desc, func
from postgresql_init import Post, User, post_likes
from models import UserPostBase
from typing import List, Dict

from db import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

@router.post("/post")
def create_post(user_post: UserPostBase):
    
    logging.info("Trying to create post")
    try:
        print(f"User: {user_post.username}")
        print(f"Post: {user_post.post_content}")

        session = SessionLocal()
        user = session.query(User).filter(User.account_name == user_post.username).first()
        if user is None:
            return {"status": "error", "message": "User not found"}

        # Use the reply_to field when creating the Post object
        db_post = Post(user_poster_id=user.id, content=user_post.post_content, reply_to=user_post.reply_to)
        session.add(db_post)
        session.commit()
        session.close()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/post/{post_id}/comments")
def read_comments(post_id: int, page: int = 1, per_page: int = 6):
    offset = (page - 1) * per_page
    session = SessionLocal()
    comments = (session.query(Post, User.account_name, User.bio, User.display_name, User.profile_picture)
                .join(User, Post.user_poster_id == User.id)  # Join the User table
                .filter(Post.reply_to == post_id)  # Filter by reply_to field
                .order_by(desc(Post.date_of_post))
                .offset(offset)
                .limit(per_page)
                .all())
    session.close()
    return [{"comment": {**comment.__dict__, "user": {"account_name": account_name, "bio": bio, "display_name": display_name, "profile_picture": profile_picture}}} for comment, account_name, bio, display_name, profile_picture in comments]

@router.get("/post/{post_id}/likes_count")
def get_likes_count(post_id: int): 
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    likes_count = post.liked_by.count()  # count the number of users who liked this post
    session.close()
    return {"likes_count": likes_count}

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




def build_reply_tree(posts_dict, post_id, max_depth=3, depth=0):
    if depth > max_depth:
        return []
    post = posts_dict[post_id]
    post.replies = [build_reply_tree(posts_dict, reply_id, max_depth, depth + 1) for reply_id in post.replies]
    return post


@router.get("/posts")
def read_posts(page: int = 1, per_page: int = 6):
    offset = (page - 1) * per_page
    session = SessionLocal()
    posts = (session.query(Post, User.account_name, User.bio, User.display_name, User.profile_picture, func.count(post_likes.c.post_id).label('likes_count'))
            .join(User, Post.user_poster_id == User.id)  # Join the User table
            .outerjoin(post_likes, Post.id == post_likes.c.post_id)  # Assuming Like has a post_id field
            .filter(Post.reply_to == None)  # Only get posts without any comments
            .group_by(Post.id, Post.user_poster_id, Post.date_of_post, Post.content, Post.reply_to, User.account_name, User.bio, User.display_name, User.profile_picture)  # Group by all non-aggregated columns
            .order_by(desc(Post.date_of_post))
            .offset(offset)
            .limit(per_page)
            .all())
    session.close()
    return [{"post": {**post.__dict__, "user": {"account_name": account_name, "bio": bio, "display_name": display_name, "profile_picture": profile_picture}}} for post, account_name, bio, display_name, profile_picture, likes_count in posts]

@router.get("/posts/{post_id}/comments")
def read_post_comments(post_id: int, page: int = 1, per_page: int = 6):
    offset = (page - 1) * per_page
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    posts = session.query(Post).filter(Post.reply_to == post_id).offset(offset).limit(per_page).all()
    posts_dict = {post.id: post for post in posts}
    reply_tree = build_reply_tree(posts_dict, post.id, max_depth=3)
    session.close()
    return reply_tree

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

def get_comments_limited(post_id, top_level_limit=10, depth=1, max_depth=3):
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