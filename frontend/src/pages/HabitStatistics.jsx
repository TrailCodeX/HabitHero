import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HabitStatistics = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);

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

      setHabits(habitsWithStreaks);
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
    return <p style={{ marginLeft: "300px", padding: "2rem" }}>Loading statistics...</p>;

  const data = {
    labels: habits.map(habit => habit.name),
    datasets: [
      {
        label: "Current Streak (days)",
        data: habits.map(habit => habit.streak || 0),
        backgroundColor: habits.map(habit => {
          const streak = habit.streak || 0;
        //   if (streak === 0) return "rgba(156, 163, 175, 0.8)";
          if (streak < 7) return "rgba(245, 158, 11, 0.8)";
          if (streak < 30) return "rgba(249, 115, 22, 0.8)";
          if (streak < 100) return "rgba(239, 68, 68, 0.8)";
          return "rgba(139, 92, 246, 0.8)";
        }),
        borderColor: habits.map(habit => {
          const streak = habit.streak || 0;
          if (streak === 0) return "#040404ff";
          if (streak < 7) return "#000000ff";
          if (streak < 30) return "#f97316";
          if (streak < 100) return "#ef4444";
          return "#8b5cf6";
        }),
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 60,
      },
    ],
  };

  const maxStreak = Math.max(...habits.map(h => h.streak || 0), 10);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
      title: {
        display: true,
        text: "Habit Streak Overview",
        font: {
          size: 20,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            const streak = context.parsed.y;
            return `Current Streak: ${streak} days ${getStreakEmoji(streak)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxStreak + 5,
        ticks: {
          stepSize: 5,
          font: {
            size: 12,
            weight: "600",
          },
          callback: function (value) {
            return value + " days";
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        title: {
          display: true,
          text: "Streak Count",
          font: {
            size: 14,
            weight: "600",
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: "600",
          },
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Habits",
          font: {
            size: 14,
            weight: "600",
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        marginLeft: "300px",
        padding: "2rem",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            color: "#111827",
            textAlign: "center",
          }}
        >
          Habit Statistics
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          View your current habit streaks
        </p>

        {habits.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "3rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
            <div
              style={{
                fontWeight: "600",
                marginBottom: "0.5rem",
                fontSize: "1.125rem",
              }}
            >
              No statistics available
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Create some habits to see statistics here!
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                marginBottom: "2rem",
              }}
            >
              <Bar data={data} options={options} />
            </div>

            {/* Streak Legend */}
            <div
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#111827",
                }}
              >
                Streak Levels
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(245, 158, 11, 0.8)",
                      borderRadius: "0.5rem",
                      border: "2px solid #f59e0b",
                    }}
                  ></div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.875rem" }}>
                      1-6 days 🔥
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Building Momentum
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(249, 115, 22, 0.8)",
                      borderRadius: "0.5rem",
                      border: "2px solid #f97316",
                    }}
                  ></div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.875rem" }}>
                      7-29 days 🔥🔥
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Getting Strong
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(239, 68, 68, 0.8)",
                      borderRadius: "0.5rem",
                      border: "2px solid #ef4444",
                    }}
                  ></div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.875rem" }}>
                      30-99 days 🔥🔥🔥
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      On Fire!
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(139, 92, 246, 0.8)",
                      borderRadius: "0.5rem",
                      border: "2px solid #8b5cf6",
                    }}
                  ></div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.875rem" }}>
                      100+ days 🏆
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Legend!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Habit Summary Cards */}
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#111827",
                }}
              >
                Detailed Breakdown
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1rem",
                }}
              >
                {habits.map((habit) => {
                  const streak = habit.streak || 0;
                  const color = getStreakColor(streak);

                  return (
                    <div
                      key={habit.id}
                      style={{
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "0.75rem",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        borderLeft: `4px solid ${color}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "#1f2937",
                            flex: 1,
                          }}
                        >
                          {habit.name}
                        </h3>
                        
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem",
                          backgroundColor: "#f9fafb",
                          borderRadius: "0.5rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div style={{ fontSize: "2.5rem" }}>
                          {getStreakEmoji(streak)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#80726bff",
                              marginBottom: "0.25rem",
                            }}
                          >
                            Current Streak
                          </div>
                          <div
                            style={{
                              fontSize: "2rem",
                              fontWeight: "bold",
                              color: color,
                            }}
                          >
                            {streak}
                          </div>
                          <div
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "#6b7280",
                            }}
                          >
                            days
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                          textAlign: "center",
                          fontStyle: "italic",
                        }}
                      >
                        {streak === 0 && "Start your journey today! 🚀"}
                        {streak > 0 && streak < 7 && "Keep it up! You're building momentum! 💪"}
                        {streak >= 7 && streak < 30 && "Great job! You're on a roll! 🔥"}
                        {streak >= 30 && streak < 100 && "Amazing! You're unstoppable! 🌟"}
                        {streak >= 100 && "Legendary status! You're an inspiration! 🏆"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HabitStatistics;