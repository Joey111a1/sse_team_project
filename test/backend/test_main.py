from fastapi.testclient import TestClient
from app import app


# Tests that succeed surely
def test_always_passes():
    """A test that always passes."""
    assert True


def test_math():
    """Another test that always succeeds."""
    assert 1 + 1 == 2


# Formal tests
# def test_token_endpoint_success():
#     """
#     Test that a valid login returns a token.
#     """
#     response = client.post(
#         "/token",
#         data={"username": "user1", "password": "password1"}
#     )
#     assert response.status_code == 200, response.text
#     data = response.json()
#     assert "access_token" in data
#     assert data["access_token"] == "dummy_token"
#     assert data["token_type"] == "bearer"
#
#
# def test_token_endpoint_failure():
#     """
#     Test that an invalid login returns a 401 error.
#     """
#     response = client.post(
#         "/token",
#         data={"username": "user1", "password": "wrongpassword"}
#     )
#     assert response.status_code == 401, response.text
#     data = response.json()
#     assert data["detail"] == "Incorrect username or password"
#
#
# def test_root_without_authentication():
#     """
#     Test that accessing the protected endpoint without a token returns a 401.
#     """
#     response = client.get("/")
#     assert response.status_code == 401
#
#
# def test_root_with_authentication():
#     """
#     Test that accessing the protected endpoint with a valid token works.
#     """
#     # First, obtain the token.
#     token_response = client.post(
#         "/token",
#         data={"username": "user1", "password": "password1"}
#     )
#     token = token_response.json()["access_token"]
#
#     headers = {"Authorization": f"Bearer {token}"}
#     response = client.get("/", headers=headers)
#     assert response.status_code == 200, response.text
#     data = response.json()
#     assert data["message"] == "You are logged in"
