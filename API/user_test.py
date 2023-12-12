from fastapi.testclient import TestClient
from app import app  # Import the FastAPI app
from endpoints.users import *

from unittest.mock import MagicMock, AsyncMock



import pytest

# Assuming your main FastAPI application instance is named `app`
client = TestClient(app)

print("Testing")

print(client)
# Fixture for test client
@pytest.fixture
def test_client():
    return client

# Global variable to hold the mock database session
db_mock = MagicMock()
db_mock.query = AsyncMock()  # Mock async database operations as needed


def mock_get_db():
    yield db_mock

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
    async def test_unique_email_returns_id(self, mocker):

        # Create a mock database session
        mock_db = MagicMock()

        # Mock the get_db function
        mocker.patch("endpoints.users.get_db", side_effect=mock_get_db)

        # Create a SignUpUser object with unique email
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User",
            email="test@example.com",
            password_hash="password_hash",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function
        response = await create_user(user)

        # Assert that the response contains the ID of the newly created user
        assert "id" in response

    # Creating a new user with unique email should add the user to the database.
    @pytest.mark.asyncio
    async def test_unique_email_adds_user_to_database(self, mocker):
        # Mock the get_db function
        mocker.patch("endpoints.users.get_db", side_effect=mock_get_db)

        # Create a SignUpUser object with unique email
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User",
            email="test@example.com",
            password_hash="password_hash",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function
        await create_user(user)

        # Assert that the add method of the database session is called with the correct user object
        db_mock.return_value.add.assert_called_once_with(User(**user.dict()))

    # Creating a new user with unique email should log the creation of the user.
    @pytest.mark.asyncio
    async def test_unique_email_logs_user_creation(self, mocker, caplog):
        # Mock the get_db function
        mocker.patch("endpoints.users.get_db", side_effect=mock_get_db)

        # Create a SignUpUser object with unique email
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User",
            email="test@example.com",
            password_hash="password_hash",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function
        await create_user(user)

        # Assert that the log message contains the username and "created user"
        assert "Created user with username test_user" in caplog.text

    @pytest.mark.asyncio
    async def test_empty_email_raises_exception(self, mocker):
        # Mock the get_db function
        mocker.patch("endpoints.users.get_db", side_effect=mock_get_db)

        # Create a SignUpUser object with an empty email
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User",
            email="",
            password_hash="password_hash",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function and assert that it raises an exception
        with pytest.raises(Exception):
            await create_user(user)

    @pytest.mark.asyncio
    async def test_unique_account_name_returns_id(self, mocker):
        # Mock the get_db function
        mocker.patch("endpoints.users.get_db", side_effect=mock_get_db)

        # Create a SignUpUser object with a unique account name
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User",
            email="test@example.com",
            password_hash="password_hash",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function
        response = await create_user(user)

        # Assert that the response contains the ID of the newly created user
        assert "id" in response

    # Creating a new user with a password that does not meet the minimum requirements should raise an exception.
    @pytest.mark.asyncio
    async def test_weak_password_raises_exception(self, mocker):
        # Mock the get_db function
        mocker.patch("endpoints.users.get_db", side_effect=mock_get_db)

        # Create a SignUpUser object with a weak password
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User",
            email="test@example.com",
            password_hash="weak_password",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function and assert that it raises an exception
        with pytest.raises(Exception):
            await create_user(user)

    @pytest.mark.asyncio
    async def test_unique_display_name_adds_user_to_database(self, mocker):
        # Mock the get_db function
        mocker.patch("endpoints.users.get_db", side_effect=mock_get_db)

        # Create a SignUpUser object with a unique display name
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User",
            email="test@example.com",
            password_hash="password_hash",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function
        await create_user(user)

        # Assert that the add method of the database session is called with the correct user object
        db_mock.return_value.add.assert_called_once_with(User(**user.dict()))

    @pytest.mark.asyncio
    async def test_long_display_name_raises_exception(self, mocker):
        # Mock the get_db function
        mocker.patch("endpoints.users.get_db", side_effect=mock_get_db)

        # Create a SignUpUser object with a display name longer than 50 characters
        user = SignUpUser(
            account_name="test_user",
            display_name="Test User with a very long display name that exceeds 50 characters",
            email="test@example.com",
            password_hash="password_hash",
            iterations=1000,
            salt="salt"
        )

        # Call the create_user function and assert that it raises an exception
        with pytest.raises(Exception):
            await create_user(user)

        

