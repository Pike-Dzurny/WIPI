from typing import Optional
from pydantic import BaseModel

class UserPostBase(BaseModel):
    """
    Represents the structure of a user post.

    Args:
        user_poster_id (int): The UID of the user making the post.
        post_content (str): The content of the post.
        reply_to (Optional[int], optional): The ID of the post being replied to. Defaults to None.

    Example:
        user_post = UserPostBase(user_poster_id=3, post_content="Hello world!", reply_to=1)
        print(user_post.post_content)  # Output: "Hello world!"
        print(user_post.reply_to)  # Output: 1
    """

    user_poster_id: int
    post_content: str
    reply_to: Optional[int] = None
    

class SignUpUser(BaseModel):
    """
    Represents a user signing up for an account.

    Args:
        account_name (str): The user's account name.
        display_name (str): The user's display name.
        email (str): The user's email address.
        password_hash (str): The hashed password.
        iterations (int): The number of iterations used for password hashing.
        salt (str): The salt used for password hashing.
    """
    account_name: str
    display_name: str
    email: str
    password: str


class AuthDetails(BaseModel):
    """
    Represents authentication details.

    Args:
        username (str): The username for authentication.
        password (str): The password for authentication.

    Attributes:
        username (str): The username for authentication.
        password (str): The password for authentication.

    Example:
        auth = AuthDetails(username="john", password="password123")
        print(auth.username)  # Output: john
        print(auth.password)  # Output: password123
    """

    username: str
    password: str


class UsernameAvailability(BaseModel):
    """
    Represents the availability of a username.

    Example Usage:
    ```
    username_availability = UsernameAvailability(available=True)
    print(username_availability.available)  # Output: True
    ```

    Fields:
    - available (bool): Indicates whether the username is available or not.
    """

    available: bool


class PostBase(BaseModel):
    """
    Represents a post.

    Example Usage:
    Fields:
    - user_poster_id (int): Represents the ID of the user who posted it.
    - content (str): Represents the content of the post.
    - likes_count (int): Represents the number of likes the post has.
    """
    user_poster_id: int
    content: str
    likes_count: int


class UpdateUsernameRequest(BaseModel):
    username: str

class UpdateBioRequest(BaseModel):
    bio: str

class PasswordChangeRequest(BaseModel):
    oldPassword: str
    newPassword: str