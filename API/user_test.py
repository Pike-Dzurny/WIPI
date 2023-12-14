import uuid
from app import app
from endpoints.users import *
import pytest


print("Testing")




# @pytest.fixture()
# def test_db():
#     Base.metadata.create_all(bind=engine)
#     yield
#     Base.metadata.drop_all(bind=engine)


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


class TestCreateUser:

    # Creating a new user with unique email should return a dictionary containing the ID of the newly created user.
    @pytest.mark.asyncio
    async def test_unique_email_returns_id(self, client):
        user_data = {
            "account_name": "test_user",
            "display_name": "Test User",
            "email": "naaaaa@gmail.com",
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        response = client.post("/signup", json=user_data)
        assert response.status_code == 200
        assert "id" in response.json()

    # Creating a new user with unique email should add the user to the database.
    @pytest.mark.asyncio
    async def test_unique_email_adds_user_to_database(self, client):
        # Create a SignUpUser object with unique email
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User",
            email="bingdabing@gmail.com",
            password_hash="password_hash",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function
        await create_user(user)

        # Assert that the add method of the database session is called with the correct user object
        client.add.assert_called_once_with(User(**user.dict()))

    # Creating a new user with unique email should log the creation of the user.
    @pytest.mark.asyncio
    async def test_unique_email_adds_user_to_database(self, client, session):
        user_data = {
            "account_name": "test_user",
            "display_name": "Test User",
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
            "display_name": "Test User",
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
            "display_name": "Test User",
            "email": random_email,
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        response = client.post("/signup", json=user)
        assert response.status_code == 200
        assert "id" in response.json()

    @pytest.mark.asyncio
    async def test_weak_password_raises_exception(self, client):
        random_email = f"test_{uuid.uuid4()}@example.com"
        user = {
            "account_name": "test_user",
            "display_name": "Test User",
            "email": random_email,
            "password_hash": "weak",
            "iterations": 1000,
            "salt": "salt"
        }

        response = client.post("/signup", json=user)
        assert response.status_code == 400  # Assuming 400 for weak password

    @pytest.mark.asyncio
    async def test_long_display_name_raises_exception(self, client):
        random_email = f"test_{uuid.uuid4()}@example.com"
        user = {
            "account_name": "test_user",
            "display_name": "Test User with a very long display name that exceeds 50 characters",
            "email": random_email,
            "password_hash": "password_hash",
            "iterations": 1000,
            "salt": "salt"
        }

        response = client.post("/signup", json=user)
        assert response.status_code == 400  # Assuming 400 for long display name

        

