from sqlalchemy.orm import Session
from datetime import date, datetime
from fastapi import HTTPException
from . import models, schemas


# ---------------- USERS ----------------
def create_user(db: Session, username: str, email: str, password: str):
    """Create a new user"""
    db_user = models.User(username=username, email=email, password=password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    """Get a user by email"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str):
    """Get a user by username"""
    return db.query(models.User).filter(models.User.username == username).first()


def get_user(db: Session, user_id: int):
    """Get a user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def login_user(db: Session, email: str, password: str):
    """Login user by checking email and password"""
    user = get_user_by_email(db, email)
    if not user or user.password != password:
        return None
    return user


# ---------------- HABITS ----------------
def create_habit(db: Session, owner_id: int, name: str, category: str, frequency: str,
                start_date: date, target_day: str = None, interval_hours: int = None):
    """Create a new habit and initialize a check-in with completed=False"""
    # 1️⃣ Create the habit
    db_habit = models.Habit(
        owner_id=owner_id,
        name=name,
        category=category,
        frequency=frequency,
        start_date=start_date,
        target_day=target_day,
        interval_hours=interval_hours
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)

    # 2️⃣ Create initial check-in record for today with completed=False
    db_checkin = models.CheckIn(
        habit_id=db_habit.id,
        date=date.today(),
        completed=False,  # Use lowercase 'completed'
        completed_at=None
    )
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)

    return db_habit



def get_habits_by_user(db: Session, owner_id: int):
    return db.query(models.Habit).filter(models.Habit.owner_id == owner_id).all()


def get_habit(db: Session, habit_id: int):
    """Get a habit by ID"""
    return db.query(models.Habit).filter(models.Habit.id == habit_id).first()


def delete_habit(db: Session, habit_id: int):
    """Delete a habit"""
    habit = get_habit(db, habit_id)
    if habit:
        db.delete(habit)
        db.commit()
        return True
    return False


# ---------------- CHECKINS ----------------
def create_checkin(db: Session, checkin: schemas.CheckInCreate):
    db_checkin = models.CheckIn(
        habit_id=checkin.habit_id,
        date=checkin.date,
        Completed=False 
    )
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin



def get_checkins_by_habit(db: Session, habit_id: int):
    """Get all check-ins for a habit"""
    return db.query(models.CheckIn).filter(models.CheckIn.habit_id == habit_id).all()


def get_today_checkin(db: Session, habit_id: int):
    """Get today's check-in for a habit"""
    return db.query(models.CheckIn).filter(
        models.CheckIn.habit_id == habit_id,
        models.CheckIn.date == date.today()
    ).first()


# ---------------- HABIT STREAK ----------------
def get_habit_streak(db: Session, habit_id: int):
    """Calculate habit streak based on consecutive completed days"""
    habit = get_habit(db, habit_id)
    if not habit:
        return 0
    
    checkins = (
        db.query(models.CheckIn)
        .filter(models.CheckIn.habit_id == habit_id, models.CheckIn.completed == True)
        .order_by(models.CheckIn.date.desc())
        .all()
    )

    if not checkins:
        return 0

    today = date.today()
    
    # Check if most recent completed check-in is today or yesterday
    most_recent = checkins[0].date
    days_since_last = (today - most_recent).days
    
    # If last completion was more than 1 day ago, streak is broken
    if days_since_last > 1:
        return 0
    
    # If last completion was today or yesterday, start with streak of 1
    streak = 1
    
    # Check consecutive days
    for i in range(1, len(checkins)):
        days_diff = (checkins[i - 1].date - checkins[i].date).days
        if days_diff == 1:
            streak += 1
        else:
            break
    
    return streak


# ---------------- HABIT STATUS ----------------
def get_habit_status(db: Session, habit_id: int):
    """Get the status of a habit for today"""
    habit = get_habit(db, habit_id)
    if not habit:
        return None

    today = date.today()
    today_checkin = get_today_checkin(db, habit_id)

    is_due_today = False
    if habit.frequency == "daily":
        is_due_today = True
    elif habit.frequency == "weekly":
        current_day = today.strftime("%A")
        is_due_today = (habit.target_day == current_day)

    # Compute status based on completed field
    if today_checkin and today_checkin.completed:
        status = "Completed"
    elif is_due_today:
        status = "Pending"
    else:
        status = "Not Due"

    # Get all check-ins (both completed and pending)
    all_checkins = db.query(models.CheckIn).filter(
        models.CheckIn.habit_id == habit_id
    ).order_by(models.CheckIn.date.desc()).all()

    # Get only completed check-ins
    completed_checkins = [c for c in all_checkins if c.completed]
    
    last_completed = completed_checkins[0] if completed_checkins else None

    return {
        "habit_id": habit.id,
        "habit_name": habit.name,
        "category": habit.category,
        "frequency": habit.frequency,
        "target_day": habit.target_day,
        "status": status,
        "streak": get_habit_streak(db, habit_id),
        "last_completed": last_completed.date if last_completed else None,
        "is_due_today": is_due_today,
        "all_checkins": [
            {
                "date": c.date.isoformat(),
                "completed": c.completed,
                "completed_at": c.completed_at.isoformat() if c.completed_at else None,
                "note": c.note
            } for c in all_checkins
        ]
    }


