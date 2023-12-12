import binascii
import hashlib
import json
import logging
from fastapi import Depends, HTTPException, APIRouter, Depends, Query
from fastapi.responses import FileResponse
from psycopg2 import IntegrityError
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST
from api_models import AuthDetails, SignUpUser, UsernameAvailability
from sqlalchemy.orm import declarative_base, joinedload, sessionmaker
import re

from database.database_initializer import User, Post
from database.database_session import SessionLocal



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
async def create_user(user: SignUpUser):
    """
    Creates a new user in the database if the provided email is not already in use.

    Args:
        user (SignUpUser): A SignUpUser object containing the email and password of the user to be created.

    Returns:
        dict: A dictionary containing the ID of the newly created user.

    Raises:
        HTTPException: If a user with the same email already exists in the database.
    """
    with SessionLocal() as session:
        existing_user = session.query(User).filter(User.email == user.email).first()
        if existing_user is not None:
            raise HTTPException(status_code=400, detail="Email already in use")
        try:
            db_user = User(**user.dict())    
            session.add(db_user)
            session.commit()
            session.refresh(db_user)
            logging.info(f"Created user with username {db_user.account_name}")
            logging.info("Created user")
            return {"id": db_user.id}
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=400, detail="Email already in use")
 
def validate_username(username):
    # Define username constraints
    MIN_LENGTH = 3
    MAX_LENGTH = 30
    RESERVED_USERNAMES = {'admin', 'user', 'root'}
    NONO_WORDS = {}

    # Check length constraints
    if not (MIN_LENGTH <= len(username) <= MAX_LENGTH):
        return False

    # Regular expression for validation
    # Starts with an alphabet, followed by alphanumeric or underscores, no consecutive underscores
    if not re.match(r'^[A-Za-z]\w*(?:_?\w+)*$', username):
        return False

    # Check for reserved words
    if username.lower() in RESERVED_USERNAMES:
        return False
    
    if username.lower() in NONO_WORDS:
        return False

    return True

@router.get("/check-username", response_model=UsernameAvailability)
async def check_username(username: str = Query(..., description="The username to check for availability")):
    session = SessionLocal()

    try:
        if not validate_username(username):
            raise HTTPException(status_code=400, detail="Invalid username")

        user_exists = session.query(session.query(User).filter(User.account_name == username).exists()).scalar()

        if user_exists:
            return {"available": False}
        else:
            return {"available": True}
    finally:
        session.close()

@router.post("/auth")
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

def get_s3_object(bucket, key):
    return 
    #s3 = boto3.client('s3')

    #try:
    #    s3.download_file(bucket, key, './' + key)
    #except botocore.exceptions.ClientError as e:
    #    print(f"Error getting object {key} from bucket {bucket}. Make sure they exist and your bucket is in the same region as this function.")
    #    print(e)
    #    return {"error": "Could not download file"}

@router.get("/user/{user_id}/profile_picture")
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

@router.get("/user/{user_id}/username")
def get_username(user_id: int):
    session = SessionLocal()
    user = session.query(User).get(user_id)
    session.close()
    return {"username": user.account_name}

