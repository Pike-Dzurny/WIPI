from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Retrieve the DATABASE_URL from the environment variables
# If the DATABASE_URL is not found, fall back to a default or throw an error
# Then create the SQLAlchemy engine using the DATABASE_URL
# postgresql://postgres:pass@db:5432/mydatabase

database_url = os.getenv('DATABASE_URL')
if not database_url:
    raise ValueError("DATABASE_URL environment variable not found")

#engine = create_engine('postgresql://postgres:pass@localhost:5432/mydatabase')
engine = create_engine(database_url)

# SessionLocal is a class that can be used to create a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)