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
from api_models import AuthDetails, SignUpUser, UpdateUsernameRequest, UsernameAvailability, PasswordChangeRequest
from sqlalchemy.orm import declarative_base, joinedload, sessionmaker
import re

from PIL import Image

from database.database_initializer import User, Post, followers
from database.database_session import SessionLocal

import boto3

import os
from dotenv import load_dotenv

from cachetools import TTLCache
import time

# TTLCache can hold a limited number of items, and each item expires after a certain time.
cache = TTLCache(maxsize=10000, ttl=3500)  # Adjust maxsize and ttl as needed

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


def hash_password(password: str, salt: str = None, iterations: int = 100000) -> tuple:
    """
    Hashes a password using PBKDF2 HMAC.

    Args:
        password (str): The password to be hashed.
        salt (str): The salt to be used in the hashing process. If None, a new salt will be generated.
        iterations (int): The number of iterations for the hashing process.

    Returns:
        tuple: The hashed password and the salt used.
    """
    if salt is None:
        salt = os.urandom(16)  # Generate a new salt if none is provided
    else:
        salt = binascii.unhexlify(salt)  # Decode the hex-encoded salt

    hashed_password = hashlib.pbkdf2_hmac(
        'sha512',
        password.encode('utf-8'),
        salt,
        iterations
    )
    hashed_password_hex = binascii.hexlify(hashed_password).decode('utf-8')
    salt_hex = binascii.hexlify(salt).decode('utf-8')
    return hashed_password_hex, salt_hex

def compare_passwords(hashed_password: str, password: str, salt: str, iterations: int) -> bool:
    """
    Compares a hashed password with a plain-text password.

    Args:
        hashed_password (str): The hashed password.
        password (str): The plain-text password to compare.
        salt (str): The salt used in the original hashing process.
        iterations (int): The number of iterations used in the original hashing process.

    Returns:
        bool: True if the passwords match, False otherwise.
    """
    new_hashed_password, _ = hash_password(password, salt, iterations)
    return hashed_password == new_hashed_password

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

@router.delete("/users/{user_id}/delete")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Deletes a user from the database if the provided user id exists.

    Args:
        user_id (int): The id of the user to be deleted.
        db (Session): The database session.

    Returns:
        dict: A dictionary containing a success message.

    Raises:
        HTTPException: If a user with the given id does not exist in the database.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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
        user_dict = user.model_dump()
        password = user_dict.pop('password', None)
        db_user = User(**user_dict)
        db.add(db_user)

        # Hash the password
        hashed_password, salt = hash_password(user.password)

        db_user.password_hash = hashed_password
        db_user.salt = salt
        db_user.iterations = 100000

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
    print("/auth'ing")
    try:
        print("1")
        # Fetch the user from the database
        db_user = db.query(User).filter(User.account_name == auth_details.username).first()
        # If the user doesn't exist, raise an HTTPException
        if not db_user:
            raise HTTPException(status_code=400, detail="Does not exist")

        # Verify the password
        salt = db_user.salt  # The salt is already encoded to bytes in the hash_password function
        iterations = db_user.iterations

        # Hash the password
        hashed_password_hex, _ = hash_password(auth_details.password, salt, iterations)

        # If the password is incorrect, raise an HTTPException
        if not compare_passwords(hashed_password_hex, auth_details.password, salt, iterations):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # If the username and password are correct, return the user details
        return {"id": db_user.id, "name": db_user.display_name, "email": db_user.email}
    except Exception as e:
        print(f"Exception occurred: {e}")
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


@router.get("/user/{user_id}/pfp")
def get_profile_picture(user_id: int):
    cache_key = f"profile_picture_{user_id}"
    presigned_url = cache.get(cache_key)

    if not presigned_url:
        s3_key = f"profile_pictures/{user_id}.webp"
        try:
            s3_client.head_object(Bucket=bucket_name, Key=s3_key)
        except:
            s3_key = f"profile_pictures/defaultpfp.webp"
            s3_client.head_object(Bucket=bucket_name, Key=s3_key)

        presigned_url = s3_client.generate_presigned_url('get_object',
                                                         Params={'Bucket': bucket_name, 'Key': s3_key},
                                                         ExpiresIn=3600)
        cache[cache_key] = presigned_url

    return {"url": presigned_url}



