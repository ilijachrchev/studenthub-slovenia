function EventInfoBox({ event, formatDate }) {
  return (
    <div className="detail-info">
      <p>
        <strong>When:</strong> {formatDate(event.start_datetime)} - {formatDate(event.end_datetime)}
      </p>

      <p>
        <strong>Where:</strong> {event.location}
      </p>

      {event.capacity && (
        <p>
          <strong>Capacity:</strong> {event.capacity} spots
        </p>
      )}
    </div>
  );
}

export default EventInfoBox;