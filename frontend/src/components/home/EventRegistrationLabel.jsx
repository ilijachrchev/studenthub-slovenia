function EventRegistrationLabel({ type }) {
  let label = "Registration available";

  if (type === "external") {
    label = "External registration";
  }

  if (type === "none") {
    label = "No registration";
  }

  return <span className="event-reg">{label}</span>;
}

export default EventRegistrationLabel;