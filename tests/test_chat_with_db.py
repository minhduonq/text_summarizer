"""
Test script for Chat API with database
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def test_chat_api():
    """Test complete chat API flow"""
    
    # Step 1: Register user (if not exists)
    print_section("1. REGISTER USER")
    register_data = {
        "email": f"testuser_{datetime.now().timestamp()}@example.com",
        "username": f"testuser_{int(datetime.now().timestamp())}",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 201:
            print("✅ User registered successfully")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Registration failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Step 2: Login
    print_section("2. LOGIN")
    login_data = {
        "username": register_data["username"],
        "password": register_data["password"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login-json", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("✅ Login successful")
            print(f"Token: {token[:50]}...")
            headers = {"Authorization": f"Bearer {token}"}
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Step 3: Create chat session
    print_section("3. CREATE CHAT SESSION")
    session_data = {
        "title": "Test Chat Session"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat/sessions",
            json=session_data,
            headers=headers
        )
        if response.status_code == 201:
            session = response.json()
            session_id = session["session_id"]
            print("✅ Chat session created")
            print(json.dumps(session, indent=2))
        else:
            print(f"❌ Failed to create session: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Step 4: Send messages
    print_section("4. SEND MESSAGES")
    messages = [
        "Hello! Can you help me understand AI?",
        "What is machine learning?",
        "Can you explain neural networks?"
    ]
    
    for msg in messages:
        try:
            response = requests.post(
                f"{BASE_URL}/chat/sessions/{session_id}/messages",
                json={"message": msg},
                headers=headers
            )
            if response.status_code == 200:
                result = response.json()
                print(f"\n👤 User: {result['user_message']}")
                print(f"🤖 Assistant: {result['assistant_response'][:100]}...")
            else:
                print(f"❌ Failed to send message: {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Step 5: Get chat history
    print_section("5. GET CHAT HISTORY")
    try:
        response = requests.get(
            f"{BASE_URL}/chat/sessions/{session_id}/history",
            headers=headers
        )
        if response.status_code == 200:
            history = response.json()
            print(f"✅ Retrieved {history['total_messages']} messages")
            print(f"Session Title: {history['title']}")
            print("\nMessages:")
            for msg in history['messages']:
                print(f"  [{msg['role']}] {msg['content'][:80]}...")
        else:
            print(f"❌ Failed to get history: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Step 6: Get all sessions
    print_section("6. GET ALL SESSIONS")
    try:
        response = requests.get(
            f"{BASE_URL}/chat/sessions",
            headers=headers
        )
        if response.status_code == 200:
            sessions = response.json()
            print(f"✅ Retrieved {len(sessions)} session(s)")
            for s in sessions:
                print(f"  - {s['title']} ({s['message_count']} messages)")
        else:
            print(f"❌ Failed to get sessions: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Step 7: Update session title
    print_section("7. UPDATE SESSION TITLE")
    new_title = "Updated Test Chat"
    try:
        response = requests.patch(
            f"{BASE_URL}/chat/sessions/{session_id}/title",
            params={"title": new_title},
            headers=headers
        )
        if response.status_code == 200:
            print(f"✅ Title updated to: {new_title}")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failed to update title: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Step 8: Delete session
    print_section("8. DELETE SESSION")
    try:
        response = requests.delete(
            f"{BASE_URL}/chat/sessions/{session_id}",
            headers=headers
        )
        if response.status_code == 200:
            print("✅ Session deleted successfully")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failed to delete session: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print_section("TEST COMPLETED")
    print("✅ All tests passed!")
    print("\nNote: If you see Gemini API errors, make sure:")
    print("1. GEMINI_API_KEY is set in .env file")
    print("2. API key is valid and has quota remaining")


if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║   Chat API with Database - Test Script                   ║
    ╚═══════════════════════════════════════════════════════════╝
    
    This script will test the complete chat flow:
    1. Register a new user
    2. Login and get JWT token
    3. Create a chat session
    4. Send multiple messages
    5. Retrieve chat history
    6. List all sessions
    7. Update session title
    8. Delete session
    
    Make sure the server is running: python src/main.py
    """)
    
    input("Press Enter to start testing...")
    
    try:
        test_chat_api()
    except KeyboardInterrupt:
        print("\n\n❌ Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
