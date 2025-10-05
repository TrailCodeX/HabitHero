from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import date, datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    habits = relationship("Habit", back_populates="owner")

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=False)  # e.g., fitness, work, learning
    frequency = Column(String, nullable=False) # daily / weekly
    start_date = Column(Date, default=date.today)
    target_day = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    interval_hours = Column(Integer, nullable=True)  # for "every 2 hours"
    owner = relationship("User", back_populates="habits")
    checkins = relationship("CheckIn", back_populates="habit")


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    date = Column(Date, default=date.today)
    note = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    habit = relationship("Habit", back_populates="checkins")
