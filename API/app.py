import json
from sqlalchemy.orm import Session
import binascii
import hashlib
import logging
import os
import re
# import boto3
# import botocore
# from botocore.exceptions import NoCredentialsError, ClientError
#import pytest
from sqlite3 import IntegrityError
from typing import Optional

# fastapi imports
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, desc, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declarative_base, joinedload, sessionmaker

# models and postgresql_init are in the same directory as this script
from api_models import AuthDetails, SignUpUser, UserPostBase, UsernameAvailability
from database.database_initializer import Post, User, post_likes

from endpoints.users import router as user_router
from endpoints.posts import router as posts_router

# The declarative_base() function returns a class that is used as a base class for our models
Base = declarative_base()

# FastAPI() is the main application object
app = FastAPI()
app.include_router(user_router)
app.include_router(posts_router)


# Origins for CORS
origins = [
    "http://localhost:3000",  # adjust to match the origins you need
    "http://frontend:3000",
    "*",
]

# Add the middleware to the FastAPI app
# Middleware is code that runs before the request is processed
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


logger = logging.getLogger("uvicorn")
logger.log(logging.INFO, "(Re?)starting App!")