import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient.js";

export default function VerifyAccounts() {
  const [pending, setPending] = useState([]);

  function load() {
    axiosClient.get("/users/customers/pending").then(({ data }) => setPending(data.pending));
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id, decision) {
    await axiosClient.patch(`/users/customers/${id}/verify`, { decision });
    load();
  }

  return (
    <div className="card">
      <h3>Pending Customer Verifications</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Created By (Staff)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                {p.firstname} {p.lastname}
              </td>
              <td>{p.email}</td>
              <td>{p.contact_number}</td>
              <td>{p.created_by_name || "-"}</td>
              <td>
                <button onClick={() => decide(p.id, "approve")}>Approve</button>{" "}
                <button className="btn-danger" onClick={() => decide(p.id, "reject")}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
          {pending.length === 0 && (
            <tr>
              <td colSpan="6">No pending accounts to verify.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
