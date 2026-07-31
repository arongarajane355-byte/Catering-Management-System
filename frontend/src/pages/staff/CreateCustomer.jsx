import { useState } from "react";
import axiosClient from "../../api/axiosClient.js";

const initialForm = {
  firstname: "",
  lastname: "",
  gender: "",
  age: "",
  contact_number: "",
  email: "",
  password: "",
};

export default function CreateCustomer() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await axiosClient.post("/users/customers", form);
      setMessage("Customer profile created and sent to Admin for verification.");
      setForm(initialForm);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create customer.");
    }
  }

  return (
    <div className="card">
      <h3>Create Customer Account</h3>
      <p className="hint-text">
        New customer accounts require Admin approval before the customer can log in.
      </p>
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit} className="stacked-form">
        <label>First Name</label>
        <input name="firstname" value={form.firstname} onChange={handleChange} required />

        <label>Last Name</label>
        <input name="lastname" value={form.lastname} onChange={handleChange} required />

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">-- Select --</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label>Age</label>
        <input type="number" name="age" value={form.age} onChange={handleChange} required />

        <label>Contact Number</label>
        <input name="contact_number" value={form.contact_number} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Temporary Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Create Customer</button>
      </form>
    </div>
  );
}
