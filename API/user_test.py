import os
import uuid

from httpx import patch
from app import app
from endpoints.users import *
import pytest

def hash_password(password):
    # Generate a random 16-byte salt
    salt = os.urandom(16)
    salt_hex = salt.hex()  # Convert salt to hexadecimal string
    salt = salt_hex.encode('utf-8')  # Convert salt to bytes

    # Set up the parameters
    iterations = 1000
    keylen = 64  # length of the derived key
    digest = 'sha512'  # hash function to use

    # Hash the password
    hashed_password = hashlib.pbkdf2_hmac(digest, password.encode('utf-8'), salt, iterations, dklen=keylen)
    
    # Convert the hashed password to a hex string
    hashed_password_hex = binascii.hexlify(hashed_password).decode('utf-8')

    return hashed_password_hex, salt_hex




# Tests for the read_users function ie the /users endpoint
class TestReadUsers:

    # Returns a list of user dictionaries if the query is successful.
    def test_returns_list_of_user_dictionaries(self, mocker):
        # Mock the database session
        mock_db = mocker.Mock()
        mocker.patch('endpoints.users.get_db', return_value=mock_db)

        # Mock the query result
        mock_user1 = mocker.Mock()
        mock_user1.to_dict.return_value = {'id': 1, 'account_name': 'user1'}
        mock_user2 = mocker.Mock()
        mock_user2.to_dict.return_value = {'id': 2, 'account_name': 'user2'}
        mock_users = [mock_user1, mock_user2]
        mock_db.query.return_value.filter.return_value.all.return_value = mock_users

        # Invoke the function under test
        result = read_users(db=mock_db)

        # Assert the result
        assert result == [{'id': 1, 'account_name': 'user1'}, {'id': 2, 'account_name': 'user2'}]

    # Returns an empty list if there are no users in the database.
    def test_returns_empty_list_if_no_users(self, mocker):
        # Mock the database session
        mock_db = mocker.Mock()
        mocker.patch('endpoints.users.get_db', return_value=mock_db)

        # Mock the query result
        mock_users = []
        mock_db.query.return_value.filter.return_value.all.return_value = mock_users

        # Invoke the function under test
        result = read_users(db=mock_db)

        # Assert the result
        assert result == []

    # Returns an error message if the database connection fails.
    def test_returns_error_message_if_database_connection_fails(self, mocker):
        # Mock the database session
        mock_db = mocker.Mock()
        mock_db.query.side_effect = Exception('Database connection failed')
        mocker.patch('endpoints.users.get_db', return_value=mock_db)

        # Invoke the function under test
        result = read_users(db=mock_db)

        # Assert the result
        assert result == {"status": "error", "message": "Database connection failed"}

    # Returns an error message if the query fails.
    def test_returns_error_message_if_query_fails(self, mocker):
        # Mock the database session
        mock_db = mocker.Mock()
        mock_db.query.side_effect = Exception('Query failed')
        mocker.patch('endpoints.users.get_db', return_value=mock_db)

        # Invoke the function under test
        result = read_users(db=mock_db)

        # Assert the result
        assert result == {"status": "error", "message": "Query failed"}

    # Returns an error message if the query returns an unexpected result.
    def test_returns_error_message_if_query_returns_unexpected_result(self, mocker):
        # Mock the database session
        mock_db = mocker.Mock()
        mock_user = mocker.Mock()
        mock_user.to_dict.side_effect = Exception('Unexpected result')
        mock_db.query.return_value.filter.return_value.all.return_value = [mock_user]
        mocker.patch('endpoints.users.get_db', return_value=mock_db)

        # Invoke the function under test
        result = read_users(db=mock_db)

        # Assert the result
        assert result == {"status": "error", "message": "Unexpected result"}


