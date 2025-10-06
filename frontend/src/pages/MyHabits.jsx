import React, { useEffect, useState } from "react";
import axios from "axios";

const MyHabit = () => {
  const [incompleteHabits, setIncompleteHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
    else setLoading(false);
  }, []);

  const fetchHabits = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/habits/user/${userId}/today-status`);
      
      const habitsWithStreaks = await Promise.all(
        res.data.map(async (habit) => {
          try {
            const streakRes = await axios.get(`http://127.0.0.1:8000/habits/${habit.id}/streak`);
            return { ...habit, streak: streakRes.data.streak };
          } catch (err) {
            console.error(`Error fetching streak for habit ${habit.id}:`, err);
            return { ...habit, streak: 0 };
          }
        })
      );
      
      const incomplete = habitsWithStreaks.filter(habit => !habit.completed);
      const completed = habitsWithStreaks.filter(habit => habit.completed);
      
      setIncompleteHabits(incomplete);
      setCompletedHabits(completed);
    } catch (err) {
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [userId]);

  const markDone = async (habitId) => {
    try {
      await axios.post("http://127.0.0.1:8000/checkins/", { habit_id: habitId });
      fetchHabits();
    } catch (err) {
      console.error(err);
      alert("Failed to mark habit as done");
    }
  };

  const undoCompletion = async (habitId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/checkins/${habitId}/undo`);
      fetchHabits();
    } catch (err) {
      console.error(err);
      alert("Failed to undo completion");
    }
  };

  const getStreakColor = (streak) => {
    if (streak === 0) return "#9ca3af";
    if (streak < 7) return "#f59e0b";
    if (streak < 30) return "#f97316";
    if (streak < 100) return "#ef4444";
    return "#8b5cf6";
  };

  const getStreakEmoji = (streak) => {
    if (streak === 0) return "";
    if (streak < 7) return "🔥";
    if (streak < 30) return "🔥🔥";
    if (streak < 100) return "🔥🔥🔥";
    return "🏆";
  };

  if (!userId) return <p style={{ padding: "2rem" }}>Please log in first.</p>;
  if (loading) return <p style={{ padding: "2rem" }}>Loading habits...</p>;

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#111827", textAlign: "center" }}>
          My Habits
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem", textAlign: "center" }}>
        {/* User ID: {userId} | */}
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1f2937" }}>Pending Habits</h2>
            <span style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: "600" }}>
              {incompleteHabits.length}
            </span>
          </div>

          {incompleteHabits.length === 0 ? (
            <div style={{ backgroundColor: "white", border: "2px dashed #e5e7eb", borderRadius: "0.5rem", padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
              <p style={{ fontSize: "1.125rem" }}>All caught up! No pending habits.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {incompleteHabits.map((habit) => (
                <div
                  key={habit.id}
                  style={{ border: "2px solid #fbbf24", borderRadius: "0.5rem", padding: "1.25rem", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: "600", fontSize: "1.125rem", color: "#1f2937", marginBottom: "0.25rem" }}>{habit.name}</h3>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                        <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", padding: "0.125rem 0.5rem", borderRadius: "0.25rem", marginRight: "0.5rem" }}>{habit.category}</span>
                        <span style={{ backgroundColor: "#e0e7ff", color: "#3730a3", padding: "0.125rem 0.5rem", borderRadius: "0.25rem" }}>{habit.frequency}</span>
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fef3c7", padding: "0.375rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem", fontWeight: "600" }}>
                        <span style={{ color: getStreakColor(habit.streak || 0) }}>{getStreakEmoji(habit.streak || 0)} {habit.streak || 0} day streak</span>
                      </div>
                    </div>
                    <button
                      onClick={() => markDone(habit.id)}
                      style={{ backgroundColor: "#10b981", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem", transition: "background-color 0.2s", marginLeft: "1rem" }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#059669"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#10b981"}
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1f2937" }}>Completed Today</h2>
            <span style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: "600" }}>{completedHabits.length}</span>
          </div>

          {completedHabits.length === 0 ? (
            <div style={{ backgroundColor: "white", border: "2px dashed #e5e7eb", borderRadius: "0.5rem", padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
              <p style={{ fontSize: "1.125rem" }}>No habits completed yet today.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {completedHabits.map((habit) => (
                <div key={habit.id} style={{ border: "2px solid #10b981", borderRadius: "0.5rem", padding: "1.25rem", backgroundColor: "#f0fdf4", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", opacity: 0.9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: "600", fontSize: "1.125rem", color: "#1f2937", marginBottom: "0.25rem" }}>{habit.name}</h3>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                        <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", padding: "0.125rem 0.5rem", borderRadius: "0.25rem", marginRight: "0.5rem" }}>{habit.category}</span>
                        <span style={{ backgroundColor: "#e0e7ff", color: "#3730a3", padding: "0.125rem 0.5rem", borderRadius: "0.25rem" }}>{habit.frequency}</span>
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#dcfce7", padding: "0.375rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem", fontWeight: "600" }}>
                        <span style={{ color: getStreakColor(habit.streak || 0) }}>{getStreakEmoji(habit.streak || 0)} {habit.streak || 0} day streak</span>
                      </div>
                    </div>
                    <button
                      onClick={() => undoCompletion(habit.id)}
                      style={{ backgroundColor: "#ef4444", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", transition: "background-color 0.2s", marginLeft: "1rem" }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                    >
                      Undo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyHabit;
