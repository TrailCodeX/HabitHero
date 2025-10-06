import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const HabitTrack = () => {
  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
    else setLoading(false);
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

      const newCheckins = {};
      for (let habit of habitsWithStreaks) {
        try {
          const checkinRes = await axios.get(
            `http://127.0.0.1:8000/checkins/habit/${habit.id}`
          );
          newCheckins[habit.id] = { all: checkinRes.data };
        } catch (err) {
          console.error(`Error fetching checkins for habit ${habit.id}:`, err);
          newCheckins[habit.id] = { all: [] };
        }
      }

      setHabits(habitsWithStreaks);
      setCheckins(newCheckins);
      setSelectedHabit(habitsWithStreaks[0] || null);
    } catch (err) {
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [userId]);

  const getStreakColor = (streak) => {
    if (streak === 0) return "#9ca3af";
    if (streak < 7) return "#f59e0b";
    if (streak < 30) return "#f97316";
    if (streak < 100) return "#ef4444";
    return "#8b5cf6";
  };

  const getStreakEmoji = (streak) => {
    if (streak === 0) return "🔥";
    if (streak < 7) return "🔥";
    if (streak < 30) return "🔥🔥";
    if (streak < 100) return "🔥🔥🔥";
    return "🏆";
  };

  if (!userId)
    return <p style={{ marginLeft: "300px", padding: "2rem" }}>Please log in first.</p>;
  if (loading)
    return <p style={{ marginLeft: "300px", padding: "2rem" }}>Loading habits...</p>;

  return (
    <div style={{ marginLeft: "300px", backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem", textAlign: "center" }}>
          Track Your Habits
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem", textAlign: "center" }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {habits.length === 0 ? (
          <div
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
            <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>No habits found</div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Create some habits to start tracking!
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
                All Habits ({habits.length})
              </h2>
              {habits.map((habit) => {
                const streakCount = habit.streak || 0;
                return (
                  <div
                    key={habit.id}
                    onClick={() => setSelectedHabit(habit)}
                    style={{
                      border: selectedHabit?.id === habit.id ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "1.25rem",
                      marginBottom: "1rem",
                      backgroundColor: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>
                        {habit.name}
                      </h3>
                      <span
                        style={{
                          backgroundColor: habit.completed ? "#d1fae5" : "#fef3c7",
                          color: habit.completed ? "#065f46" : "#92400e",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {habit.completed ? "Completed" : "⏳ Pending"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: habit.completed ? "#dcfce7" : "#fef3c7",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      <span style={{ color: getStreakColor(streakCount) }}>
                        {getStreakEmoji(streakCount)} {streakCount} day streak
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ position: "sticky", top: "2rem", height: "fit-content" }}>
              {selectedHabit ? (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    padding: "1.5rem",
                    backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>
                    {selectedHabit.name}
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
                    Track your progress on the calendar below
                  </p>

                  <div style={{ 
                    display: "flex", 
                    gap: "1.5rem", 
                    marginBottom: "1.5rem", 
                    padding: "1rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ 
                        width: "24px", 
                        height: "24px", 
                        borderRadius: "0.375rem", 
                        backgroundColor: "#059669",
                        boxShadow: "0 2px 4px rgba(5, 150, 105, 0.3)"
                      }}></div>
                      <span style={{ fontWeight: "500" }}>Completed</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ 
                        width: "24px", 
                        height: "24px", 
                        borderRadius: "0.375rem", 
                        backgroundColor: "#d97706",
                        boxShadow: "0 2px 4px rgba(217, 119, 6, 0.3)"
                      }}></div>
                      <span style={{ fontWeight: "500" }}>Pending</span>
                    </div>
                  </div>

                  <div style={{ 
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}>
                    <Calendar
                      tileClassName={({ date, view }) => {
                        if (view === "month") {
                          const habitCheckins = checkins[selectedHabit.id];
                          
                          if (!habitCheckins || !habitCheckins.all) return null;

                          const formatDate = (d) => {
                            const dateObj = d instanceof Date ? d : new Date(d);
                            return dateObj.toISOString().split('T')[0];
                          };

                          const calendarDateStr = formatDate(date);
                          
                          const match = habitCheckins.all.find(checkin => {
                            const checkinDateStr = formatDate(checkin.date);
                            return checkinDateStr === calendarDateStr;
                          });

                          if (match) {
                            return match.completed ? "completed-day" : "pending-day";
                          }
                        }
                        return null;
                      }}
                    />
                  </div>

                  <style>{`
                    .react-calendar {
                      width: 100%;
                      border: none !important;
                      font-family: inherit;
                      background: white;
                      padding: 1rem;
                    }

                    .react-calendar__navigation {
                      display: flex;
                      margin-bottom: 1rem;
                      background: #f9fafb;
                      border-radius: 0.5rem;
                      padding: 0.5rem;
                    }

                    .react-calendar__navigation button {
                      min-width: 44px;
                      background: transparent;
                      font-size: 1rem;
                      font-weight: 600;
                      color: #1f2937;
                      border: none;
                      border-radius: 0.375rem;
                      padding: 0.5rem;
                      transition: all 0.2s;
                    }

                    .react-calendar__navigation button:enabled:hover,
                    .react-calendar__navigation button:enabled:focus {
                      background: #e5e7eb;
                    }

                    .react-calendar__navigation button:disabled {
                      background: transparent;
                      color: #9ca3af;
                    }

                    .react-calendar__month-view__weekdays {
                      text-align: center;
                      text-transform: uppercase;
                      font-weight: 700;
                      font-size: 0.75rem;
                      color: #6b7280;
                      margin-bottom: 0.5rem;
                    }

                    .react-calendar__month-view__weekdays__weekday {
                      padding: 0.75rem;
                    }

                    .react-calendar__tile {
                      max-width: 100%;
                      padding: 1rem 0.5rem;
                      background: transparent;
                      text-align: center;
                      font-size: 0.875rem;
                      font-weight: 500;
                      color: #374151;
                      border: none;
                      border-radius: 0.5rem;
                      transition: all 0.2s;
                      margin: 2px;
                    }

                    .react-calendar__tile:enabled:hover,
                    .react-calendar__tile:enabled:focus {
                      background: #f3f4f6;
                    }

                    .react-calendar__tile--now {
                      background: ${(selectedHabit?.streak || 0) > 0 ? '#059669' : '#d97706'} !important;
                      font-weight: 700;
                      color: white !important;
                      box-shadow: ${(selectedHabit?.streak || 0) > 0 ? '0 2px 4px rgba(5, 150, 105, 0.3)' : '0 2px 4px rgba(217, 119, 6, 0.3)'};
                    }

                    .react-calendar__tile--now:enabled:hover {
                      background: ${(selectedHabit?.streak || 0) > 0 ? '#047857' : '#b45309'} !important;
                      transform: scale(1.05);
                      box-shadow: ${(selectedHabit?.streak || 0) > 0 ? '0 4px 8px rgba(4, 120, 87, 0.4)' : '0 4px 8px rgba(180, 83, 9, 0.4)'};
                    }

                    .react-calendar__tile--active {
                      background: #3b82f6;
                      color: white;
                    }

                    .react-calendar__tile--active:enabled:hover {
                      background: #2563eb;
                    }

                    .react-calendar__tile.completed-day {
                      background: #059669 !important;
                      color: white !important;
                      font-weight: 700 !important;
                      border-radius: 0.5rem !important;
                      box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);
                    }

                    .react-calendar__tile.completed-day:enabled:hover,
                    .react-calendar__tile.completed-day:enabled:focus {
                      background: #047857 !important;
                      transform: scale(1.05);
                      box-shadow: 0 4px 8px rgba(4, 120, 87, 0.4);
                    }

                    .react-calendar__tile.completed-day abbr {
                      color: white !important;
                    }

                    .react-calendar__tile.pending-day {
                      background: #d97706 !important;
                      color: white !important;
                      font-weight: 700 !important;
                      border-radius: 0.5rem !important;
                      box-shadow: 0 2px 4px rgba(217, 119, 6, 0.3);
                    }

                    .react-calendar__tile.pending-day:enabled:hover,
                    .react-calendar__tile.pending-day:enabled:focus {
                      background: #b45309 !important;
                      transform: scale(1.05);
                      box-shadow: 0 4px 8px rgba(180, 83, 9, 0.4);
                    }

                    .react-calendar__tile.pending-day abbr {
                      color: white !important;
                    }

                    .react-calendar__tile--now.completed-day {
                      background: #059669 !important;
                      color: white !important;
                    }

                    .react-calendar__tile--now.pending-day {
                      background: #d97706 !important;
                      color: white !important;
                    }

                    .react-calendar__month-view__days__day--neighboringMonth {
                      color: #d1d5db;
                    }

                    .react-calendar__month-view__days__day--weekend {
                      color: #ef4444;
                    }

                    .react-calendar__month-view__days__day--weekend.completed-day,
                    .react-calendar__month-view__days__day--weekend.pending-day {
                      color: white !important;
                    }
                  `}</style>

                  <div style={{ marginTop: "1.5rem", padding: "1.5rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", textAlign: "center" }}>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Current Streak</div>
                    <div style={{ fontSize: "3rem", fontWeight: "bold", color: getStreakColor(selectedHabit.streak || 0), marginBottom: "0.5rem" }}>
                      {selectedHabit.streak || 0}
                    </div>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                      {getStreakEmoji(selectedHabit.streak || 0)}
                    </div>
                    <div style={{ fontSize: "0.875rem", fontWeight: "600", color: getStreakColor(selectedHabit.streak || 0) }}>
                      {selectedHabit.streak || 0} day streak
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    padding: "3rem",
                    backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  <p>Select a habit to view its calendar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTrack;