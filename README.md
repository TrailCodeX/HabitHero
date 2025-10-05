# HabitHero

A habit tracking web application to manage, track, and visualize your daily habits.

## Features

- User registration and login
- Create, track, and mark habits as complete
- View pending and completed habits
- Habit completion statistics displayed in a graph
- Undo completion for habits
- Responsive frontend design with React
- FastAPI backend with PostgreSQL database

## Setup Instructions

### Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
2. Create a virtual environment:
   ```bash
    python -m venv venv

3. Activate the virtual environment:
   ```bash
     venv\Scripts\activate

4. Install dependencies:
   ```bash
    pip install -r requirements.txt

5. Run the backend:
   ```bash
    uvicorn app:app --reload

### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend

2. Install dependencies:
   ```bash
   npm install

3.Run the frontend:
   ```bash
   npm start
