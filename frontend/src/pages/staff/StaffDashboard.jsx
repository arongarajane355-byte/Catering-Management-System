import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient.js";
import CreateCustomer from "./CreateCustomer.jsx";

export default function StaffDashboard() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("bookings"); // "bookings" | "create-customer"

  function loadBookings() {
    axiosClient.get("/bookings", { params: { stage: "input" } }).then(({ data }) =>
      setBookings(data.bookings)
    );
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function moveToProcessing(id) {
    await axiosClient.patch(`/bookings/${id}/stage`, {
      stage: "processing",
      notes: "Reviewed and confirmed by staff.",
    });
    loadBookings();
  }

  return (
    <div className="dashboard">
      <h2>Staff Dashboard</h2>

      <div className="tabs">
        <button className={tab === "bookings" ? "tab active" : "tab"} onClick={() => setTab("bookings")}>
          Incoming Bookings (Input)
        </button>
        <button
          className={tab === "create-customer" ? "tab active" : "tab"}
          onClick={() => setTab("create-customer")}
        >
          Create Customer Account
        </button>
      </div>

      {tab === "create-customer" && <CreateCustomer />}

      {tab === "bookings" && (
        <section className="card">
          <h3>New Booking Requests</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Guests</th>
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
                  <td>{b.guest_count || "-"}</td>
                  <td>
                    <button onClick={() => moveToProcessing(b.id)}>Move to Processing</button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="6">No pending booking requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
