from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import firebase_admin
from firebase_admin import auth

# Import models and firebase config (ensure firebase_config initializes SDK)
from models import (
    User, UserCreate, Role, Token, TokenData, 
    Subject, SubjectCreate, Group, GroupCreate, Grade, GradeCreate,
    AssignStudentToGroup, AssignTeacherToGroup
)
from firebase_config import db, auth as firebase_auth # db is the Firestore client, auth is Firebase Admin Auth
from auth_utils import (
    get_current_active_user, 
    require_admin, require_teacher, require_student, 
    require_teacher_or_admin
)
from typing import List
import datetime

# --- Firebase Initialization Check (Optional but recommended) ---
# Ensure Firebase is initialized before FastAPI starts fully
if not firebase_admin._apps:
    # This block might be redundant if firebase_config.py handles initialization robustly
    # Consider adding more sophisticated checks or relying solely on firebase_config.py
    print("Firebase not initialized in main.py, attempting initialization...")
    # You might need to re-import and call initialization logic here if needed
    # import firebase_config # Re-import might trigger initialization again
    # Or raise an error if initialization is expected to be done already
    # raise RuntimeError("Firebase Admin SDK must be initialized before starting the app.")
    pass # Assuming firebase_config.py handles it

app = FastAPI(
    title="USOS-like Student Information System API",
    description="API for managing students, teachers, subjects, groups, and grades.",
    version="0.1.0"
)

# --- Authentication Setup --- 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Dummy Root Endpoint --- 
@app.get("/", tags=["Root"])
async def read_root():
    """Provides a simple welcome message."""
    return {"message": "Welcome to the USOS-like API"}