@router.post("/user/{user_id}/pfp")
async def upload_pfp(user_id: int, file: UploadFile = File(...)):
    try:
        # Image processing steps
        image = Image.open(file.file)
        # Log after opening the image
        print("Image opened successfully")

        # Convert to RGB if the image has an alpha channel
        if image.mode != 'RGB':
            if image.mode == 'RGBA':
                base = Image.new('RGB', image.size, 'white')
                image = Image.alpha_composite(base, image.convert('RGBA'))
            elif image.mode in ['LA', 'L']:
                image = image.convert('RGB')
            else:
                # For other modes like 'P', 'CMYK', etc., convert directly to RGB
                image = image.convert('RGB')


        # Resize the image to 256x256
        image = image.resize((256, 256))

        # Prepare the file to save
        in_mem_file = io.BytesIO()

        # Save the image to the in-memory file in webp format
        image.save(in_mem_file, format='webp')

        # Check the size of the in-memory file
        in_mem_file.seek(0, 2)  # Go to the end of the in-memory file
        size_in_kb = in_mem_file.tell() / 1024  # Get the size in kilobytes
        if size_in_kb > 1024:  # Replace 100 with your desired size limit in kilobytes
            raise HTTPException(status_code=400, detail="File size exceeds 1000 KB. Please select a smaller file.")

        in_mem_file.seek(0)  # Go to the start of the in-memory file for reading

        # Define the S3 key (filename) with the .webp extension
        s3_key = f"profile_pictures/{user_id}.webp"
        print(f"Uploading to S3 with key: {s3_key}")
        try:
            in_mem_file.seek(0)  # Ensure the file is at the beginning
            s3_client.upload_fileobj(in_mem_file, bucket_name, s3_key)
            print("Upload to S3 attempted successfully")
        except Exception as e:
            print("S3 upload failed: ", e)
            raise
        print("Upload to S3 attempted")

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Upload successful", "file_name": s3_key}


@router.get("/user/{user_id}/background")
def get_background(user_id: int):
    cache_key = f"background_{user_id}"
    presigned_url = cache.get(cache_key)

    if not presigned_url:
        s3_key = f"profile_pictures/{user_id}_background.webp"
        try:
            s3_client.head_object(Bucket=bucket_name, Key=s3_key)
        except:
            s3_key = f"profile_pictures/defaultbackground.webp"
            s3_client.head_object(Bucket=bucket_name, Key=s3_key)

        presigned_url = s3_client.generate_presigned_url('get_object',
                                                         Params={'Bucket': bucket_name, 'Key': s3_key},
                                                         ExpiresIn=3600)
        cache[cache_key] = presigned_url

    return {"url": presigned_url}

@router.post("/user/{user_id}/background")
async def upload_background(user_id: int, file: UploadFile = File(...)):
    try:
        # Image processing steps
        image = Image.open(file.file)
        # Log after opening the image
        print("Image opened successfully")

        print(image.mode)

        # Convert to RGB if the image has an alpha channel
        if image.mode != 'RGB':
            if image.mode == 'RGBA':
                print("Converting RGBA to RGB")
                base = Image.new('RGB', image.size, 'white')
                print("Created base image")
                print(f"Original image mode: {image.mode}")
                converted_image = image.convert('RGBA')
                print(f"Converted image mode: {converted_image.mode}")
                print("Converted image")
            elif image.mode in ['LA', 'L']:
                image = image.convert('RGB')
            else:
                try:
                    # For other modes like 'P', 'CMYK', etc., convert directly to RGB
                    image = image.convert('RGB')
                except Exception as e:
                    print(f"Failed to convert image mode to RGB: {e}")
                    raise HTTPException(status_code=400, detail="Failed to process image. Please upload an image in RGB or RGBA format.")


        # Resize the image to 384x216 a 16:9 ratio
        image = image.resize((384, 216))

        # Prepare the file to save
        in_mem_file = io.BytesIO()

        # Save the image to the in-memory file in webp format
        image.save(in_mem_file, format='webp')

        # Check the size of the in-memory file
        in_mem_file.seek(0, 2)  # Go to the end of the in-memory file
        size_in_kb = in_mem_file.tell() / 1024  # Get the size in kilobytes
        if size_in_kb > 1024:  # Replace 100 with your desired size limit in kilobytes
            raise HTTPException(status_code=400, detail="File size exceeds 1000 KB. Please select a smaller file.")

        in_mem_file.seek(0)  # Go to the start of the in-memory file for reading

        # Define the S3 key (filename) with the .webp extension
        s3_key = f"profile_pictures/{user_id}_background.webp"
        print(f"Uploading to S3 with key: {s3_key}")
        try:
            in_mem_file.seek(0)  # Ensure the file is at the beginning
            s3_client.upload_fileobj(in_mem_file, bucket_name, s3_key)
            print("Upload to S3 attempted successfully")
        except Exception as e:
            print("S3 upload failed: ", e)
            raise
        print("Upload to S3 attempted")

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Upload successful", "file_name": s3_key}




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

