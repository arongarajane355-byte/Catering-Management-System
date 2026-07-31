import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient.js";

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    event_type: "",
    event_date: "",
    venue: "",
    guest_count: "",
    notes: "",
    service_id: "",
    quantity: 1,
  });
  const [message, setMessage] = useState("");

  function loadBookings() {
    axiosClient.get("/bookings/mine").then(({ data }) => setBookings(data.bookings));
  }

  useEffect(() => {
    loadBookings();
    axiosClient.get("/services/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await axiosClient.post("/bookings", {
        event_type: form.event_type,
        event_date: form.event_date,
        venue: form.venue,
        guest_count: form.guest_count || null,
        notes: form.notes,
        items: [{ service_id: form.service_id, quantity: Number(form.quantity) }],
      });
      setMessage("Booking submitted! (Input stage) Staff will review it shortly.");
      setForm({ ...form, event_type: "", event_date: "", venue: "", guest_count: "", notes: "" });
      loadBookings();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to submit booking.");
    }
  }

  return (
    <div className="dashboard">
      <h2>Customer Dashboard</h2>

      <section className="card">
        <h3>Request a Booking (Input)</h3>
        {message && <p className="hint-text">{message}</p>}
        <form onSubmit={handleSubmit} className="stacked-form">
          <label>Event Type</label>
          <input
            value={form.event_type}
            onChange={(e) => setForm({ ...form, event_type: e.target.value })}
            placeholder="e.g. Wedding, Birthday, Baptismal"
            required
          />

          <label>Event Date</label>
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            required
          />

          <label>Venue</label>
          <input
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            required
          />

          <label>Guest Count</label>
          <input
            type="number"
            value={form.guest_count}
            onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
          />

          <label>Service</label>
          <select
            value={form.service_id}
            onChange={(e) => setForm({ ...form, service_id: e.target.value })}
            required
          >
            <option value="">-- Select a service --</option>
            {categories.map((cat) => (
              <optgroup key={cat.category_id} label={cat.category_name}>
                {cat.services.map((s) => (
                  <option key={s.service_id} value={s.service_id}>
                    {s.name} (₱{s.price})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <label>Quantity</label>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />

          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button type="submit">Submit Booking</button>
        </form>
      </section>

      <section className="card">
        <h3>My Bookings</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Stage</th>
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
                  <span className={`badge badge-${b.stage}`}>{b.stage}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
