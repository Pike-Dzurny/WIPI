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


import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import botocore

from fastapi.responses import FileResponse

from postgresql_init import User, Post

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
    username: str
    post_content: str

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

class UsernameAvailability(BaseModel):
    available: bool


class PostBase(BaseModel):
    user_poster_id: int
    content: str

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
    return {"message": "User created successfully"}

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

        db_post = Post(user=user, content=user_post.post_content)
        session.add(db_post)
        session.commit()
        session.close()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

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
        if post in user.liked_posts:
            # If the post is already liked by the user, unlike it
            logging.info("unliking")
            user.liked_posts.remove(post)
        else:
            # If the post is not liked by the user, like it
            logging.info("liking")
            user.liked_posts.append(post)
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

@app.get("/posts")
def read_posts(page: int = 1, per_page: int = 6):
    offset = (page - 1) * per_page
    session = SessionLocal()
    posts = session.query(Post).options(joinedload(Post.user)).offset(offset).limit(per_page).all()
    session.close()
    return posts

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
    s3 = boto3.client('s3')

    try:
        s3.download_file(bucket, key, './' + key)
    except botocore.exceptions.ClientError as e:
        print(f"Error getting object {key} from bucket {bucket}. Make sure they exist and your bucket is in the same region as this function.")
        print(e)
        return {"error": "Could not download file"}

@app.get("/user/{user_id}/profile_picture")
def get_profile_picture(user_id: int):
    if user_id == 0:
        return FileResponse('./defaultpfp.png', media_type='image/png')
    bucket = "yamlpfps111"  # replace with your bucket name
    key = f"pfp_{user_id}.png"  # replace with your key pattern
    result = get_s3_object(bucket, key)
    
    if "error" in result:
        return FileResponse('./defaultpfp.png', media_type='image/png')
    else:
        return FileResponse('./' + key, media_type='image/png')