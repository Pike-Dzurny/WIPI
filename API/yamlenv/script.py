from pydantic import BaseModel
from fastapi import FastAPI
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, create_engine, ForeignKey, Table
from sqlalchemy.orm import sessionmaker
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import joinedload, relationship

from sqlalchemy import desc

#import boto3
#from botocore.exceptions import NoCredentialsError, ClientError
#import botocore

from fastapi.responses import FileResponse

from postgresql_init import User, Post, post_likes

import logging

logger = logging.getLogger("uvicorn")



from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException
import hashlib
import binascii

import re
import os




Base = declarative_base()

# Retrieve the DATABASE_URL from the environment variables
database_url = os.getenv('DATABASE_URL')

# If the DATABASE_URL is not found, fall back to a default or throw an error
if not database_url:
    raise ValueError("DATABASE_URL environment variable not found")

# Create the SQLAlchemy engine using the DATABASE_URL
engine = create_engine(database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
from typing import Optional
from fastapi import HTTPException

app = FastAPI()


logger.log(logging.INFO, "aaaaaaaaaaaaaaaa")

origins = [
    "http://localhost:3000",  # adjust to match the origins you need
    "http://frontend:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class UserBase(BaseModel):
    account_name: str

class UserPostBase(BaseModel):
    """
    Represents the structure of a user post.

    Args:
        username (str): The username of the user making the post.
        post_content (str): The content of the post.
        reply_to (Optional[int], optional): The ID of the post being replied to. Defaults to None.

    Attributes:
        username (str): The username of the user making the post.
        post_content (str): The content of the post.
        reply_to (Optional[int]): The ID of the post being replied to.

    Example:
        user_post = UserPostBase(username="john_doe", post_content="Hello world!", reply_to=1)
        print(user_post.username)  # Output: "john_doe"
        print(user_post.post_content)  # Output: "Hello world!"
        print(user_post.reply_to)  # Output: 1
    """

    username: str
    post_content: str
    reply_to: Optional[int] = None
    

class SignUpUser(BaseModel):
    account_name: str
    display_name: str
    email: str
    password_hash: str
    iterations: int
    salt: str

class AuthDetails(BaseModel):
    username: str
    password: str
    reply_to: Optional[int] = None

class UsernameAvailability(BaseModel):
    available: bool


class PostBase(BaseModel):
    user_poster_id: int
    content: str
    likes_count: int
    #comments_count: int
    #respost_count: int

@app.post("/signup")
async def create_user(user: SignUpUser):
    session = SessionLocal()

    # Check if a user with the same email already exists
    existing_user = session.query(User).filter(User.email == user.email).first()
    if existing_user is not None:
        session.close()
        raise HTTPException(status_code=400, detail="Email already in use")

    # If no existing user is found, create a new one
    db_user = User(**user.dict())    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    logging.info(f"Created user with username {db_user.account_name}")
    logging.info(f"Created user with password {db_user.password_hash}")
    session.close()
    return {"id": db_user.id}

@app.get("/check-username", response_model=UsernameAvailability)
async def check_username(username: Optional[str] = None):
    session = SessionLocal()

    if username:
        # Query your database to check if the username exists
        
        user = session.query(User).filter(User.account_name == username).first()

        if user:
            session.close()
            return {"available": False}
        else:
            session.close()
            return {"available": True}
    else:
        session.close()
        raise HTTPException(status_code=400, detail="Username must be provided")

@app.post("/auth")
async def authenticate_user(auth_details: AuthDetails):
    logging.info(logging.INFO, "Creating an instance of AuthDetails")
    session = SessionLocal()

    # Fetch the user from the database
    db_user = session.query(User).filter(User.account_name == auth_details.username).first()

    # If the user doesn't exist, raise an HTTPException
    if not db_user:
        session.close()
        raise HTTPException(status_code=400, detail="Does not exist")

    # Verify the password
    salt = db_user.salt.encode('utf-8')  # Ensure that the salt is encoded to bytes
    hashed_password = hashlib.pbkdf2_hmac(
        'sha512',
        auth_details.password.encode('utf-8'),  # Ensure that the password is encoded to bytes
        salt,
        db_user.iterations
    )

    hashed_password_hex = binascii.hexlify(hashed_password).decode('utf-8')  # Convert to hex for comparison
    logging.info(f"Hashed password: {hashed_password_hex}")
    logging.info(f"Database password: {db_user.password_hash}")
    logging.info(f"Salt: {db_user.salt}")
    logging.info(f"Iterations: {db_user.iterations}")
    logging.info(f"Password: {auth_details.password}")
    # If the password is incorrect, raise an HTTPException
    if hashed_password_hex != db_user.password_hash:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # If the username and password are correct, return the user details
    return {"id": db_user.id, "name": db_user.display_name, "email": db_user.email}


@app.post("/post")
def create_post(user_post: UserPostBase):
    
    logger.info(logging.INFO, "Trying to create post")
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
    

@app.get("/post/{post_id}/comments")
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

@app.get("/post/{post_id}/likes_count")
def get_likes_count(post_id: int): 
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    likes_count = post.liked_by.count()  # count the number of users who liked this post
    session.close()
    return {"likes_count": likes_count}

@app.post("/post/{post_id}/toggle_like/{user_id}")  # include user_id in the path
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

@app.get("/post/{post_id}/is_liked_by/{user_id}")
def is_liked_by(post_id: int, user_id: int):
    session = SessionLocal()
    post = session.query(Post).get(post_id)
    user = session.query(User).get(user_id)
    is_liked = post in user.liked_posts
    session.close()
    return {"isLiked": is_liked}

@app.get("/users")
def read_users():
    session = SessionLocal()
    users = session.query(User).all()
    session.close()
    return users


def build_reply_tree(posts_dict, post_id, max_depth=3, depth=0):
    if depth > max_depth:
        return []
    post = posts_dict[post_id]
    post.replies = [build_reply_tree(posts_dict, reply_id, max_depth, depth + 1) for reply_id in post.replies]
    return post


@app.get("/posts")
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

@app.get("/posts/{post_id}/comments")
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

@app.get("/posts/{post_id}/all_comments")
def read_all_post_comments(post_id: int):
    return get_comments_recursive(post_id)

from typing import List, Dict

def fetch_replies(comment_id: int, session, depth: int, max_depth: int) -> List[Dict]:
    if depth >= max_depth:
        return []
    
    replies = session.query(Post).filter(Post.reply_to == comment_id).all()
    replies_dict = [reply.__dict__ for reply in replies]

    for reply in replies_dict:
        reply['replies'] = fetch_replies(reply['id'], session, depth + 1, max_depth)

    return replies_dict

def get_comments_limited(post_id, top_level_limit=3, depth=1, max_depth=3):
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

@app.get("/posts/{post_id}/post_comments")
def read_post_comments(post_id: int):
    return get_comments_limited(post_id)

# def get_comments_limited(post_id, depth=1, max_depth=3, top_level_limit=5):
#     """
#     post_id: An integer representing the ID of the post for which comments are to be retrieved.
#     depth (optional): An integer representing the current depth of recursion (default is 1).
#     max_depth (optional): An integer representing the maximum depth of recursion (default is 3).
#     top_level_limit (optional): An integer representing the maximum number of top-level comments to retrieve (default is 5).
#     """

#     if depth > max_depth:
#         return []

#     session = SessionLocal()
#     post = session.query(Post).get(post_id)
#     comments = session.query(Post).filter(Post.reply_to == post_id).limit(top_level_limit).all()
#     session.close()

#     # Convert the post and its comments to dictionaries
#     post_dict = post.__dict__
#     comments_dict = [comment.__dict__ for comment in comments]

#     # Add a 'replies' field to each comment
#     for comment in comments_dict:
#         comment['replies'] = get_comments_limited(comment['id'], depth + 1)

#     # Add the comments to the post
#     post_dict['comments'] = comments_dict

#     return post_dict

# @app.get("/posts/{post_id}/limited_comments")
# def read_limited_post_comments(post_id: int):
#     return get_comments_limited(post_id)

# @app.get("/post/{post_id}")
# def get_post(post_id: int, page: int = 1, per_page: int = 6):
#     offset = (page - 1) * per_page
#     session = SessionLocal()
#     post = (session.query(Post, User.account_name, User.bio, User.display_name, User.profile_picture, func.count(post_likes.c.post_id).label('likes_count'), func.array_agg(Comment.id).label('comment_ids'))
#             .join(User, Post.user_poster_id == User.id)  # Join the User table
#             .outerjoin(post_likes, Post.id == post_likes.c.post_id)  # Join the post_likes table
#             .outerjoin(Comment, Post.id == Comment.post_id)  # Join the Comment table
#             .filter(Post.id == post_id)  # Filter by post_id
#             .group_by(Post.id, User.id)  # Group by Post.id and User.id
#             .order_by(desc(Post.date_of_post))
#             .offset(offset)
#             .limit(per_page)
#             .first())
#     session.close()
#     if post is None:
#         return {"status": "error", "message": "Post not found"}
#     post, account_name, bio, display_name, profile_picture, likes_count, comment_ids = post
#     return {"post": {**post.__dict__, "user": {"account_name": account_name, "bio": bio, "display_name": display_name, "profile_picture": profile_picture}, "comment_ids": comment_ids}}


@app.get("/user/{user_id}/posts")
def read_user_posts(user_id: int, page: int = 1, per_page: int = 6):
    offset = (page - 1) * per_page
    session = SessionLocal()
    posts = (session.query(Post)
             .options(joinedload(Post.user))
             .filter(Post.user_poster_id == user_id)
             .offset(offset)
             .limit(per_page)
             .all())
    session.close()
    return posts

def get_s3_object(bucket, key):
    return 
    #s3 = boto3.client('s3')

    #try:
    #    s3.download_file(bucket, key, './' + key)
    #except botocore.exceptions.ClientError as e:
    #    print(f"Error getting object {key} from bucket {bucket}. Make sure they exist and your bucket is in the same region as this function.")
    #    print(e)
    #    return {"error": "Could not download file"}

@app.get("/user/{user_id}/profile_picture")
def get_profile_picture(user_id: int):
    #if user_id == 0:
    #if user_id:
    return FileResponse('./defaultpfp.png', media_type='image/png')
    #bucket = "yamlpfps111"  # replace with your bucket name
    #key = f"pfp_{user_id}.png"  # replace with your key pattern
    #result = get_s3_object(bucket, key)
    
    #if "error" in result:
    #    return FileResponse('./defaultpfp.png', media_type='image/png')
    #else:
    #    return FileResponse('./' + key, media_type='image/png')