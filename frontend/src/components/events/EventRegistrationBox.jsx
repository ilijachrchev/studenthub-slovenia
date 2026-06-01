function EventRegistrationBox({ event }) {
  return (
    <div className="detail-register">
      {event.registration_type === "built_in" && (
        <button className="btn-primary">Register</button>
      )}

      {event.registration_type === "external" && (
        <a
          className="btn-primary"
          href={event.external_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Register on external site
        </a>
      )}

      {event.registration_type === "none" && (
        <p className="detail-noreg">No registration required, just show up!</p>
      )}
    </div>
  );
}

export default EventRegistrationBox;