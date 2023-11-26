from sqlalchemy import Column, Integer, String, DateTime, create_engine, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Session
from postgresql_init import User, Post
from datetime import datetime


engine = create_engine(f'postgresql://postgres:pass@localhost:5432/mydatabase')

def populate_db(engine):
    # Create a new session
    session = Session(bind=engine)

    # Create some users
    user1 = User(
        account_name='JohnsAccount',
        display_name='John',
        email='john@example.com',
        password_hash='hashed_password',
        iterations=1000,
        salt='salt',
        profile_picture=None,
        bio='Bio for John'
    )

    user2 = User(
        account_name='JanesAccount',
        display_name='Jane',
        email='jane@example.com',
        password_hash='hashed_password',
        iterations=1000,
        salt='salt',
        profile_picture=None,
        bio='Bio for Jane'
    )

    user3 = User(
        account_name='ManesAccount',
        display_name='Mane',
        email='mane@example.com',
        password_hash='hashed_password',
        iterations=1000,
        salt='salt',
        profile_picture=None,
        bio='Bio for Mane'
    )

    user4 = User(
        account_name='BlanesAccount',
        display_name='Blane',
        email='blane@example.com',
        password_hash='hashed_password',
        iterations=1000,
        salt='salt',
        profile_picture=None,
        bio='Bio for Blane'
    )

    # Add the users to the session
    session.add(user1)
    session.add(user2)
    session.add(user3)
    session.add(user4)


    post = Post(content=f'Hello, world! Brah', user=user1)
    session.add(post)

    post = Post(content=f'Hello, world! Dah!', user=user2)
    session.add(post)

    post = Post(content=f'Hello, world! Fah!', user=user3)
    session.add(post)

    post = Post(content=f'Hello, world! Rah!', user=user4)

    session.add(post)
    post = Post(content=f'You know I am very tired. Like so so tired! What about you all?', user=user3)

    session.add(post)
    post = Post(content=f'Minion what?', user=user3)
    session.add(post)

    post = Post(content=f'I am going on a walk... a LONG walk. ', user=user1)
    session.add(post)

    post = Post(content=f'My feelings for the world are thiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiis long', user=user2)
    session.add(post)
    post = Post(content=f'Mine are even longer at THISSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS long', user=user1)
    session.add(post)

    post = Post(content=f'Sooooooooooooooooooooooo fired?', user=user2)
    session.add(post)

    post = Post(content=f'Hello, world! Brah', user=user1)
    session.add(post)

    post = Post(content=f'Hello, world! Dah!', user=user2)
    session.add(post)

    post = Post(content=f'Hello, world! Fah!', user=user3)
    session.add(post)

    post = Post(content=f'Hello, world! Rah!', user=user4)

    session.add(post)
    post = Post(content=f'Hello, world! Brah', user=user1)
    session.add(post)

    post = Post(content=f'Hello, world! Dah!', user=user2)
    session.add(post)

    post = Post(content=f'Hello, world! Fah!', user=user3)
    session.add(post)

    post = Post(content=f'Hello, world! Rah!', user=user4)

    session.add(post)


    # Commit the session to write the changes to the database
    session.commit()

# Call the function to populate the database
populate_db(engine)