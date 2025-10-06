import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({
    totalHabits: 0,
    activeStreaks: 0,
    completedToday: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchHabits = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/habits/user/${userId}/today-status`
      );

      const habitsWithStreaks = await Promise.all(
        res.data.map(async (habit) => {
          try {
            const streakRes = await axios.get(
              `http://127.0.0.1:8000/habits/${habit.id}/streak`
            );
            return { ...habit, streak: streakRes.data.streak || 0 };
          } catch (err) {
            console.error(`Error fetching streak for habit ${habit.id}:`, err);
            return { ...habit, streak: 0 };
          }
        })
      );

      setHabits(habitsWithStreaks);

      // Calculate statistics
      const totalHabits = habitsWithStreaks.length;
      const activeStreaks = habitsWithStreaks.filter(h => h.streak > 0).length;
      const completedToday = habitsWithStreaks.filter(h => h.completed).length;
      const longestStreak = Math.max(...habitsWithStreaks.map(h => h.streak || 0), 0);

      setStats({
        totalHabits,
        activeStreaks,
        completedToday,
        longestStreak,
      });
    } catch (err) {
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [userId]);

  if (!userId) {
    return (
      <div style={{ marginLeft: "300px", padding: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
            Welcome to Habit Hero 🚀
          </h1>
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "1.125rem", color: "#6b7280" }}>
              Please log in to view your statistics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ marginLeft: "300px", padding: "2rem" }}>
        <p>Loading your statistics...</p>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: "300px", padding: "2rem", backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#111827" }}>
          Welcome to Habit Hero...
        </h1>
        <p style={{ fontSize: "1rem", color: "#6b7280", marginBottom: "2rem" }}>
          Track your progress and build better habits every day
        </p>

  
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "#404348ff", marginBottom: "0.5rem" }}>
              Total Habits
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6" }}>
              {stats.totalHabits}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
              {stats.totalHabits === 0 ? "Create your first habit!" : "Keep building!"}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "#404348ff", marginBottom: "0.5rem" }}>
              Active Streaks
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#10b981" }}>
              {stats.activeStreaks}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
              {stats.activeStreaks > 0 ? "Great momentum! " : "Start your first streak!"}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", 
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "#404348ff", marginBottom: "0.5rem" }}>
              Completed Today
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#f59e0b" }}>
              {stats.completedToday}/{stats.totalHabits}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
              {stats.completedToday === stats.totalHabits && stats.totalHabits > 0
                ? "Perfect day! ⭐"
                : "Keep going!"}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "#404348ff", marginBottom: "0.5rem" }}>
              Longest Streak
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#8b5cf6" }}>
              {stats.longestStreak}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
              {stats.longestStreak >= 100 ? "Legend! 🏆" : 
               stats.longestStreak >= 30 ? "On fire! 🔥🔥🔥" :
               stats.longestStreak >= 7 ? "Getting strong! 🔥🔥" :
               stats.longestStreak > 0 ? "Building up! " : "Start today!"}
            </div>
          </div>
        </div>

        {/* Recent Habits Section */}
        {habits.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "#111827",
              }}
            >
              Your Habits Today
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem",
              }}
            >
              {habits.slice(0, 6).map((habit) => (
                <div
                  key={habit.id}
                  style={{
                    padding: "1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    backgroundColor: habit.completed ? "#f0fdf4" : "#fefce8",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {habit.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "1.25rem",
                      }}
                    >
                      {habit.completed ? "✅" : "⏳"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}
                  >
                    Streak: {habit.streak || 0} days 
                  </div>
                </div>
              ))}
            </div>
            {habits.length > 6 && (
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <Link
                  to="/track"
                  style={{
                    color: "#3b82f6",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;