from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

# ---------------- Users ----------------
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

# ---------------- Habits ----------------
class HabitBase(BaseModel):
    name: str
    category: str
    frequency: str
    start_date: Optional[date] = None
    interval_hours: Optional[int] = None 
    target_day: Optional[str] = None  

class HabitCreate(HabitBase):
    owner_id: int

class Habit(HabitBase):
    id: int
    owner_id: int
    class Config:
        orm_mode = True

class HabitResponse(BaseModel):
    id: int  # ✅ Include habit ID
    name: str
    category: str
    frequency: str
    interval_hours: Optional[int]

    class Config:
        orm_mode = True

# ---------------- CheckIns ----------------
class CheckInBase(BaseModel):
    habit_id: int
    date: Optional[date] = None
    note: Optional[str] = None
    completed: bool = True
    completed_at: Optional[datetime] = None

class CheckInCreate(BaseModel):
    habit_id: int
    completed: bool = True
    note: Optional[str] = None

class CheckIn(CheckInBase):
    id: int
    habit_id: int

    class Config:
        orm_mode = True

# ---------------- Habit Status ----------------
class HabitStatus(BaseModel):
    habit_id: int
    habit_name: str
    category: str
    frequency: str
    target_day: Optional[str] = None
    status: str  # "completed", "pending", "not_due"
    streak: int
    last_completed: Optional[date] = None
    is_due_today: bool

