import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const BASE_URL = "http://localhost:5000";

function Dashboard() {
  const [student, setStudent] = useState(null);
  const [grievances, setGrievances] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: ""
  });

  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!token) {
      window.location.href = "/#/";
      return;
    }

    const fetchData = async () => {
      try {
        const s = await axios.get(`${BASE_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStudent(s.data.student);

        const g = await axios.get(`${BASE_URL}/api/grievances`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setGrievances(g.data);

      } catch (err) {
        alert("Session expired");
        localStorage.removeItem("token");
        window.location.href = "/#/";
      }
    };

    fetchData();
  }, []);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category) {
      return alert("Fill all fields");
    }

    try {
      if (editingId) {
        // 🔹 UPDATE
        const res = await axios.put(
          `${BASE_URL}/api/grievances/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setGrievances(
          grievances.map(g => (g._id === editingId ? res.data : g))
        );

        alert("Updated successfully");

      } else {
        // 🔹 CREATE
        const res = await axios.post(
          `${BASE_URL}/api/grievances`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setGrievances([res.data, ...grievances]);

        alert("Submitted successfully");
      }

      // reset form
      setForm({ title: "", description: "", category: "" });
      setEditingId(null);

    } catch (err) {
      alert("Error occurred");
    }
  };

  /* ================= DELETE ================= */
  const deleteGrievance = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/grievances/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGrievances(grievances.filter(g => g._id !== id));

      alert("Deleted successfully");

    } catch (err) {
      alert("Error deleting");
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/#/";
  };

  if (!student) return <h2>Loading...</h2>;

  return (
    <div className="dashboard-container">
      <h2>Welcome {student.name}</h2>

      {/* ===== FORM ===== */}
      <h3>{editingId ? "Edit Grievance" : "Raise Grievance"}</h3>

      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <select
        value={form.category}
        onChange={(e) =>
          setForm({ ...form, category: e.target.value })
        }
      >
        <option value="">Select Category</option>
        <option>Academic</option>
        <option>Hostel</option>
        <option>Transport</option>
        <option>Other</option>
      </select>

      <button onClick={handleSubmit}>
        {editingId ? "Update" : "Submit"}
      </button>

      {editingId && (
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ title: "", description: "", category: "" });
          }}
        >
          Cancel
        </button>
      )}

      {/* ===== LIST ===== */}
      <h3>Your Grievances</h3>

      {grievances.length === 0 ? (
        <p>No grievances found</p>
      ) : (
        grievances.map(g => (
          <div key={g._id} className="card">
            <h4>{g.title}</h4>
            <p>{g.description}</p>

            <p><b>Category:</b> {g.category}</p>
            <p><b>Status:</b> {g.status}</p>
            <p>{new Date(g.createdAt).toLocaleString()}</p>

            {/* 🔹 EDIT */}
            <button onClick={() => {
              setForm({
                title: g.title,
                description: g.description,
                category: g.category
              });
              setEditingId(g._id);
            }}>
              Edit
            </button>

            {/* 🔹 DELETE */}
            <button onClick={() => deleteGrievance(g._id)}>
              Delete
            </button>
          </div>
        ))
      )}

      <br />
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;