def get_all_habits_status(db: Session, owner_id: int):
    """Get status of all habits for a user"""
    habits = get_habits_by_user(db, owner_id)
    return [get_habit_status(db, habit.id) for habit in habits]


def get_streak(db: Session, habit_id: int):
    """Calculate streak for a habit based on frequency"""
    habit = get_habit(db, habit_id)
    if not habit:
        return 0

    checkins = (
        db.query(models.CheckIn)
        .filter(models.CheckIn.habit_id == habit_id, models.CheckIn.completed == True)
        .order_by(models.CheckIn.date.desc())
        .all()
    )
    
    if not checkins:
        return 0

    today = date.today()
    most_recent = checkins[0].date
    
    # Check based on frequency type
    if habit.frequency == "daily":
        # For daily habits, check if last completion was today or yesterday
        days_since_last = (today - most_recent).days
        if days_since_last > 1:
            return 0
        
        streak = 1
        for i in range(1, len(checkins)):
            if (checkins[i - 1].date - checkins[i].date).days == 1:
                streak += 1
            else:
                break

    elif habit.frequency == "weekly":
        # For weekly habits, check consecutive weeks
        current_week = today.isocalendar()[1]
        most_recent_week = most_recent.isocalendar()[1]
        
        # If last completion was more than 1 week ago, streak is broken
        if current_week - most_recent_week > 1:
            return 0
        
        streak = 1
        for i in range(1, len(checkins)):
            prev = checkins[i - 1]
            curr = checkins[i]
            if prev.date.isocalendar()[1] - curr.date.isocalendar()[1] == 1:
                streak += 1
            else:
                break

    elif habit.frequency == "hourly" and habit.interval_hours:
        # For hourly habits, check if within the interval
        if not checkins[0].completed_at:
            return 0
        
        time_since_last = (datetime.now() - checkins[0].completed_at).total_seconds() / 3600
        if time_since_last > habit.interval_hours * 2:  # Allow some buffer
            return 0
        
        streak = 1
        for i in range(1, len(checkins)):
            prev = checkins[i - 1]
            curr = checkins[i]
            if not prev.completed_at or not curr.completed_at:
                break
            diff = (prev.completed_at - curr.completed_at).total_seconds() / 3600
            if diff <= habit.interval_hours + 0.1:
                streak += 1
            else:
                break
    else:
        # Default to daily calculation
        days_since_last = (today - most_recent).days
        if days_since_last > 1:
            return 0
        streak = 1
        for i in range(1, len(checkins)):
            if (checkins[i - 1].date - checkins[i].date).days == 1:
                streak += 1
            else:
                break

    return streak
def get_incomplete_checkins_by_user(db: Session, user_id: int):
    return (
        db.query(models.CheckIn)
        .join(models.Habit)
        .filter(models.Habit.user_id == user_id, models.CheckIn.Completed == False)
        .all()
    )


def mark_checkin_completed(db: Session, habit_id: int, checkin_date: date = None):
    """Mark a habit's checkin as completed for a specific date (defaults to today)"""
    if checkin_date is None:
        checkin_date = date.today()
    
    # Find the checkin for this habit and date
    db_checkin = db.query(models.CheckIn).filter(
        models.CheckIn.habit_id == habit_id,
        models.CheckIn.date == checkin_date
    ).first()
    
    if not db_checkin:
        # Create new checkin if it doesn't exist
        db_checkin = models.CheckIn(
            habit_id=habit_id,
            date=checkin_date,
            completed=True,
            completed_at=datetime.now()
        )
        db.add(db_checkin)
    else:
        # Update existing checkin
        db_checkin.completed = True
        db_checkin.completed_at = datetime.now()
    
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

def mark_checkin_incomplete(db: Session, habit_id: int, checkin_date: date = None):
    """Mark a habit's checkin as incomplete for a specific date (defaults to today)"""
    if checkin_date is None:
        checkin_date = date.today()
    
    db_checkin = db.query(models.CheckIn).filter(
        models.CheckIn.habit_id == habit_id,
        models.CheckIn.date == checkin_date
    ).first()
    
    if not db_checkin:
        raise ValueError("Check-in not found")
    
    db_checkin.completed = False
    db_checkin.completed_at = None
    db.commit()
    db.refresh(db_checkin)
    return db_checkin