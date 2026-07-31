import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient.js";
import VerifyAccounts from "./VerifyAccounts.jsx";

const staffInitial = {
  firstname: "",
  lastname: "",
  gender: "",
  age: "",
  contact_number: "",
  email: "",
  password: "",
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("verify"); // "verify" | "bookings" | "staff"
  const [bookings, setBookings] = useState([]);
  const [staffForm, setStaffForm] = useState(staffInitial);
  const [staffMessage, setStaffMessage] = useState("");

  function loadProcessingBookings() {
    axiosClient
      .get("/bookings", { params: { stage: "processing" } })
      .then(({ data }) => setBookings(data.bookings));
  }

  useEffect(() => {
    if (tab === "bookings") loadProcessingBookings();
  }, [tab]);

  async function markCompleted(id) {
    await axiosClient.patch(`/bookings/${id}/stage`, {
      stage: "completed",
      notes: "Event served/delivered successfully.",
    });
    loadProcessingBookings();
  }

  async function handleCreateStaff(e) {
    e.preventDefault();
    setStaffMessage("");
    try {
      await axiosClient.post("/users/staff", staffForm);
      setStaffMessage("Staff account created.");
      setStaffForm(staffInitial);
    } catch (err) {
      setStaffMessage(err?.response?.data?.message || "Failed to create staff account.");
    }
  }

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>

      <div className="tabs">
        <button className={tab === "verify" ? "tab active" : "tab"} onClick={() => setTab("verify")}>
          Verify Customer Accounts
        </button>
        <button className={tab === "bookings" ? "tab active" : "tab"} onClick={() => setTab("bookings")}>
          Bookings in Process (Output)
        </button>
        <button className={tab === "staff" ? "tab active" : "tab"} onClick={() => setTab("staff")}>
          Create Staff Account
        </button>
      </div>

      {tab === "verify" && <VerifyAccounts />}

      {tab === "bookings" && (
        <section className="card">
          <h3>Bookings Being Processed</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.event_type}</td>
                  <td>{new Date(b.event_date).toLocaleDateString()}</td>
                  <td>{b.venue}</td>
                  <td>
                    <button onClick={() => markCompleted(b.id)}>Mark Completed (Output)</button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="5">No bookings currently in process.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {tab === "staff" && (
        <section className="card">
          <h3>Create Staff Account</h3>
          {staffMessage && <p className="hint-text">{staffMessage}</p>}
          <form onSubmit={handleCreateStaff} className="stacked-form">
            <label>First Name</label>
            <input
              value={staffForm.firstname}
              onChange={(e) => setStaffForm({ ...staffForm, firstname: e.target.value })}
              required
            />
            <label>Last Name</label>
            <input
              value={staffForm.lastname}
              onChange={(e) => setStaffForm({ ...staffForm, lastname: e.target.value })}
              required
            />
            <label>Gender</label>
            <select
              value={staffForm.gender}
              onChange={(e) => setStaffForm({ ...staffForm, gender: e.target.value })}
              required
            >
              <option value="">-- Select --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <label>Age</label>
            <input
              type="number"
              value={staffForm.age}
              onChange={(e) => setStaffForm({ ...staffForm, age: e.target.value })}
              required
            />
            <label>Contact Number</label>
            <input
              value={staffForm.contact_number}
              onChange={(e) => setStaffForm({ ...staffForm, contact_number: e.target.value })}
              required
            />
            <label>Email</label>
            <input
              type="email"
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              required
            />
            <label>Temporary Password</label>
            <input
              type="password"
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              required
            />
            <button type="submit">Create Staff</button>
          </form>
        </section>
      )}
    </div>
  );
}
