from fastapi import Response, status
import binascii
import hashlib
import io
import json
import logging
from fastapi import Depends, File, HTTPException, APIRouter, Depends, Query, UploadFile
from fastapi.responses import FileResponse
from psycopg2 import IntegrityError
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST
from api_models import AuthDetails, SignUpUser, UsernameAvailability
from sqlalchemy.orm import declarative_base, joinedload, sessionmaker
import re

from PIL import Image

from database.database_initializer import User, Post
from database.database_session import SessionLocal

import boto3

import os
from dotenv import load_dotenv

load_dotenv('varsfordb.env')  

aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')


s3_client = boto3.client(
    's3',
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)
bucket_name = os.getenv('BUCKET_NAME')

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



router = APIRouter()

@router.get("/users")
def read_users(db: Session = Depends(get_db)):
    """
    Retrieves a list of users from the database and returns the user data as a JSON response.

    Args:
        db (Session): A SQLAlchemy session object that represents a connection to the database.

    Returns:
        List[Dict[str, Any]]: A list of user dictionaries as the response if the query is successful.
        Dict[str, str]: An error message as a JSON response if an exception occurs during the query.
    """
    try:
        users = db.query(User).filter(User.id > 0).all()
        return [user.to_dict() for user in users]
    except Exception as e:
        # Handle the exception here
        return {"status": "error", "message": str(e)}


@router.post("/signup")
async def create_user(user: SignUpUser, db: Session = Depends(get_db)):
    """
    Creates a new user in the database if the provided email is not already in use.

    Args:
        user (SignUpUser): A SignUpUser object containing the email and password of the user to be created.
        db (Session): The database session.

    Returns:
        dict: A dictionary containing the ID of the newly created user.

    Raises:
        HTTPException: If a user with the same email already exists in the database.
    """

    """
    Username constraints:
    2 < length < 30
    Starts with an alphabet, followed by alphanumeric or underscores, no consecutive underscores
    Not a reserved word
    """
    existing_user_email = db.query(User.email).filter(User.email == user.email).first()
    if existing_user_email is not None:
        raise HTTPException(status_code=421, detail="Invalid details")
    if user.email == "":
        raise HTTPException(status_code=400, detail="Invalid details")  
    if not validate_username(user.account_name):
        raise HTTPException(status_code=400, detail="Invalid details")
    if not validate_username(user.display_name):
        raise HTTPException(status_code=400, detail="Invalid details")
    
    try:
        db_user = User(**user.model_dump())    
        db.add(db_user)
        db.flush()
        db.commit()
        logging.info(f"Created user with username {db_user.account_name} and created user")
        return {"id": db_user.id}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=444, detail="Invalid details")
 
def validate_username(username):
    # Define username constraints
    MIN_LENGTH = 3
    MAX_LENGTH = 30
    RESERVED_USERNAMES = ['admin', 'user', 'root']
    NONO_WORDS = []

    # Check length constraints
    if not (MIN_LENGTH <= len(username) <= MAX_LENGTH):
        return False

    # Regular expression for validation
    # Starts with an alphabet, followed by alphanumeric or underscores, no consecutive underscores
    if not re.match(r'^[A-Za-z]\w*(?:_?\w+)*$', username):
        return False
    
    if '__' in username:
        return False

    # Check for reserved words
    if username.lower() in RESERVED_USERNAMES:
        return False
    
    if username.lower() in NONO_WORDS:
        return False

    return True

@router.get("/check-username", response_model=UsernameAvailability)
async def check_username(username: str = Query(..., description="The username to check for availability"), session: Session = Depends(get_db)):
    try:
        if not validate_username(username):
            raise HTTPException(status_code=400, detail="Invalid username")

        user_exists = session.query(User.account_name).filter(User.account_name == username).first()

        if user_exists:
            return {"available": False}
        else:
            return {"available": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error querying the database") from e

@router.post("/auth")
async def authenticate_user(auth_details: AuthDetails, db: Session = Depends(get_db)):
    try:
        print("1")
        # Fetch the user from the database
        db_user = db.query(User).filter(User.account_name == auth_details.username).first()

        # If the user doesn't exist, raise an HTTPException
        if not db_user:
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

        # If the password is incorrect, raise an HTTPException
        print(hashed_password_hex)
        print(db_user.password_hash)
        if hashed_password_hex != db_user.password_hash:
            print("6")
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # If the username and password are correct, return the user details
        return {"id": db_user.id, "name": db_user.display_name, "email": db_user.email}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error querying the database") from e

@router.get("/user/{user_id}/posts")
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

@router.post("/user/{user_id}/profile_picture")
async def upload_profile_picture(user_id: int, file: UploadFile = File(...)):
    try:
        # Read the image file into a PIL Image object
        image = Image.open(file.file)

        # Convert to RGB if the image has an alpha channel (as webp supports alpha channel in lossless mode)
        if image.mode in ['RGBA', 'LA'] or (image.mode == 'P' and 'transparency' in image.info):
            image = image.convert('RGBA')
        else:
            image = image.convert('RGB')

        # Prepare the file to save
        in_mem_file = io.BytesIO()

        # Save the image to the in-memory file in webp format
        image.save(in_mem_file, format='webp')
        in_mem_file.seek(0)  # Go to the start of the in-memory file for reading

        # Define the S3 key (filename) with the .webp extension
        s3_key = f"profile_pictures/{user_id}.webp"

        # Upload the in-memory file to S3
        s3_client.upload_fileobj(in_mem_file, bucket_name, s3_key)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Upload successful", "file_name": s3_key}


@router.get("/user/{user_id}/profile_picture")
def get_profile_picture(user_id: int):
    s3_key = f"profile_pictures/{user_id}.webp"  # Assuming webp format

    # Check if the file exists in S3
    try:
        s3_client.head_object(Bucket=bucket_name, Key=s3_key)
        print("File found in S3")
    except:
        # Return a default image if the specific user's image doesn't exist
        return FileResponse('static/defaultpfp.png', media_type='image/png')

    # Generate a presigned URL for the S3 object
    presigned_url = s3_client.generate_presigned_url('get_object', 
                                                     Params={'Bucket': bucket_name, 'Key': s3_key}, 
                                                     ExpiresIn=3600)

    return {"url": presigned_url}

@router.get("/user/{user_id}/username")
def get_username(user_id: int, db: Session = Depends(get_db)):
    try:
        print("1")
        user = db.query(User).get(user_id)
        print("2")
        if user is None:
            print("3")
            raise HTTPException(status_code=404, detail=str(e)) 
        else:
            print("4")
            return {"username": user.display_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

