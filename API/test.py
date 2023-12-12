
from script import create_user
from models import SignUpUser
from postgresql_init import User
from fastapi import HTTPException


# Dependencies:
# pip install pytest-mock
import pytest

class TestCreateUser:

    # Creating a new user with unique email should return a dictionary containing the ID of the newly created user.
    @pytest.mark.asyncio
    async def test_unique_email_returns_dict_with_id(self, mocker):
        # Arrange
        mock_session = mocker.Mock()
        mock_query = mocker.Mock()
        mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        mock_user = mocker.Mock()
        mock_user.id = 1
        mock_session.add.return_value = None
        mock_session.commit.return_value = None
        mock_session.refresh.return_value = None
        mocker.patch('script.SessionLocal', return_value=mock_session)
        mocker.patch('postgresql_init.User', return_value=mock_user)
    
        # Act
        result = await create_user(SignUpUser(
            account_name="test",
            display_name="Test User",
            email="test@example.com",
            password_hash="hash",
            iterations=1000,
            salt="salt"
        ))
    
        # Assert
        assert result == {"id": 1}
        mock_session.query.assert_called_once_with(User)
        mock_query.filter.assert_called_once_with(User.email == "test@example.com")
        mock_session.add.assert_called_once_with(mock_user)
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(mock_user)

    # Creating a new user with unique email should add the user to the database.
    @pytest.mark.asyncio
    async def test_unique_email_adds_user_to_database(self, mocker):
        # Arrange
        mock_session = mocker.Mock()
        mock_query = mocker.Mock()
        mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        mock_user = mocker.Mock()
        mock_user.id = 1
        mock_session.add.return_value = None
        mock_session.commit.return_value = None
        mock_session.refresh.return_value = None
        mocker.patch('API.yamlenv.script.SessionLocal', return_value=mock_session)
        mocker.patch('API.yamlenv.script.User', return_value=mock_user)
    
        # Act
        await create_user(SignUpUser(
            account_name="test",
            display_name="Test User",
            email="test@example.com",
            password_hash="hash",
            iterations=1000,
            salt="salt"
        ))
    
        # Assert
        mock_session.add.assert_called_once_with(mock_user)
        mock_session.commit.assert_called_once()

    # Creating a new user with unique email should log the creation of the user.
    @pytest.mark.asyncio
    async def test_unique_email_logs_user_creation(self, mocker):
        # Arrange
        mock_session = mocker.Mock()
        mock_query = mocker.Mock()
        mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        mock_user = mocker.Mock()
        mock_user.id = 1
        mock_session.add.return_value = None
        mock_session.commit.return_value = None
        mock_session.refresh.return_value = None
        mocker.patch('API.yamlenv.script.SessionLocal', return_value=mock_session)
        mocker.patch('API.yamlenv.script.User', return_value=mock_user)
        mock_logging = mocker.patch('API.yamlenv.script.logging')
    
        # Act
        await create_user(SignUpUser(
            account_name="test",
            display_name="Test User",
            email="test@example.com",
            password_hash="hash",
            iterations=1000,
            salt="salt"
        ))
    
        # Assert
        mock_logging.info.assert_called_once_with("Created user with username test")

    # Creating a new user with an email that already exists in the database should raise an HTTPException with status code 400 and detail "Email already in use".
    @pytest.mark.asyncio
    async def test_existing_email_raises_http_exception(self, mocker):
        # Arrange
        mock_session = mocker.Mock()
        mock_query = mocker.Mock()
        mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = mocker.Mock()
        mocker.patch('API.yamlenv.script.SessionLocal', return_value=mock_session)
    
        # Act and Assert
        with pytest.raises(HTTPException) as exc_info:
            await create_user(SignUpUser(
                account_name="test",
                display_name="Test User",
                email="test@example.com",
                password_hash="hash",
                iterations=1000,
                salt="salt"
            ))
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email already in use"

    # Creating a new user with an email that already exists in the database should not add the user to the database.
    @pytest.mark.asyncio
    async def test_existing_email_does_not_add_user_to_database(self, mocker):
        # Arrange
        mock_session = mocker.Mock()
        mock_query = mocker.Mock()
        mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = mocker.Mock()
        mocker.patch('API.yamlenv.script.SessionLocal', return_value=mock_session)
    
        # Act
        with pytest.raises(HTTPException):
            await create_user(SignUpUser(
                account_name="test",
                display_name="Test User",
                email="test@example.com",
                password_hash="hash",
                iterations=1000,
                salt="salt"
            ))
    
        # Assert
        mock_session.add.assert_not_called()
        mock_session.commit.assert_not_called()

    # Creating a new user with an email that already exists in the database should not log the creation of the user.
    @pytest.mark.asyncio
    async def test_existing_email_does_not_log_user_creation(self, mocker):
        # Arrange
        mock_session = mocker.Mock()
        mock_query = mocker.Mock()
        mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = mocker.Mock()
        mocker.patch('API.yamlenv.script.SessionLocal', return_value=mock_session)
        mock_logging = mocker.patch('API.yamlenv.script.logging')
    
        # Act
        with pytest.raises(HTTPException):
            await create_user(SignUpUser(
                account_name="test",
                display_name="Test User",
                email="test@example.com",
                password_hash="hash",
                iterations=1000,
                salt="salt"
            ))
    
        # Assert
        mock_logging.info.assert_not_called()