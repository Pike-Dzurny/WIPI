import os
import uuid

from httpx import patch
from app import app
from endpoints.posts import *
from endpoints.users import *
import pytest

# User data for testing
user_data = {
    "account_name": "test_user",
    "display_name": "iamauser",
    "email": "naaaaa@gmail.com",
    "password_hash": "password_hash",
    "iterations": 1000,
    "salt": "salt"
}
default_post = {
    "user_poster_id": 1,
    "post_content": "Test post",
    "reply_to": None
}



class TestCreatePost:

    @pytest.mark.asyncio
    async def test_valid_user_post_data(self, client):
        # Arrange
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200
        user_post = {
            "user_poster_id": 1,
            "post_content": "Test post",
            "reply_to": None
        }
        # Act
        response = client.post("/post", json=user_post)

        print(response.json())
    
        # Assert
        assert response.json()["status"] == "success"

    @pytest.mark.asyncio
    async def test_user_not_found(self, client):
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200
        assert response.json()["id"] == 1

        # Arrange
        user_post = {
            "user_poster_id": 2,
            "post_content": "Test postaaaaaaaa",
            "reply_to": None
        }
    
        # Act
        response = client.post("/post", json=user_post)
        # Assert
        assert response.json()['status_code'] == 500  # Or appropriate status code for user not found



    # Returns an error message when an exception occurs during post creation
    def test_bad_reply_to(self, client):
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200

        # Arrange
        user_post = {
            "user_poster_id": 1,
            "post_content": "Test post",
            "reply_to": 3
        }    
        # Act
        response = create_post(user_post)
    
        # Assert
        assert response.status_code == 500  # Or appropriate status code for user not found


    @pytest.mark.asyncio
    async def test_valid_reply_to_post(self, client):
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200

        # Arrange
        user_post = {
            "user_poster_id": 1,
            "post_content": "Test post",
            "reply_to": None
        }

        # Act
        response = client.post("/post", json=user_post)

        # Assert
        assert response.json()["status"] == "success"

        user_post = {
            "user_poster_id": 1,
            "post_content": "Test post",
            "reply_to": 1
        }

        # Act
        response = client.post("/post", json=user_post)

        # Assert
        assert response.json()["status"] == "success"

    @pytest.mark.asyncio
    async def test_empty_post_content(self, client):
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200

        # Arrange
        user_post = {
            "user_poster_id": 1,
            "post_content": "",
            "reply_to": None
        }

        # Act
        response = client.post("/post", json=user_post)

        # Assert
        assert response.json()['status_code'] == 500  # Or appropriate status code for user not found


    @pytest.mark.asyncio
    async def test_long_post_content(self, client):
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200

        # Arrange
        long_post_content = "a" * 1001
        user_post = {
            "user_poster_id": 1,
            "post_content": long_post_content,
            "reply_to": None
        }

        # Act
        response = client.post("/post", json=user_post)

        # Assert
        assert response.json()["status"] == "success"

    @pytest.mark.asyncio
    async def test_invalid_reply_to_post(self, client):
        response = client.post("/signup", json=user_data)
        assert response.status_code == 200

        # Arrange
        user_post = {
            "user_poster_id": 1,
            "post_content": "Test post",
            "reply_to": 2
        }

        # Act
        response = client.post("/post", json=user_post)

        # Assert
        assert response.json()['status_code'] == 500  # Or appropriate status code for user not found


class TestReadComments:

    @pytest.mark.asyncio
    async def test_returns_list_of_comments_for_given_post_id(self, client):
        response = client.post("/signup", json=user_data)
        response = client.post("/post", json=default_post)
        comment = { "user_commenter_id": 1, "post_id": 1, "comment_content": "Test comment" }
        response = client.post("/post", json=comment)
        # Arrange
        post_id = 1  # Assuming this post exists

        # Act
        response = client.get(f"/post/{post_id}/comments?page=1&per_page=6")

        # Assert
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    # Returns a list of comments with user information.
    @pytest.mark.asyncio
    async def test_returns_list_of_comments_with_user_information(self, client):
        response = client.post("/signup", json=user_data)
        response = client.post("/post", json=default_post)
        comment = { "user_commenter_id": 1, "post_id": 1, "comment_content": "Test comment" }
        response = client.post("/post", json=comment)
        # Arrange
        post_id = 1  # Assuming this post exists

        # Act
        response = client.get(f"/post/{post_id}/comments?page=1&per_page=6")

        # Assert
        assert response.status_code == 200
        for comment in response.json():
            assert "comment" in comment
            assert "user" in comment["comment"]
            assert "account_name" in comment["comment"]["user"]
            assert "bio" in comment["comment"]["user"]
            assert "display_name" in comment["comment"]["user"]
            assert "profile_picture" in comment["comment"]["user"]

    # Returns a list of comments sorted by date of post.
    @pytest.mark.asyncio
    def test_returns_list_of_comments_sorted_by_date_of_post(self, client):
        response = client.post("/signup", json=user_data)
        response = client.post("/post", json=default_post)
        comment = { "user_commenter_id": 1, "post_id": 1, "comment_content": "Test comment" }
        response = client.post("/post", json=comment)
        response = client.post("/post", json=comment)
        response = client.post("/post", json=comment)
        # Arrange
        post_id = 1
        page = 1
        per_page = 6
    
        # Act
        result = client.get(f"/post/{post_id}/comments?page=1&per_page=6")
    
        # Assert
        dates = [comment["comment"]["date_of_post"] for comment in result.json()]
        assert sorted(dates, reverse=True) == dates

    # Returns an empty list if the post ID does not exist.
    @pytest.mark.asyncio
    async def test_returns_empty_list_if_post_id_does_not_exist(self, client):
        response = client.post("/signup", json=user_data)
        response = client.post("/post", json=default_post)
        comment = { "user_commenter_id": 1, "post_id": 1, "comment_content": "Test comment" }
        response = client.post("/post", json=comment)
        response = client.post("/post", json=comment)
        response = client.post("/post", json=comment)
        # Arrange
        post_id = 9999  # Assuming this post does not exist

        # Act
        result = client.get(f"/post/{post_id}/comments?page=1&per_page=6")

        # Assert
        assert result.status_code == 200  # or 404 if your API returns 404 for not found
        assert result.json() == []

    # Returns an empty list if the page number is less than 1.
    def test_returns_empty_list_if_page_number_less_than_1(self):
        # Arrange
        post_id = 1
        page = -1
        per_page = 6
    
        # Act
        result = read_comments(post_id, page, per_page)
    
        # Assert
        assert result == []

    # Returns an empty list if the per_page number is less than 1.
    def test_returns_empty_list_if_per_page_number_less_than_1(self):
        # Arrange
        post_id = 1
        page = 1
        per_page = -1
    
        # Act
        result = read_comments(post_id, page, per_page)
    
        # Assert
        assert result == []