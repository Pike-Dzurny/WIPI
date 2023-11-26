from sqlalchemy import Column, Integer, String, DateTime, create_engine, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Session
from postgresql_init import User, Post
from datetime import datetime


engine = create_engine(f'postgresql://postgres:pass@localhost:5432/mydatabase')


def print_all_data(engine):
    # Create a new session
    session = Session(bind=engine)

    # Query all users
    users = session.query(User).all()
    print("Users:")
    for user in users:
        print(user)

    # Query all posts
    posts = session.query(Post).all()
    print("Posts:")
    for post in posts:
        print(post)

    session.close()

print_all_data(engine)