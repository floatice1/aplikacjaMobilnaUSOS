from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from enum import Enum
import datetime

class Role(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Role

class UserCreate(UserBase):
    password: str # Needed for creation, but not stored directly in Firestore if using Firebase Auth

class User(UserBase):
    uid: str # Firebase Auth UID

class SubjectBase(BaseModel):
    name: str
    description: str | None = None

class SubjectCreate(SubjectBase):
    pass

class Subject(SubjectBase):
    subjectId: str

class GroupBase(BaseModel):
    name: str
    subjectId: str
    teacherId: str | None = None # Reference to User UID (Teacher)

class GroupCreate(GroupBase):
    pass

class Group(GroupBase):
    groupId: str
    studentIds: List[str] = [] # List of User UIDs (Students)

class GradeBase(BaseModel):
    studentId: str
    subjectId: str
    groupId: str
    gradeValue: str # Or float, depending on grading system

class GradeCreate(GradeBase):
    pass

class Grade(GradeBase):
    gradeId: str
    issuedBy: str # Teacher UID
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
    uid: str | None = None
    role: Role | None = None

class AssignStudentToGroup(BaseModel):
    studentId: str

class AssignTeacherToGroup(BaseModel):
    teacherId: str