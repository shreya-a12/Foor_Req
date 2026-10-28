import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "./log.png";
import bg from "./bglog.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("loggedIn", "true");
      setIsLoggedIn(true);
      navigate("/");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bg})` }}>
      <div className="login-nav">
        <img className="login-logo" src={logo} alt="logo" />
        <h2>SmartFood Vision</h2>
      </div>

      <motion.div className="login-box"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <h2>Welcome Back</h2>

        <form onSubmit={handleLogin}>
          <motion.input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <motion.input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={() => setShowPass(!showPass)}>
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <motion.button type="submit" className="login-submit-btn">
            Login
          </motion.button>
        </form>

        <p className="signup-redirect">
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
