from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app import crud, schemas, models
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Habit)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db)):
    """Create a new habit for a user"""
    return crud.create_habit(
        db=db,
        owner_id=habit.owner_id,
        name=habit.name,
        category=habit.category,
        frequency=habit.frequency,
        start_date=habit.start_date,
        target_day=habit.target_day,
        interval_hours=habit.interval_hours
    )

@router.get("/user/{user_id}", response_model=list[schemas.HabitResponse])
def get_habits(user_id: int, db: Session = Depends(get_db)):
    """Return all habits for a user"""
    habits = crud.get_habits_by_user(db, owner_id=user_id)
    return habits

@router.get("/user/{user_id}/today-status")
def get_habits_today_status(user_id: int, db: Session = Depends(get_db)):
    """Return all habits for today with their completion status"""
    today = date.today()
    
    habits = (
        db.query(models.Habit, models.CheckIn)
        .outerjoin(
            models.CheckIn,
            (models.Habit.id == models.CheckIn.habit_id) & (models.CheckIn.date == today)
        )
        .filter(models.Habit.owner_id == user_id)
        .all()
    )
    
    result = []
    for habit, checkin in habits:
        result.append({
            "id": habit.id,
            "name": habit.name,
            "category": habit.category,
            "frequency": habit.frequency,
            "completed": checkin.completed if checkin else False,
            "completed_at": checkin.completed_at.isoformat() if checkin and checkin.completed_at else None
        })
    
    return result

@router.get("/user/{user_id}/incomplete-today")
def get_incomplete_habits_today(user_id: int, db: Session = Depends(get_db)):
    """Return only today's incomplete habits for a user"""
    today = date.today()
    
    habits = (
        db.query(models.Habit, models.CheckIn)
        .outerjoin(
            models.CheckIn,
            (models.Habit.id == models.CheckIn.habit_id) & (models.CheckIn.date == today)
        )
        .filter(models.Habit.owner_id == user_id)
        .all()
    )
    
    result = []
    for habit, checkin in habits:
        if not checkin or not checkin.completed:
            result.append({
                "id": habit.id,
                "name": habit.name,
                "category": habit.category,
                "frequency": habit.frequency,
                "completed": checkin.completed if checkin else False,
            })
    
    return result

# THIS IS THE MISSING ENDPOINT - ADD IT
@router.get("/{habit_id}/streak")
def get_habit_streak_endpoint(habit_id: int, db: Session = Depends(get_db)):
    """Get the current streak for a specific habit"""
    habit = crud.get_habit(db, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    streak = crud.get_habit_streak(db, habit_id)
    return {"habit_id": habit_id, "streak": streak}

@router.delete("/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    """Delete a habit"""
    success = crud.delete_habit(db, habit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit deleted successfully"}