export default function ServiceCard({ service }) {
  return (
    <div className="service-card">
      <h4>{service.name}</h4>
      <p>{service.description}</p>
      <span className="service-price">₱{Number(service.price).toLocaleString()}</span>
    </div>
  );
}
