from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv('A:/Cloud/Terraform/AWS Project2/scripts/yamlenv/varsfordb.env')  # replace with your .env file name

postgres_user = os.getenv('POSTGRES_USER')
postgres_password = os.getenv('POSTGRES_PASSWORD')
postgres_db = os.getenv('POSTGRES_DB')


print(postgres_user)


# replace with your database details
engine = create_engine(f'postgresql://postgres:{postgres_password}@localhost:5432/postgres')


# try to connect to the database
connection = engine.connect()

print("Connection successful!")


with engine.connect() as conn:
    result = conn.execute(text("select 'hello world'"))
    print(result.all())

# close the connection
connection.close()
