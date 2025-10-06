import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css"; // external CSS for styling

const Sidebar = () => {
  const location = useLocation();

  const links = [
   
    { name: "Create Habit", path: "/create-habit" },
    { name: "My Habit", path: "/my-habits" },
    { name: "Track Habit", path: "/track-habit" },
    { name: "Statistics", path: "/statistics" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="sidebar">
      <h1 className="sidebar-title">Habit Hero</h1>

      <nav className="sidebar-links">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`sidebar-link ${
              location.pathname === link.path ? "active" : ""
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
