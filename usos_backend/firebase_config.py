import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Path to your Firebase service account key JSON file
# Store this path in your .env file for security: FIREBASE_SERVICE_ACCOUNT_KEY=path/to/your/serviceAccountKey.json
SERVICE_ACCOUNT_KEY_PATH = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')

if not SERVICE_ACCOUNT_KEY_PATH:
    raise ValueError("Firebase service account key path not found in environment variables. Please set FIREBASE_SERVICE_ACCOUNT_KEY in your .env file.")

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # Depending on your error handling strategy, you might want to exit or raise the exception
    # raise e 

# Get Firestore client
db = firestore.client()

# Export auth and db for use in other modules
__all__ = ['auth', 'db']