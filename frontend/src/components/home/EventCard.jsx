import { Link } from "react-router-dom";
import { Sparkle } from "../reusable/Icons";
import EventTagList from "../events/EventTagList";
import EventRegistrationLabel from "./EventRegistrationLabel";

function EventCard({ event }) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Link to={`/events/${event.id}`} className="event-card-link">
      <div className="event-card">
        <div className="event-card-header">
          <EventTagList tags={event.tags} />

          {event.score > 0 && (
            <span className="event-badge">
              <Sparkle size={13} />
              Recommended For You!
            </span>
          )}
        </div>

        <h2 className="event-title">{event.title}</h2>
        <p className="event-org">by {event.organization_name}</p>

        <p className="event-meta">
          {formatDate(event.start_datetime)} · {event.location}
        </p>

        <p className="event-desc">{event.description}</p>

        <EventRegistrationLabel type={event.registration_type} />
      </div>
    </Link>
  );
}

export default EventCard;