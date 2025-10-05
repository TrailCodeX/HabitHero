from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
from app import crud, schemas, database, models

router = APIRouter()

@router.post("/")
def mark_habit_done(checkin_data: dict, db: Session = Depends(database.get_db)):
    """Mark a habit as completed for today"""
    habit_id = checkin_data.get("habit_id")
    
    if not habit_id:
        raise HTTPException(status_code=400, detail="habit_id is required")
    
    today = date.today()
    
    # Check if checkin already exists for today
    existing_checkin = (
        db.query(models.CheckIn)
        .filter(
            models.CheckIn.habit_id == habit_id,
            models.CheckIn.date == today
        )
        .first()
    )
    
    if existing_checkin:
        # Update existing checkin to completed
        existing_checkin.completed = True
        existing_checkin.completed_at = datetime.now()
        db.commit()
        db.refresh(existing_checkin)
        return {
            "message": "Habit marked as done",
            "checkin": {
                "id": existing_checkin.id,
                "habit_id": existing_checkin.habit_id,
                "date": existing_checkin.date.isoformat(),
                "completed": existing_checkin.completed,
                "completed_at": existing_checkin.completed_at.isoformat() if existing_checkin.completed_at else None
            }
        }
    else:
        # Create new completed checkin
        new_checkin = models.CheckIn(
            habit_id=habit_id,
            date=today,
            completed=True,
            completed_at=datetime.now()
        )
        db.add(new_checkin)
        db.commit()
        db.refresh(new_checkin)
        return {
            "message": "Habit marked as done",
            "checkin": {
                "id": new_checkin.id,
                "habit_id": new_checkin.habit_id,
                "date": new_checkin.date.isoformat(),
                "completed": new_checkin.completed,
                "completed_at": new_checkin.completed_at.isoformat() if new_checkin.completed_at else None
            }
        }

@router.get("/habit/{habit_id}", response_model=List[schemas.CheckIn])
def get_checkins_by_habit(habit_id: int, db: Session = Depends(database.get_db)):
    return crud.get_checkins_by_habit(db, habit_id=habit_id)

@router.post("/{habit_id}/undo")
def undo_habit_completion(habit_id: int, db: Session = Depends(database.get_db)):
    """Undo today's habit completion"""
    today = date.today()
    
    # Find today's checkin for this habit
    checkin = (
        db.query(models.CheckIn)
        .filter(
            models.CheckIn.habit_id == habit_id,
            models.CheckIn.date == today
        )
        .first()
    )
    
    if not checkin:
        raise HTTPException(status_code=404, detail="No check-in found for today")
    
    # Mark as incomplete
    checkin.completed = False
    checkin.completed_at = None
    db.commit()
    db.refresh(checkin)
    
    return {
        "message": "Habit marked as incomplete",
        "checkin": {
            "id": checkin.id,
            "habit_id": checkin.habit_id,
            "date": checkin.date.isoformat(),
            "completed": checkin.completed,
            "completed_at": None
        }
    }

@router.put("/{checkin_id}/complete", response_model=schemas.CheckIn)
def complete_checkin(checkin_id: int, db: Session = Depends(database.get_db)):
    try:
        return crud.mark_checkin_completed(db, checkin_id=checkin_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))