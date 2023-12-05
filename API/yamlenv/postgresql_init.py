from sqlalchemy import Column, Integer, String, DateTime, create_engine, ForeignKey, Table
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.orm import backref
from sqlalchemy.orm import Session



import os
from dotenv import load_dotenv
from sqlalchemy import inspect, MetaData

# Check if the script is being run by Docker Compose
if os.getenv('COMPOSE_PROJECT_NAME'):
    # If the script is being run by Docker Compose, load the environment variables from the .env file
    postgres_user = os.getenv('POSTGRES_USER')
    postgres_password = os.getenv('POSTGRES_PASSWORD')
    postgres_db = os.getenv('POSTGRES_DB')
    #load_dotenv('.env')
else:
    # If the script is not being run by Docker Compose, load the environment variables from the Docker environment
    postgres_password = ''
    postgres_user = 'postgres'
    postgres_db = 'postgres'

print(postgres_user)


Base = declarative_base()



class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    account_name = Column(String)

    display_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

    password_hash = Column(String)
    iterations = Column(Integer)
    salt = Column(String)

    profile_picture = Column(String, nullable=True)
    bio = Column(String, nullable=True)

    # Define relationships

    posts = relationship("Post", back_populates="poster")



class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True)

    user_poster_id = Column(Integer, ForeignKey('users.id'))
    date_of_post = Column(DateTime(timezone=True), default=func.now())
    content = Column(String)
    likes_count = Column(Integer, default=0)

    poster = relationship("User", back_populates="posts")
        
    reply_to = Column(Integer, ForeignKey('posts.id'))  # New field
    replies = relationship('Post', backref=backref('parent', remote_side=[id]))





post_likes = Table(
    'post_likes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('post_id', Integer, ForeignKey('posts.id'))
)

User.liked_posts = relationship(
    "Post",
    secondary=post_likes,
    lazy='dynamic'
)

Post.liked_by = relationship(
    "User",
    secondary=post_likes,
    lazy='dynamic'
)

def main():
    engine = create_engine(f'postgresql://postgres:{postgres_password}@localhost:5432/mydatabase')
    session = Session(bind=engine)
    Base.metadata.create_all(engine)
    def print_all_table_names(engine):
        inspector = inspect(engine)
        print(inspector.get_table_names())
    print_all_table_names(engine)

if __name__ == "__main__":
    main()