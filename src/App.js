import React, { useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";
import logo from "./log.png";
import bg from "./bcg.png";
import Signup from "./Signup";
import Login from "./Login";
import UploadPhoto from "./UploadPhoto"; // ✅ added
import { FaUserCircle } from "react-icons/fa";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* ✅ added route */}
        <Route path="/upload-photo" element={<UploadPhoto />} />

        {/* Landing */}
        <Route
          path="/"
          element={
            <div
              className="landing"
              style={{ backgroundImage: `url(${bg})` }}
            >
              <motion.nav
                className="navbar"
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="nav-left">
                  <img src={logo} alt="logo" className="nav-logo" />
                  <h2>SmartFood Vision</h2>
                </div>

                <div className="nav-links">
                  {/* ALWAYS show these */}
                  <a href="#about">About</a>
                  <a href="#features">Features</a>
                  <a href="#contact">Contact</a>

                  {/* TOGGLE: When NOT logged in */}
                  {!isLoggedIn && (
                    <>
                      <Link to="/login">
                        <button className="login-btn">Login</button>
                      </Link>

                      <Link to="/signup">
                        <button className="signup-btn">Sign Up</button>
                      </Link>
                    </>
                  )}

                  {/* TOGGLE: When LOGGED IN */}
                  {isLoggedIn && (
                    <>
                      <button className="profile-btn">
                        <FaUserCircle size={30} />
                      </button>

                      <button className="logout-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </motion.nav>

              <motion.div
                className="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
              >
                <motion.div
                  className="hero-content"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  <h1>Welcome to SmartFood Vision</h1>
                  <p>
                    A next-generation platform that helps you analyze food,
                    detect items, and get precise nutritional insights instantly.
                  </p>

                  {/* CHANGE BUTTON: Create Profile → Upload Photo */}
                  {isLoggedIn ? (
                    <Link to="/upload-photo">   {/* ✅ added link wrapper */}
                      <motion.button
                        className="create-btn"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Upload Photo
                      </motion.button>
                    </Link>
                  ) : (
                    <Link to="/signup">
                      <motion.button
                        className="create-btn"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Create Your Profile
                      </motion.button>
                    </Link>
                  )}
                </motion.div>
              </motion.div>

              <motion.footer
                className="footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                <p>© 2025 SmartFood Vision | Designed with ❤️</p>
              </motion.footer>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
