import logging

# fastapi imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declarative_base

from endpoints.users import router as user_router
from endpoints.posts import router as posts_router

import boto3
import os

# The declarative_base() function returns a class that is used as a base class for our models
Base = declarative_base()

# FastAPI() is the main application object
app = FastAPI()
app.include_router(user_router)
app.include_router(posts_router)


# Origins for CORS
origins = [
    "http://localhost:3000",  
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