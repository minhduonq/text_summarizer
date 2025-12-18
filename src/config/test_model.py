import google.generativeai as genai
import os

# Thay bằng API Key của bạn
os.environ["GOOGLE_API_KEY"] = "AIzaSyBQ-FafYgfYEkOOAKZKCP00CX5dzdIJxEE"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

print("Danh sách các model khả dụng:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)