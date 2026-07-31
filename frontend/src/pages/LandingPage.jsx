import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient.js";
import ServiceCard from "../components/ServiceCard.jsx";

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient
      .get("/services/categories")
      .then(({ data }) => setCategories(data.categories))
      .catch(() => setError("Could not load services. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing-page">
      <header className="hero">
        <h1>Catering Management System</h1>
        <p>From intimate gatherings to grand celebrations — we handle the food, so you can enjoy the moment.</p>
      </header>

      <section className="services-section">
        <h2>Our Services</h2>

        {loading && <p>Loading services...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading &&
          !error &&
          categories.map((cat) => (
            <div key={cat.category_id} className="service-category">
              <h3>{cat.category_name}</h3>
              <p className="category-desc">{cat.category_description}</p>
              <div className="service-grid">
                {cat.services.length > 0 ? (
                  cat.services.map((s) => <ServiceCard key={s.service_id} service={s} />)
                ) : (
                  <p>No services listed yet under this category.</p>
                )}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