@router.get("/user/{user_id}/accountname")
def get_account_name(user_id: int, db: Session = Depends(get_db)):
    try:
        print("1")
        user = db.query(User).get(user_id)
        print("2")
        if user is None:
            print("3")
            raise HTTPException(status_code=404, detail=str(e)) 
        else:
            print("4")
            return {"accountname": user.account_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

    
@router.post("/user/{user_id}/username")
def update_username(user_id: int, request: UpdateUsernameRequest, db: Session = Depends(get_db)):
    print(user_id, request.username)
    user = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.display_name = request.username
    db.commit()
    return {"message": "Username updated successfully"}


@router.post("/user/{user_id}/email")
def update_email(user_id: int, new_email: str, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.email = new_email
    db.commit()
    return {"message": "Email updated successfully"}

@router.get("/user/{user_id}/follow_counts")
def get_follow_counts(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    following_count = db.query(followers).filter(followers.c.follower_id == user_id).count()
    followers_count = db.query(followers).filter(followers.c.followed_id == user_id).count()
    print("counts")
    print(following_count, followers_count)

    return {"followingCount": following_count, "followersCount": followers_count}


@router.post("/user/{user_id}/passwordchange")
def change_password(user_id: int, request: PasswordChangeRequest, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify the old password
    if not compare_passwords(user.password_hash, request.oldPassword, user.salt, user.iterations):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    # Hash the new password with a new salt
    hashed_new_password_hex, new_salt_hex = hash_password(request.newPassword)

    # Update the user's password and salt in the database
    user.password_hash = hashed_new_password_hex
    user.salt = new_salt_hex
    db.commit()

    return {"message": "Password changed successfully"}

@router.get("/user/{user_id}/followers")
def get_followers(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    followers_list = db.query(followers).filter(followers.c.followed_id == user_id).all()
    followers_list = [db.query(User).get(follower.follower_id).to_dict() for follower in followers_list]

    return followers_list

@router.get("/user/{user_id}/following")
def get_following(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    following_list = db.query(followers).filter(followers.c.follower_id == user_id).all()
    following_list = [db.query(User).get(following.followed_id).to_dict() for following in following_list]

    return following_list

@router.post("/user/{user_id}/follow")
def follow_user(user_id: int, request: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user_to_follow = db.query(User).get(request)
    if user_to_follow is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user is already following the other user
    existing_follow = db.query(followers).filter(followers.c.follower_id == user_id, followers.c.followed_id == request).first()
    if existing_follow is not None:
        raise HTTPException(status_code=400, detail="Already following user")

    # Add the follow to the database
    db.execute(followers.insert().values(follower_id=user_id, followed_id=request))
    db.commit()

    return {"message": "Followed user successfully"}

@router.post("/user/{user_id}/unfollow")
def unfollow_user(user_id: int, request: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user_to_unfollow = db.query(User).get(request)
    if user_to_unfollow is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user is already following the other user
    existing_follow = db.query(followers).filter(followers.c.follower_id == user_id, followers.c.followed_id == request).first()
    if existing_follow is None:
        raise HTTPException(status_code=400, detail="Not following user")

    # Remove the follow from the database
    db.execute(followers.delete().where(followers.c.follower_id == user_id, followers.c.followed_id == request))
    db.commit()

    return {"message": "Unfollowed user successfully"}

