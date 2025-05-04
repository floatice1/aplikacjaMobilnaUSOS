import firebase_admin
from firebase_admin import credentials, auth
import os

# --- IMPORTANT: Ensure Firebase is Initialized ---
# Use the same initialization logic as your firebase_config.py
# Make sure 'serviceAccountKey.json' is in the same directory or provide the correct path
try:
    if not firebase_admin._apps:
        base_dir = os.path.dirname(__file__)
        key_path = os.path.join(base_dir, 'serviceAccountKey.json')
        if not os.path.exists(key_path):
            raise FileNotFoundError(f"Service account key not found at: {key_path}")
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized.")
    else:
        print("Firebase Admin SDK already initialized.")

    # --- Set the Custom Claim ---
    admin_user_uid = "ZYl2kjhiZKZVvLBoE9cOl4p7xbI3" # UID for admin@tu.kielce.pl
    admin_role = "admin"

    print(f"Attempting to set role '{admin_role}' for user UID: {admin_user_uid}")

    # Set the custom claim. This merges with existing claims.
    auth.set_custom_user_claims(admin_user_uid, {'role': admin_role})

    print(f"Successfully set custom claim 'role': '{admin_role}' for user {admin_user_uid}.")
    print("NOTE: The user must sign in again to get an ID token with the new claim.")

except FileNotFoundError as e:
    print(f"Error: {e}")
    print("Please ensure 'serviceAccountKey.json' is in the correct directory.")
except auth.UserNotFoundError:
    print(f"Error: User with UID {admin_user_uid} not found in Firebase Authentication.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")