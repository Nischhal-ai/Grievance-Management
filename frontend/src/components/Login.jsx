import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const BASE_URL = "https://grievance-management-9r84.onrender.com";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/login`, form);

      console.log(res.data);

      if (!res.data.token) {
        alert("Login failed: No token received");
        return;
      }

      // save token
      localStorage.setItem("token", res.data.token);

      alert("Login successful");

      // redirect to dashboard
      window.location.href = "/#/dashboard";

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Invalid login");
    }
  };

  return (
    <div className="login-container">
      <h2>Student Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button type="button" onClick={handleLogin}>
        Login
      </button>

      <p>
        New user? <Link to="/register" className="auth-link">Register</Link>
      </p>
    </div>
  );
}

export default Login;