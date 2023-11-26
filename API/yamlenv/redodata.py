import boto3

# Create a DynamoDB resource pointing to your local instance
dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:8123')

# Assuming your table names are 'Users' and 'Posts'
users_table = dynamodb.Table('Users')
posts_table = dynamodb.Table('Posts')

from datetime import datetime, timedelta, timezone


# Define your users and posts here
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

posts = [
    {
        'id': 1,
        'poster_uid': 1,
        'date_of_post': (datetime.now(timezone.utc) - timedelta(days=0)).isoformat(),
        'post_content': 'Hello, world! This is post 1.',
        'liked_by': [1, 2],
        'title': 'Post 1 Title',
        'content': 'Content for post 1'
    },
    {
        'id': 2,
        'poster_uid': 2,
        'date_of_post': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
        'post_content': 'Hello, world! This is post 2.',
        'liked_by': [2, 3],
        'title': 'Post 2 Title',
        'content': 'Content for post 2'
    },
    {
        'id': 3,
        'poster_uid': 2,
        'date_of_post': (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
        'post_content': 'Hello, world! This is post 3.',
        'liked_by': [2, 3],
        'title': 'Post 3 Title',
        'content': 'Content for post 3'
    },
    {
        'id': 4,
        'poster_uid': 2,
        'date_of_post': (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
        'post_content': 'Hello, world! This is post 4.',
        'liked_by': [2, 3],
        'title': 'Post 4 Title',
        'content': 'Content for post 4'
    },
    {
        'id': 5,
        'poster_uid': 2,
        'date_of_post': (datetime.now(timezone.utc) - timedelta(days=4)).isoformat(),
        'post_content': 'Hello, world! This is post 5.',
        'liked_by': [2, 3],
        'title': 'Post 5 Title',
        'content': 'Content for post 5'
    },
    {
        'id': 6,
        'poster_uid': 2,
        'date_of_post': (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
        'post_content': 'Hello, world! This is post 6.',
        'liked_by': [2, 3],
        'title': 'Post 6 Title',
        'content': 'Content for post 6'
    },
    {
        'id': 7,
        'poster_uid': 2,
        'date_of_post': (datetime.now(timezone.utc) - timedelta(days=6)).isoformat(),
        'post_content': 'Hello, world! This is post 7.',
        'liked_by': [2, 3],
        'title': 'Post 7 Title',
        'content': 'Content for post 7'
    }
    # ...
    # Continue this pattern for posts 8-20
]

# Delete all items from the Users table
response = users_table.scan()
with users_table.batch_writer() as batch:
    for item in response['Items']:
        batch.delete_item(
            Key={
                'uid': item['uid']
            }
        )

# Delete all items from the Posts table
response = posts_table.scan()
with posts_table.batch_writer() as batch:
    for item in response['Items']:
        batch.delete_item(
            Key={
                'id': item['id']
            }
        )

# Now you can repopulate the tables
for user in users:
    users_table.put_item(Item=user)

for post in posts:
    posts_table.put_item(Item=post)

print("Tables wiped and repopulated!")