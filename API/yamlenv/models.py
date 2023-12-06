import boto3
import time

# Create a DynamoDB resource pointing to your local instance
dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:8123')




print("Creating tables...")

# Create the Users table
users_table = dynamodb.create_table(
    TableName='Users',
    KeySchema=[
        {
            'AttributeName': 'uid',
            'KeyType': 'HASH'
        },
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'uid',
            'AttributeType': 'N'
        },
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

# Create the Posts table
posts_table = dynamodb.create_table(
    TableName='Posts',
    KeySchema=[
        {
            'AttributeName': 'id',
            'KeyType': 'HASH'
        },
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'id',
            'AttributeType': 'N'
        },
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

# Wait until the tables exist
print("Waiting for tables to be created...")

time.sleep(5)

print("Tables created!")
# Populate the Users table
users = [
    {
        'uid': 1,
        'account_name': 'user1',
        'username': 'user1',
        'email': 'user1@example.com',
        'password_hash': 'hash1',
        'profile_picture': 'url1'
    },
    {
        'uid': 2,
        'account_name': 'user2',
        'username': 'user2',
        'email': 'user2@example.com',
        'password_hash': 'hash2',
        'profile_picture': 'url2'
    },
    {
        'uid': 3,
        'account_name': 'user3',
        'username': 'user3',
        'email': 'user3@example.com',
        'password_hash': 'hash3',
        'profile_picture': 'url3'
    },
    {
        'uid': 4,
        'account_name': 'user4',
        'username': 'user4',
        'email': 'user4@example.com',
        'password_hash': 'hash4',
        'profile_picture': 'url4'
    },
    {
        'uid': 5,
        'account_name': 'user5',
        'username': 'user5',
        'email': 'user5@example.com',
        'password_hash': 'hash5',
        'profile_picture': 'url5'
    },
]



# Populate the Posts table
posts = [
    {
        'id': i,
        'poster_uid': i % 5 + 1,  # Cycle through user UIDs
        'date_of_post': f'2023-01-{i:02}',  # Use i to generate different dates
        'post_content': f'Hello, world! This is post {i}.',
        'liked_by': [1, 2, 3, 4, 5]  # All users like all posts
    }
    for i in range(1, 21)  # Generate 20 posts
]

for user in users:
    users_table.put_item(Item=user)

for post in posts:
    posts_table.put_item(Item=post)


print("Tables populated!")