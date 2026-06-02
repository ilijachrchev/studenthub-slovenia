import EventCard from "./EventCard";

function EventList({ events, activeFilter = "All" }) {
  if (events.length === 0) {
    const message =
      activeFilter === "All"
        ? "No events yet. Check back soon!"
        : `No events found for "${activeFilter}".`;
    return <p className="home-status">{message}</p>;
  }

  return (
    <div className="event-list">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default EventList;