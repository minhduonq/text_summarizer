"""
Test script for authentication functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"


def test_register():
    """Test user registration"""
    print("\n=== Testing Registration ===")
    
    register_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123",
        "password_confirm": "password123",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_login():
    """Test user login"""
    print("\n=== Testing Login ===")
    
    login_data = {
        "username": "testuser",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login-json", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            return response.json().get("access_token")
        return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None


def test_get_current_user(token):
    """Test getting current user info"""
    print("\n=== Testing Get Current User ===")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


def test_verify_token(token):
    """Test token verification"""
    print("\n=== Testing Token Verification ===")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/auth/verify", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


if __name__ == "__main__":
    print("=================================")
    print("Authentication System Test")
    print("=================================")
    print("\nMake sure the server is running at http://localhost:8000")
    
    input("\nPress Enter to start testing...")
    
    # Test registration
    register_success = test_register()
    
    if not register_success:
        print("\n⚠️  Registration failed. User might already exist. Continuing with login test...")
    
    # Test login
    token = test_login()
    
    if token:
        print(f"\n✓ Login successful! Token: {token[:50]}...")
        
        # Test get current user
        if test_get_current_user(token):
            print("\n✓ Get current user successful!")
        else:
            print("\n✗ Get current user failed!")
        
        # Test verify token
        if test_verify_token(token):
            print("\n✓ Token verification successful!")
        else:
            print("\n✗ Token verification failed!")
    else:
        print("\n✗ Login failed!")
    
    print("\n=================================")
    print("Test completed!")
    print("=================================")
