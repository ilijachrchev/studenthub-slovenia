import EventCard from "./EventCard";

function EventList({ events }) {
  if (events.length === 0) {
    return <p className="home-status">No events yet. Check back soon.</p>;
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