# --- Authentication Endpoint --- 
@app.post("/token", response_model=Token, tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Handles user login via Firebase and returns a custom token (Firebase ID token)."""
    # Note: This endpoint doesn't directly handle password verification.
    # The client should use Firebase Client SDKs (like in your React Native app)
    # to sign in with email/password. This generates a Firebase ID Token.
    # The client then sends this ID token to your backend endpoints in the
    # Authorization: Bearer <ID_TOKEN> header.
    # The `get_current_user` dependency verifies this token.
    
    # This endpoint is kept for OAuth2PasswordBearer compatibility but is informational.
    # Real authentication happens client-side with Firebase, and token verification
    # happens in dependencies like `get_current_user`.
    
    # If you wanted server-side password check (less common with Firebase Auth):
    # You would need a way to verify the password against Firebase Auth here,
    # which is not standard practice. The recommended flow is client-side auth.
    
    # For demonstration, we'll assume the client gets the token and uses it.
    # This endpoint might be used to *refresh* a token if needed, but typically
    # Firebase client SDKs handle token refresh automatically.
    
    # Returning a dummy token here as the real token comes from Firebase Client SDK.
    # In a real scenario, you might not even need this specific `/token` endpoint
    # if clients authenticate directly with Firebase and send the ID token.
    return Token(access_token="dummy_firebase_id_token_obtain_from_client_sdk", token_type="bearer")
    
    # --- Proper way to think about it: ---
    # 1. Client (React Native app) uses `signInWithEmailAndPassword` from Firebase JS SDK.
    # 2. On success, Firebase JS SDK provides a UserCredential object.
    # 3. Client gets the ID token: `userCredential.user.getIdToken()`.
    # 4. Client sends this ID token in the `Authorization: Bearer <ID_TOKEN>` header
    #    when calling protected API endpoints (like `/users/me`).
    # 5. Your FastAPI `get_current_user` dependency verifies this token using `firebase_admin.auth.verify_id_token()`.

# --- User Management Endpoints (Admin Only) --- 
@app.post("/users/", response_model=User, status_code=status.HTTP_201_CREATED, tags=["Admin: User Management"], dependencies=[Depends(require_admin)])
async def create_user(user_data: UserCreate):
    """(Admin) Creates a new user in Firebase Authentication and Firestore."""
    try:
        firebase_user = firebase_auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.name
        )
        
        user_doc_ref = db.collection('users').document(firebase_user.uid)
        user_info = {
            'uid': firebase_user.uid,
            'email': user_data.email,
            'name': user_data.name,
            'role': user_data.role.value
        }
        user_doc_ref.set(user_info)

        # Set custom claims for role-based access control
        firebase_auth.set_custom_user_claims(firebase_user.uid, {'role': user_data.role.value})

        return User(**user_info)

    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        print(f"Error creating user: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the user."
        )

@app.get("/users/", response_model=List[User], tags=["Admin: User Management"], dependencies=[Depends(require_admin)])
async def list_users():
    """(Admin) Lists all users from Firestore."""
    try:
        users_ref = db.collection('users')
        docs = users_ref.stream()
        users_list = [User(**doc.to_dict()) for doc in docs]
        return users_list
    except Exception as e:
        print(f"Error listing users: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch users")

@app.get("/users/{user_id}", response_model=User, tags=["Admin: User Management"], dependencies=[Depends(require_admin)])
async def get_user(user_id: str):
    """(Admin) Gets a specific user by UID."""
    user_doc = db.collection('users').document(user_id).get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_doc.to_dict())

@app.put("/users/{user_id}/role", response_model=User, tags=["Admin: User Management"], dependencies=[Depends(require_admin)])
async def update_user_role(user_id: str, role_update: Role):
    """(Admin) Updates a user's role in Firestore and Firebase Auth claims."""
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        # Update Firestore
        user_ref.update({'role': role_update.value})
        # Update Firebase Auth custom claims
        firebase_auth.set_custom_user_claims(user_id, {'role': role_update.value})
        
        # Fetch updated user data to return
        updated_doc = user_ref.get()
        return User(**updated_doc.to_dict())
    except Exception as e:
        print(f"Error updating user role: {e}")
        raise HTTPException(status_code=500, detail="Could not update user role")

# --- Current User Endpoint --- 
@app.get("/users/me", response_model=User, tags=["Users"])
async def read_users_me(current_user_data: TokenData = Depends(get_current_active_user)):
    """Gets the profile of the currently logged-in user."""
    # Fetch full user profile from Firestore using the UID from the token
    user_doc = db.collection('users').document(current_user_data.uid).get()
    if not user_doc.exists:
        # This case should ideally not happen if the token is valid and user exists
        raise HTTPException(status_code=404, detail="Current user data not found in Firestore")
    return User(**user_doc.to_dict())

# --- Subject Management Endpoints --- 

@app.post("/subjects/", response_model=Subject, status_code=status.HTTP_201_CREATED, tags=["Admin: Subject Management"], dependencies=[Depends(require_admin)])
async def create_subject(subject_data: SubjectCreate):
    """(Admin) Creates a new subject."""
    try:
        subjects_ref = db.collection('subjects')
        # Generate a new ID
        new_subject_ref = subjects_ref.document() 
        subject_id = new_subject_ref.id
        
        subject_info = subject_data.dict()
        subject_info['subjectId'] = subject_id
        
        new_subject_ref.set(subject_info)
        return Subject(**subject_info)
    except Exception as e:
        print(f"Error creating subject: {e}")
        raise HTTPException(status_code=500, detail="Could not create subject")

@app.get("/subjects/", response_model=List[Subject], tags=["Subjects"], dependencies=[Depends(get_current_active_user)])
async def list_subjects():
    """(Authenticated) Lists all subjects."""
    try:
        subjects_ref = db.collection('subjects')
        docs = subjects_ref.stream()
        subjects_list = [Subject(**doc.to_dict()) for doc in docs]
        return subjects_list
    except Exception as e:
        print(f"Error listing subjects: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch subjects")

@app.get("/subjects/{subject_id}", response_model=Subject, tags=["Subjects"], dependencies=[Depends(get_current_active_user)])
async def get_subject(subject_id: str):
    """(Authenticated) Gets a specific subject by ID."""
    subject_doc = db.collection('subjects').document(subject_id).get()
    if not subject_doc.exists:
        raise HTTPException(status_code=404, detail="Subject not found")
    return Subject(**subject_doc.to_dict())

@app.put("/subjects/{subject_id}", response_model=Subject, tags=["Admin: Subject Management"], dependencies=[Depends(require_admin)])
async def update_subject(subject_id: str, subject_data: SubjectCreate):
    """(Admin) Updates an existing subject."""
    subject_ref = db.collection('subjects').document(subject_id)
    if not subject_ref.get().exists:
        raise HTTPException(status_code=404, detail="Subject not found")
    try:
        update_data = subject_data.dict(exclude_unset=True) # Only update provided fields
        subject_ref.update(update_data)
        updated_doc = subject_ref.get()
        return Subject(**updated_doc.to_dict())
    except Exception as e:
        print(f"Error updating subject: {e}")
        raise HTTPException(status_code=500, detail="Could not update subject")

@app.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Admin: Subject Management"], dependencies=[Depends(require_admin)])
async def delete_subject(subject_id: str):
    """(Admin) Deletes a subject. (Caution: Consider implications on groups/grades)."""
    subject_ref = db.collection('subjects').document(subject_id)
    if not subject_ref.get().exists:
        raise HTTPException(status_code=404, detail="Subject not found")
    try:
        # TODO: Add logic here to check if the subject is used in groups or grades
        # before allowing deletion, or handle cascading deletes if necessary.
        subject_ref.delete()
        return None # No content response
    except Exception as e:
        print(f"Error deleting subject: {e}")
        raise HTTPException(status_code=500, detail="Could not delete subject")


# --- Group Management Endpoints --- 

@app.post("/groups/", response_model=Group, status_code=status.HTTP_201_CREATED, tags=["Admin: Group Management"], dependencies=[Depends(require_admin)])
async def create_group(group_data: GroupCreate):
    """(Admin) Creates a new group for a subject."""
    # Check if subject exists
    subject_ref = db.collection('subjects').document(group_data.subjectId)
    if not subject_ref.get().exists:
        raise HTTPException(status_code=404, detail=f"Subject with ID {group_data.subjectId} not found")
    
    # Check if teacher exists (if provided)
    if group_data.teacherId:
        teacher_ref = db.collection('users').document(group_data.teacherId)
        teacher_doc = teacher_ref.get()
        if not teacher_doc.exists or teacher_doc.to_dict().get('role') != Role.teacher.value:
             raise HTTPException(status_code=400, detail=f"Invalid teacher ID {group_data.teacherId} or user is not a teacher")

    try:
        groups_ref = db.collection('groups')
        new_group_ref = groups_ref.document()
        group_id = new_group_ref.id
        
        group_info = group_data.dict()
        group_info['groupId'] = group_id
        group_info['studentIds'] = [] # Initialize with empty student list
        
        new_group_ref.set(group_info)
        return Group(**group_info)
    except Exception as e:
        print(f"Error creating group: {e}")
        raise HTTPException(status_code=500, detail="Could not create group")

@app.get("/groups/", response_model=List[Group], tags=["Groups"], dependencies=[Depends(get_current_active_user)])
async def list_groups(subject_id: str | None = None):
    """(Authenticated) Lists all groups, optionally filtered by subject_id."""
    try:
        groups_query = db.collection('groups')
        if subject_id:
             # Check if subject exists before filtering
            subject_ref = db.collection('subjects').document(subject_id)
            if not subject_ref.get().exists:
                raise HTTPException(status_code=404, detail=f"Subject with ID {subject_id} not found")
            groups_query = groups_query.where('subjectId', '==', subject_id)
            
        docs = groups_query.stream()
        groups_list = [Group(**doc.to_dict()) for doc in docs]
        return groups_list
    except Exception as e:
        print(f"Error listing groups: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch groups")

@app.get("/groups/{group_id}", response_model=Group, tags=["Groups"], dependencies=[Depends(get_current_active_user)])
async def get_group(group_id: str):
    """(Authenticated) Gets a specific group by ID."""
    group_doc = db.collection('groups').document(group_id).get()
    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")
    return Group(**group_doc.to_dict())

@app.put("/groups/{group_id}", response_model=Group, tags=["Admin: Group Management"], dependencies=[Depends(require_admin)])
async def update_group(group_id: str, group_data: GroupCreate):
    """(Admin) Updates an existing group's details (name, subject, teacher). Student list managed separately."""
    group_ref = db.collection('groups').document(group_id)
    if not group_ref.get().exists:
        raise HTTPException(status_code=404, detail="Group not found")

    # Validate subjectId if changed
    if group_data.subjectId:
        subject_ref = db.collection('subjects').document(group_data.subjectId)
        if not subject_ref.get().exists:
            raise HTTPException(status_code=404, detail=f"Subject with ID {group_data.subjectId} not found")

    # Validate teacherId if changed
    if group_data.teacherId:
        teacher_ref = db.collection('users').document(group_data.teacherId)
        teacher_doc = teacher_ref.get()
        if not teacher_doc.exists or teacher_doc.to_dict().get('role') != Role.teacher.value:
             raise HTTPException(status_code=400, detail=f"Invalid teacher ID {group_data.teacherId} or user is not a teacher")

    try:
        # Exclude studentIds from direct update here
        update_data = group_data.dict(exclude_unset=True, exclude={'studentIds'})
        group_ref.update(update_data)
        updated_doc = group_ref.get()
        return Group(**updated_doc.to_dict())
    except Exception as e:
        print(f"Error updating group: {e}")
        raise HTTPException(status_code=500, detail="Could not update group")

@app.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Admin: Group Management"], dependencies=[Depends(require_admin)])
async def delete_group(group_id: str):
    """(Admin) Deletes a group. (Caution: Consider implications on grades)."""
    group_ref = db.collection('groups').document(group_id)
    if not group_ref.get().exists:
        raise HTTPException(status_code=404, detail="Group not found")
    try:
        # TODO: Add logic to check for grades associated with this group before deletion?
        group_ref.delete()
        return None
    except Exception as e:
        print(f"Error deleting group: {e}")
        raise HTTPException(status_code=500, detail="Could not delete group")

# --- Group Membership Management (Admin) --- 

@app.post("/groups/{group_id}/students", response_model=Group, tags=["Admin: Group Management"], dependencies=[Depends(require_admin)])
async def add_student_to_group(group_id: str, assignment: AssignStudentToGroup):
    """(Admin) Assigns a student to a specific group."""
    group_ref = db.collection('groups').document(group_id)
    group_doc = group_ref.get()
    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")

    student_ref = db.collection('users').document(assignment.studentId)
    student_doc = student_ref.get()
    if not student_doc.exists or student_doc.to_dict().get('role') != Role.student.value:
        raise HTTPException(status_code=400, detail=f"Invalid student ID {assignment.studentId} or user is not a student")

    try:
        # Use FieldValue.array_union to add student ID if not already present
        group_ref.update({"studentIds": firestore.ArrayUnion([assignment.studentId])})
        updated_doc = group_ref.get() # Fetch updated group data
        return Group(**updated_doc.to_dict())
    except Exception as e:
        print(f"Error adding student to group: {e}")
        raise HTTPException(status_code=500, detail="Could not add student to group")

@app.delete("/groups/{group_id}/students/{student_id}", response_model=Group, tags=["Admin: Group Management"], dependencies=[Depends(require_admin)])
async def remove_student_from_group(group_id: str, student_id: str):
    """(Admin) Removes a student from a specific group."""
    group_ref = db.collection('groups').document(group_id)
    if not group_ref.get().exists:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Optional: Check if student exists before trying to remove
    # student_ref = db.collection('users').document(student_id)
    # if not student_ref.get().exists:
    #     raise HTTPException(status_code=404, detail="Student not found")

    try:
        # Use FieldValue.array_remove to remove the student ID
        group_ref.update({"studentIds": firestore.ArrayRemove([student_id])})
        updated_doc = group_ref.get() # Fetch updated group data
        return Group(**updated_doc.to_dict())
    except Exception as e:
        print(f"Error removing student from group: {e}")
        raise HTTPException(status_code=500, detail="Could not remove student from group")

@app.put("/groups/{group_id}/teacher", response_model=Group, tags=["Admin: Group Management"], dependencies=[Depends(require_admin)])
async def assign_teacher_to_group(group_id: str, assignment: AssignTeacherToGroup):
    """(Admin) Assigns or updates the teacher for a specific group."""
    group_ref = db.collection('groups').document(group_id)
    if not group_ref.get().exists:
        raise HTTPException(status_code=404, detail="Group not found")

    teacher_ref = db.collection('users').document(assignment.teacherId)
    teacher_doc = teacher_ref.get()
    if not teacher_doc.exists or teacher_doc.to_dict().get('role') != Role.teacher.value:
        raise HTTPException(status_code=400, detail=f"Invalid teacher ID {assignment.teacherId} or user is not a teacher")

    try:
        group_ref.update({"teacherId": assignment.teacherId})
        updated_doc = group_ref.get()
        return Group(**updated_doc.to_dict())
    except Exception as e:
        print(f"Error assigning teacher to group: {e}")
        raise HTTPException(status_code=500, detail="Could not assign teacher to group")


# --- Grade Management Endpoints --- 

@app.post("/grades/", response_model=Grade, status_code=status.HTTP_201_CREATED, tags=["Teacher: Grade Management"], dependencies=[Depends(require_teacher)])
async def add_grade(grade_data: GradeCreate, current_user: TokenData = Depends(get_current_active_user)):
    """(Teacher) Adds a grade for a student in a specific group/subject."""
    # Validate student exists and is a student
    student_ref = db.collection('users').document(grade_data.studentId)
    student_doc = student_ref.get()
    if not student_doc.exists or student_doc.to_dict().get('role') != Role.student.value:
        raise HTTPException(status_code=400, detail=f"Invalid student ID {grade_data.studentId} or user is not a student")

    # Validate subject exists
    subject_ref = db.collection('subjects').document(grade_data.subjectId)
    if not subject_ref.get().exists:
        raise HTTPException(status_code=404, detail=f"Subject with ID {grade_data.subjectId} not found")

    # Validate group exists and belongs to the subject
    group_ref = db.collection('groups').document(grade_data.groupId)
    group_doc = group_ref.get()
    if not group_doc.exists or group_doc.to_dict().get('subjectId') != grade_data.subjectId:
        raise HTTPException(status_code=400, detail=f"Group with ID {grade_data.groupId} not found or does not belong to subject {grade_data.subjectId}")
    
    group_data = Group(**group_doc.to_dict())

    # Validate the student is part of the group
    if grade_data.studentId not in group_data.studentIds:
         raise HTTPException(status_code=400, detail=f"Student {grade_data.studentId} is not enrolled in group {grade_data.groupId}")

    # Validate the teacher adding the grade is assigned to the group (or is an admin - though endpoint requires teacher)
    # Depending on strictness, you might allow any teacher to grade, or only the assigned one.
    # Let's enforce that the teacher must be assigned to the group.
    if group_data.teacherId != current_user.uid:
         raise HTTPException(status_code=403, detail=f"Teacher {current_user.uid} is not assigned to teach group {grade_data.groupId}")

    try:
        grades_ref = db.collection('grades')
        new_grade_ref = grades_ref.document()
        grade_id = new_grade_ref.id
        
        grade_info = grade_data.dict()
        grade_info['gradeId'] = grade_id
        grade_info['issuedBy'] = current_user.uid # Logged-in teacher
        grade_info['timestamp'] = datetime.datetime.utcnow()
        
        new_grade_ref.set(grade_info)
        return Grade(**grade_info)
    except Exception as e:
        print(f"Error adding grade: {e}")
        raise HTTPException(status_code=500, detail="Could not add grade")

@app.get("/grades/", response_model=List[Grade], tags=["Grades"], dependencies=[Depends(get_current_active_user)])
async def list_grades(
    student_id: str | None = None, 
    subject_id: str | None = None, 
    group_id: str | None = None,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Lists grades, filtered by student, subject, or group. Access controlled by role."""
    
    query = db.collection('grades')

    # Role-based filtering
    if current_user.role == Role.student:
        # Students can only see their own grades
        if student_id and student_id != current_user.uid:
             raise HTTPException(status_code=403, detail="Students can only view their own grades.")
        query = query.where('studentId', '==', current_user.uid)
        # Apply other filters if provided by the student for their own grades
        if subject_id: query = query.where('subjectId', '==', subject_id)
        if group_id: query = query.where('groupId', '==', group_id)
            
    elif current_user.role == Role.teacher:
        # Teachers can see grades for students in groups they teach, or filter broadly
        # Option 1: Broad filtering (allow teacher to see any grade if filters match)
        if student_id: query = query.where('studentId', '==', student_id)
        if subject_id: query = query.where('subjectId', '==', subject_id)
        if group_id: query = query.where('groupId', '==', group_id)
        # Option 2: Stricter - only show grades from groups the teacher is assigned to (more complex query)
        # This would require fetching groups taught by the teacher first.
        # For simplicity, using Option 1 here.
        pass 
        
    elif current_user.role == Role.admin:
        # Admins can see all grades, apply any filter
        if student_id: query = query.where('studentId', '==', student_id)
        if subject_id: query = query.where('subjectId', '==', subject_id)
        if group_id: query = query.where('groupId', '==', group_id)

    else: # Should not happen with get_current_active_user
        raise HTTPException(status_code=403, detail="Invalid role for accessing grades.")

    try:
        docs = query.stream()
        grades_list = [Grade(**doc.to_dict()) for doc in docs]
        return grades_list
    except Exception as e:
        print(f"Error listing grades: {e}")
        # Firestore composite index errors might occur here if filters are combined without an index
        if "requires an index" in str(e):
             raise HTTPException(status_code=400, detail=f"Query requires a Firestore index. Please create it. Details: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch grades")

@app.get("/grades/{grade_id}", response_model=Grade, tags=["Grades"], dependencies=[Depends(get_current_active_user)])
async def get_grade(grade_id: str, current_user: TokenData = Depends(get_current_active_user)):
    """Gets a specific grade by ID, respecting user roles."""
    grade_ref = db.collection('grades').document(grade_id)
    grade_doc = grade_ref.get()
    if not grade_doc.exists:
        raise HTTPException(status_code=404, detail="Grade not found")
    
    grade_data = Grade(**grade_doc.to_dict())

    # Role check
    if current_user.role == Role.student and grade_data.studentId != current_user.uid:
        raise HTTPException(status_code=403, detail="Students can only view their own grades.")
    # Teachers might need checks based on group assignment (similar to list_grades Option 2)
    # Admins can view any grade

    return grade_data

@app.put("/grades/{grade_id}", response_model=Grade, tags=["Teacher: Grade Management"], dependencies=[Depends(require_teacher)])
async def update_grade(grade_id: str, grade_update_data: GradeCreate, current_user: TokenData = Depends(get_current_active_user)):
    """(Teacher) Updates an existing grade."""
    grade_ref = db.collection('grades').document(grade_id)
    grade_doc = grade_ref.get()
    if not grade_doc.exists:
        raise HTTPException(status_code=404, detail="Grade not found")

    original_grade = Grade(**grade_doc.to_dict())

    # --- Validation (similar to add_grade) --- 
    # Ensure the update doesn't change student/subject/group association (usually not allowed)
    if (grade_update_data.studentId != original_grade.studentId or 
        grade_update_data.subjectId != original_grade.subjectId or 
        grade_update_data.groupId != original_grade.groupId):
        raise HTTPException(status_code=400, detail="Cannot change student, subject, or group association of an existing grade.")

    # Validate the teacher updating the grade is assigned to the group
    group_ref = db.collection('groups').document(original_grade.groupId)
    group_doc = group_ref.get()
    if not group_doc.exists:
         raise HTTPException(status_code=404, detail=f"Associated group {original_grade.groupId} not found") # Should not happen if data is consistent
    group_data = Group(**group_doc.to_dict())
    if group_data.teacherId != current_user.uid:
         raise HTTPException(status_code=403, detail=f"Teacher {current_user.uid} is not assigned to teach group {original_grade.groupId}")

    try:
        update_payload = {
            'gradeValue': grade_update_data.gradeValue,
            'timestamp': datetime.datetime.utcnow() # Update timestamp
            # 'issuedBy': current_user.uid # Optionally update who last modified it
        }
        grade_ref.update(update_payload)
        updated_doc = grade_ref.get()
        return Grade(**updated_doc.to_dict())
    except Exception as e:
        print(f"Error updating grade: {e}")
        raise HTTPException(status_code=500, detail="Could not update grade")

@app.delete("/grades/{grade_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Teacher: Grade Management"], dependencies=[Depends(require_teacher)])
async def delete_grade(grade_id: str, current_user: TokenData = Depends(get_current_active_user)):
    """(Teacher) Deletes a grade. Use with caution."""
    grade_ref = db.collection('grades').document(grade_id)
    grade_doc = grade_ref.get()
    if not grade_doc.exists:
        raise HTTPException(status_code=404, detail="Grade not found")

    # Validate the teacher deleting the grade is assigned to the group
    original_grade = Grade(**grade_doc.to_dict())
    group_ref = db.collection('groups').document(original_grade.groupId)
    group_doc = group_ref.get()
    if not group_doc.exists:
         raise HTTPException(status_code=404, detail=f"Associated group {original_grade.groupId} not found")
    group_data = Group(**group_doc.to_dict())
    if group_data.teacherId != current_user.uid:
         raise HTTPException(status_code=403, detail=f"Teacher {current_user.uid} is not assigned to teach group {original_grade.groupId} and cannot delete this grade")

    try:
        grade_ref.delete()
        return None
    except Exception as e:
        print(f"Error deleting grade: {e}")
        raise HTTPException(status_code=500, detail="Could not delete grade")


# --- Role-Specific View Endpoints ---

# --- Student Views ---

@app.get("/students/me/groups", response_model=List[Group], tags=["Student Views"], dependencies=[Depends(require_student)])
async def get_my_student_groups(current_user: TokenData = Depends(get_current_active_user)):
    """(Student) Gets the list of groups the current student is enrolled in."""
    try:
        groups_query = db.collection('groups').where('studentIds', 'array_contains', current_user.uid)
        docs = groups_query.stream()
        my_groups = [Group(**doc.to_dict()) for doc in docs]
        return my_groups
    except Exception as e:
        print(f"Error fetching student groups: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch student's groups")

@app.get("/students/me/subjects", response_model=List[Subject], tags=["Student Views"], dependencies=[Depends(require_student)])
async def get_my_student_subjects(current_user: TokenData = Depends(get_current_active_user)):
    """(Student) Gets the list of subjects the current student is enrolled in (via groups)."""
    try:
        # First, get the groups the student is in
        groups_query = db.collection('groups').where('studentIds', 'array_contains', current_user.uid)
        group_docs = groups_query.stream()
        subject_ids = set()
        for doc in group_docs:
            group_data = doc.to_dict()
            if 'subjectId' in group_data:
                subject_ids.add(group_data['subjectId'])
        
        if not subject_ids:
            return []

        # Fetch the subjects based on the collected IDs
        # Firestore 'in' query supports up to 10 items per query. Handle larger lists if necessary.
        # For simplicity, assuming fewer than 10 subjects per student here.
        # If more are possible, batch the queries.
        if len(subject_ids) > 10:
             # Handle batching if necessary (more complex)
             print("Warning: Student enrolled in more than 10 subjects, fetching only first 10 due to query limits.")
             subject_ids_list = list(subject_ids)[:10]
        else:
             subject_ids_list = list(subject_ids)

        if not subject_ids_list:
            return []

        subjects_query = db.collection('subjects').where('subjectId', 'in', subject_ids_list)
        subject_docs = subjects_query.stream()
        my_subjects = [Subject(**doc.to_dict()) for doc in subject_docs]
        return my_subjects
        
    except Exception as e:
        print(f"Error fetching student subjects: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch student's subjects")

# Note: Student grades are already accessible via GET /grades/ (filtered automatically)

# --- Teacher Views ---

@app.get("/teachers/me/groups", response_model=List[Group], tags=["Teacher Views"], dependencies=[Depends(require_teacher)])
async def get_my_teacher_groups(current_user: TokenData = Depends(get_current_active_user)):
    """(Teacher) Gets the list of groups the current teacher is assigned to teach."""
    try:
        groups_query = db.collection('groups').where('teacherId', '==', current_user.uid)
        docs = groups_query.stream()
        my_groups = [Group(**doc.to_dict()) for doc in docs]
        return my_groups
    except Exception as e:
        print(f"Error fetching teacher groups: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch teacher's groups")

@app.get("/teachers/me/subjects", response_model=List[Subject], tags=["Teacher Views"], dependencies=[Depends(require_teacher)])
async def get_my_teacher_subjects(current_user: TokenData = Depends(get_current_active_user)):
    """(Teacher) Gets the list of subjects the current teacher is assigned to teach (via groups)."""
    try:
        # Get groups taught by the teacher
        groups_query = db.collection('groups').where('teacherId', '==', current_user.uid)
        group_docs = groups_query.stream()
        subject_ids = set()
        for doc in group_docs:
            group_data = doc.to_dict()
            if 'subjectId' in group_data:
                subject_ids.add(group_data['subjectId'])
        
        if not subject_ids:
            return []

        # Fetch subjects (handle >10 limit if necessary)
        subject_ids_list = list(subject_ids)
        if len(subject_ids_list) > 10:
             print("Warning: Teacher assigned to groups in more than 10 subjects, fetching only first 10.")
             subject_ids_list = subject_ids_list[:10]
        
        if not subject_ids_list:
             return []

        subjects_query = db.collection('subjects').where('subjectId', 'in', subject_ids_list)
        subject_docs = subjects_query.stream()
        my_subjects = [Subject(**doc.to_dict()) for doc in subject_docs]
        return my_subjects
        
    except Exception as e:
        print(f"Error fetching teacher subjects: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch teacher's subjects")

@app.get("/teachers/me/groups/{group_id}/students", response_model=List[User], tags=["Teacher Views"], dependencies=[Depends(require_teacher)])
async def get_students_in_my_group(group_id: str, current_user: TokenData = Depends(get_current_active_user)):
    """(Teacher) Gets the list of students enrolled in a specific group taught by the current teacher."""
    # Verify group exists and is taught by the current teacher
    group_ref = db.collection('groups').document(group_id)
    group_doc = group_ref.get()
    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group_data = Group(**group_doc.to_dict())
    if group_data.teacherId != current_user.uid:
        raise HTTPException(status_code=403, detail="Teacher is not assigned to this group")

    if not group_data.studentIds:
        return [] # No students in the group

    try:
        # Fetch student details based on studentIds
        # Firestore 'in' query limit is 10. Batch if necessary.
        student_ids_list = group_data.studentIds
        students = []
        # Batching loop
        for i in range(0, len(student_ids_list), 10):
            batch_ids = student_ids_list[i:i+10]
            if not batch_ids: continue # Should not happen, but safeguard
            
            students_query = db.collection('users').where('uid', 'in', batch_ids)
            student_docs = students_query.stream()
            students.extend([User(**doc.to_dict()) for doc in student_docs])
            
        return students
    except Exception as e:
        print(f"Error fetching students in group: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch students for the group")

# Note: Teacher grades are manageable via POST/PUT/DELETE /grades/ and viewable via GET /grades/ 

if __name__ == "__main__":
    import uvicorn
    # Note: Running directly like this is for development.
    # For production, use a process manager like Gunicorn with Uvicorn workers.
    # Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in your environment.
    uvicorn.run(app, host="0.0.0.0", port=8000)