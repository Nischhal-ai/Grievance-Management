import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Register.css";

const BASE_URL = "http://localhost:5000";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    course: ""
  });

  const handleRegister = async () => {
    const { name, email, password, course } = form;

    if (!name || !email || !password || !course) {
      return alert("Please fill all fields");
    }

    try {
      await axios.post(`${BASE_URL}/api/register`, form);
      alert("Registered Successfully");
      window.location.href = "/#/";
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>

      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <input placeholder="Department" onChange={(e) => setForm({ ...form, course: e.target.value })} />

      <button onClick={handleRegister}>Register</button>

      <p>
        Already have account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Register;