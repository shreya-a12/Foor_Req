import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import logo from "./log.png";
import bg from "./bgsign.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    phone: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("loggedIn", "true");
      setIsLoggedIn(true);
      navigate("/");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="signup-container" style={{ backgroundImage: `url(${bg})` }}>
      <div className="signup-nav">
        <img className="signup-logo" src={logo} alt="logo" />
        <h2>SmartFood Vision</h2>
      </div>

      <motion.div className="signup-box"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <h2>Create Your Account</h2>

        <form onSubmit={handleSignup}>
          <motion.input name="name" type="text" placeholder="Full Name" required onChange={handleChange} />
          <motion.input name="email" type="email" placeholder="Email Address" required onChange={handleChange} />

          <div className="password-wrapper">
            <motion.input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Password"
              required
              onChange={handleChange}
            />
            <span onClick={() => setShowPass(!showPass)}>
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <motion.input name="age" type="number" placeholder="Age" required onChange={handleChange} />
          <motion.input name="phone" type="tel" placeholder="Phone Number" required onChange={handleChange} />

          <motion.button type="submit" className="signup-submit-btn">
            Sign Up
          </motion.button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
