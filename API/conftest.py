from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.database_session import SessionLocal
from app import app
from database.database_initializer import Base
#from database.database_session import get_db
import pytest

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

TEST_DATABASE_URL = 'postgresql://postgres:pass@localhost:5432/mydatabase'
main_app = app 

def start_application():   # start application
  return main_app

SQLALCHEMY_DATABASE_URL = TEST_DATABASE_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)  # create engine

TestingSessionLocal  = sessionmaker(autocommit=False, autoflush=False, bind=engine)  # now we create test-session 


@pytest.fixture(scope="function")
def session():
   """
   Create a fresh database on each test case.
   """
   Base.metadata.drop_all(engine)    # drop that tables
   Base.metadata.create_all(engine)  # Create the tables.
   db = TestingSessionLocal()

   try:
       yield db
   finally:
       db.close()


@pytest.fixture()
def client(session):

    # Dependency override

    def override_get_db():
        try:

            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    yield TestClient(app)
