from sqlalchemy import Column, Integer, String, DateTime, create_engine, ForeignKey, Table
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.orm import backref
from sqlalchemy.orm import Session



import os
from dotenv import load_dotenv
from sqlalchemy import inspect


load_dotenv('A:/Cloud/Terraform/AWS Project2/scripts/yamlenv/varsfordb.env')  # replace with your .env file name

postgres_user = os.getenv('POSTGRES_USER')
postgres_password = os.getenv('POSTGRES_PASSWORD')
postgres_db = os.getenv('POSTGRES_DB')

print(postgres_user)


Base = declarative_base()

post_likes = Table(
    'post_likes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('post_id', Integer, ForeignKey('posts.id'))
)


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

    posts = relationship("Post", backref="user")
    liked_posts = relationship(
        "Post",
        secondary=post_likes,
        backref=backref("liked_by", lazy='dynamic')
    ) 


class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True)

    user_poster_id = Column(Integer, ForeignKey('users.id'))
    date_of_post = Column(DateTime(timezone=True), default=func.now())
    content = Column(String)
    likes_count = Column(Integer, default=0)

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