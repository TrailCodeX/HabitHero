from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import crud, models, schemas, database
from app.database import engine
from app.routers import users, habits, checkins

from pydantic import BaseModel

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Habit Hero API 🚀")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(habits.router, prefix="/habits", tags=["Habits"])
app.include_router(checkins.router, prefix="/checkins", tags=["CheckIns"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Habit Hero API 🚀"}

# Login endpoint
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or user.password != request.password:  # ⚠️ demo only, plain-text
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful", "user_id": user.id, "email": user.email}