# Tests for the create_user function ie the /signup endpoint
class TestCreateUser:

    # Creating a new user with unique email should return a dictionary containing the ID of the newly created user.
    @pytest.mark.asyncio
    async def test_unique_email_returns_id(self, client):
        user_data = {
            "account_name": "test_user",
            "display_name": "iamauser",
            "email": "naaaaa@gmail.com",
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        response = client.post("/signup", json=user_data)
        assert response.status_code == 200
        assert "id" in response.json()


    # Creating a new user with unique email should log the creation of the user.
    @pytest.mark.asyncio
    async def test_unique_email_adds_user_to_database(self, client, session):
        user_data = {
            "account_name": "test_user",
            "display_name": "iamauser",
            "email": "bingdabing@gmail.com",
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        # Make a request to the signup endpoint
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200

        # Query the database to check if the user was added
        db_user = session.query(User).filter(User.email == user_data["email"]).first()
        assert db_user is not None
        assert db_user.email == user_data["email"]

    @pytest.mark.asyncio
    async def test_empty_email_raises_exception(self, client):
        user = {
            "account_name": "test_user",
            "display_name": "iamauser",
            "email": "",
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        response = client.post("/signup", json=user)
        assert response.status_code == 400  # Assuming 400 for invalid input

    @pytest.mark.asyncio
    async def test_unique_account_name_returns_id(self, client):
        random_email = f"test_{uuid.uuid4()}@example.com"
        user = {
            "account_name": "test_user",
            "display_name": "iamauser",
            "email": random_email,
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        response = client.post("/signup", json=user)
        assert response.status_code == 200
        assert "id" in response.json()

    @pytest.mark.asyncio
    async def test_long_display_name_raises_exception(self, client):
        random_email = f"test_{uuid.uuid4()}@example.com"
        user = {
            "account_name": "test_user",
            "display_name": "Test_User_with_a_very_long_display_name_that_exceeds_50characters",
            "email": random_email,
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        response = client.post("/signup", json=user)
        assert response.status_code == 400  # Assuming 400 for long display name

# Tests for the validate_username function
class TestValidateUsername:

    # Should return True for a valid username that satisfies all constraints
    def test_valid_username(self):
        assert validate_username("valid_username") == True

    # Should return False for a username that violates the length constraint
    def test_length_constraint_violation(self):
        assert validate_username("a") == False

    # Should return False for a username that violates the regular expression constraint
    def test_regex_constraint_violation(self):
        assert validate_username("username!") == False

    # Should return False for a username that is too short (length < 3)
    def test_short_username(self):
        assert validate_username("ab") == False

    # Should return False for a username that is too long (length > 30)
    def test_long_username(self):
        assert validate_username("abcdefghijklmnopqrstuvwxyz123456") == False

    # Should return False for a username that starts with a non-alphabet character
    def test_non_alphabet_start(self):
        assert validate_username("1username") == False

    # Should return False for a username that is a reserved word
    def test_reserved_word_username(self):
        assert validate_username("admin") == False

    # Should return False for a username that contains consecutive underscores
    def test_consecutive_underscores_username(self):
        assert validate_username("username__test") == False

    # Should return False for a username that contains special characters
    def test_username_with_special_characters(self):
        assert validate_username("username@123") == False

    # Should return True for a username that contains an underscore
    def test_username_with_underscore(self):
        assert validate_username("username_123") == True

    # Should return True for a username that contains a digit
    def test_username_with_digit(self):
        assert validate_username("username123") == True

# Tests for the check_username function ie the /check-username endpoint
class TestCheckUsername:

    # Test when a valid and available username is provided.
    @pytest.mark.asyncio
    async def test_valid_and_available_username(self, client):
        response = client.get("/check-username", params={"username": "goodname"})
        assert response.status_code == 200
        assert response.json() == {"available": True}

    # Test when a valid but unavailable username is provided.
    @pytest.mark.asyncio
    async def test_valid_but_unavailable_username(self, client):

        user_data = {
            "account_name": "takenname",
            "display_name": "asdf",
            "email": "bingdabing@gmail.com",
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        # Make a request to the signup endpoint
        response = client.post("/signup", json=user_data)

        response = client.get("/check-username", params={"username": "takenname"})
        assert response.status_code == 200
        assert response.json() == {"available": False}

    # Test when an invalid username is provided.
    @pytest.mark.asyncio
    async def test_invalid_username(self, client):
        response = client.get("/check-username", params={"username": "_invalid==username!"})
        assert response.status_code == 500
        assert response.json() == {"detail": "Error querying the database"}

    # Test when a valid but non-existent username is provided.
    @pytest.mark.asyncio
    async def test_valid_but_nonexistent_username(self, client):
        response = client.get("/check-username", params={"username": "nonexistentuser"})
        assert response.status_code == 200
        assert response.json() == {"available": True}


    # Test when an empty string is provided as the username.
    @pytest.mark.asyncio
    async def test_empty_string_username(self, client):
        response = client.get("/check-username", params={"username": ""})
        assert response.status_code == 500
        assert response.json() == {"detail": "Error querying the database"}

# Tests for the authenticate_user function ie the /auth endpoint
class TestAuthenticateUser:

    # Authenticating a user with correct username and password
    @pytest.mark.asyncio
    async def test_authenticate_user_correct_credentials(self, client):
        # First, create a user
        account_name = "test_user"
        password = "correct_password"
        hashed_password, salt = hash_password(password)
        user_data = {
            "account_name": account_name,
            "display_name": "test_user",
            "email": "test_user@example.com",
            "password_hash": hashed_password,  
            "iterations": 1000,
            "salt": salt
        }
        client.post("/signup", json=user_data)

        # Now attempt to authenticate
        auth_details = {
            "username": account_name,
            "password": password  
        }
        response = client.post("/auth", json=auth_details)
        assert response.status_code == 200
        assert "id" in response.json()

    # Authenticating a user with incorrect username
    @pytest.mark.asyncio
    async def test_authenticate_user_incorrect_username(self, client):
        # First, create a user
        account_name = "test_user"
        password = "correct_password"
        hashed_password, salt = hash_password(password)
        user_data = {
            "account_name": account_name,
            "display_name": "test_user",
            "email": "test_user@example.com",
            "password_hash": hashed_password,  
            "iterations": 1000,
            "salt": salt
        }
        client.post("/signup", json=user_data)

        auth_details = {
            "username": "wrong_username",
            "password": password
        }
        response = client.post("/auth", json=auth_details)
        assert response.status_code == 500

    # Authenticating a user with incorrect password
    @pytest.mark.asyncio
    async def test_authenticate_user_incorrect_password(self, client):
        # First, create a user
        account_name = "test_user"
        password = "correct_password"
        hashed_password, salt = hash_password(password)
        user_data = {
            "account_name": account_name,
            "display_name": "test_user",
            "email": "test_user@example.com",
            "password_hash": hashed_password,  
            "iterations": 1000,
            "salt": salt
        }
        client.post("/signup", json=user_data)

        auth_details = {
            "username": account_name,
            "password": "wrongpassword"
        }

        response = client.post("/auth", json=auth_details)
        assert response.status_code == 500


# class TestProfilePicture:

#     @pytest.mark.asyncio
#     async def test_upload_profile_picture(self, client):
#         # test user with user_id = 1
#         user_id = 1
#         file_path = 'static/defaultpfp.png'

#         with open(file_path, 'rb') as file:
#             response = client.post(f"/user/{user_id}/profile_picture", files={"file": file})
#             print(response.json())
#             assert response.status_code == 200
#             assert response.json() == {"message": "Upload successful", "file_name": f"profile_pictures/{user_id}.webp"}
            

#     @pytest.mark.asyncio
#     async def test_get_profile_picture(self, client):
#         user_id = 1  # Replace with a test user ID
#         file_path = 'static/defaultpfp.png'  # Path to your test image

#         # Upload the image
#         with open(file_path, 'rb') as file:
#             response = client.post(f"/user/{user_id}/profile_picture", files={"file": (file_path, file, "image/png")})
#             assert response.status_code == 200
#             assert "message" in response.json()
#             assert "file_name" in response.json()
        
#         # Retrieve the uploaded image
#         response = client.get(f"/user/{user_id}/profile_picture")
#         assert response.status_code == 200
#         # The response should be a presigned URL, so we check if 'url' is in the response
#         assert "url" in response.json()
#         presigned_url = response.json()['url']
#         assert presigned_url is not None

#     @pytest.mark.asyncio
#     async def test_get_default_profile_picture(self, client):
#         user_id = 9999  # Assuming this user doesn't have a profile picture

#         # Retrieve the uploaded image
#         response = client.get(f"/user/{user_id}/profile_picture")
#         assert response.status_code == 200
#         # The response should be a presigned URL, so we check if 'url' is in the response
#         # If the content is binary (like an image), you should read it as bytes
#         content = response.content  # This is how you access the raw bytes

#         # Now you can write assertions based on the binary content
#         # For example, you can check if the content starts with the PNG header bytes
#         assert content.startswith(b'\x89PNG\r\n\x1a\n')  # PNG header
    
class TestGetUsername:
    
    @pytest.mark.asyncio
    async def test_returns_username_of_valid_user_id(self, client):
        # First, create a user
        account_name = "test_user"
        password = "correct_password"
        hashed_password, salt = hash_password(password)
        user_data = {
            "account_name": account_name,
            "display_name": "test_user",
            "email": "test_user@example.com",
            "password_hash": hashed_password,  
            "iterations": 1000,
            "salt": salt
        }
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200

        response = client.get(f"/user/{1}/username")

        
        assert response.status_code == 200
        assert response.json() == {"username": "test_user"}
    
    @pytest.mark.asyncio
    async def test_returns_error_message_if_user_id_not_found(self, client):
        # Use a user ID that does not exist
        response = client.get(f"/user/{1}/username")
        assert response.status_code == 500  # Assuming you return a 404 status for not found

    @pytest.mark.asyncio
    async def test_returns_error_message_if_user_id_not_integer(self, client):
        # Attempt to retrieve a username with an invalid user ID (non-integer)
        response = client.get(f"/user/notanumber/username")
        assert response.status_code == 422  # Unprocessable Entity for invalid parameters
        assert "detail" in response.json()

