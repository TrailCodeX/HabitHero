import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import HabitTrack from "./pages/HabitTrack";
import CreateHabit from "./pages/CreateHabit";
import MyHabit from "./pages/MyHabits";
import HabitStatistics from "./pages/HabitStatistics";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideSidebar = ["/", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {!hideSidebar && <Sidebar />}

      <div
        className={`flex-1 flex justify-center items-center p-6 ${
          hideSidebar ? "" : "ml-[220px]"
        }`}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/home" element={<Home />} />
                <Route path="/create-habit" element={<CreateHabit />} />
                <Route path="/track-habit" element={<HabitTrack />} />
                <Route path="/my-habits" element={<MyHabit />} />
                <Route path="/statistics" element={<HabitStatistics />} /> 
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
