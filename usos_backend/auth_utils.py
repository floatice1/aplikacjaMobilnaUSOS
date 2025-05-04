from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from firebase_admin import auth
from models import TokenData, Role, User # Import necessary models
from firebase_config import db # Import Firestore client
import jwt # PyJWT for decoding (might be needed if creating custom tokens)
from jwt import PyJWTError

# This assumes you are using Firebase ID tokens directly for authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    """Verifies Firebase ID token and returns user data including UID and role."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Verify the ID token using Firebase Admin SDK
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        role_str = decoded_token.get("role") # Role should be in custom claims

        if uid is None or role_str is None:
            print(f"Token missing uid or role: {decoded_token}") # Debugging
            raise credentials_exception
        
        try:
            role = Role(role_str) # Validate role against Enum
        except ValueError:
            print(f"Invalid role in token: {role_str}") # Debugging
            raise credentials_exception

        token_data = TokenData(uid=uid, email=email, role=role)
        return token_data
    except auth.InvalidIdTokenError as e:
        print(f"Invalid ID token: {e}") # Debugging
        raise credentials_exception
    except auth.ExpiredIdTokenError as e:
        print(f"Expired ID token: {e}") # Debugging
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # Catch other potential Firebase verification errors
        print(f"Token verification failed: {e}") # Debugging
        raise credentials_exception

async def get_current_active_user(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """Dependency to get the current user, ensuring they are active (basic check)."""
    # Add any additional checks for user status if needed (e.g., check if disabled in Firestore)
    # user_doc = db.collection('users').document(current_user.uid).get()
    # if not user_doc.exists or user_doc.to_dict().get('disabled', False):
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# --- Role Checking Dependencies --- 

def require_role(required_role: Role):
    """Factory for creating role-specific dependency checkers."""
    async def role_checker(current_user: TokenData = Depends(get_current_active_user)) -> TokenData:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Requires {required_role.value} role."
            )
        return current_user
    return role_checker

def require_roles(required_roles: list[Role]):
    """Factory for creating dependency checkers for multiple roles."""
    async def roles_checker(current_user: TokenData = Depends(get_current_active_user)) -> TokenData:
        if current_user.role not in required_roles:
            allowed_roles = ", ".join([role.value for role in required_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Requires one of the following roles: {allowed_roles}."
            )
        return current_user
    return roles_checker

# Specific role dependencies
require_admin = require_role(Role.admin)
require_teacher = require_role(Role.teacher)
require_student = require_role(Role.student)
require_teacher_or_admin = require_roles([Role.teacher, Role.admin])