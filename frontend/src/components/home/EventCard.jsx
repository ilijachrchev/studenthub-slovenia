import { Link } from "react-router-dom";
import { Sparkle, Bookmark } from "../reusable/Icons";
import EventTagList from "../events/EventTagList";
import EventRegistrationLabel from "./EventRegistrationLabel";

function EventCard({ event, saved = false, onToggleSave }) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSave) onToggleSave(event.id);
  };

  return (
    <Link to={`/events/${event.id}`} className="event-card-link">
      <div className="event-card">
        <div className="event-card-header">
          <EventTagList tags={event.tags || []} />

          <div className="event-card-header-right">
            {event.score > 0 && (
              <span className="event-badge">
                <Sparkle size={13} />
                Recommended For You!
              </span>
            )}

            {onToggleSave && (
              <button
                type="button"
                className={`event-save-btn ${saved ? "saved" : ""}`}
                onClick={handleSaveClick}
                aria-label={saved ? "Remove from saved" : "Save event"}
              >
                <Bookmark size={18} filled={saved} />
              </button>
            )}
          </div>
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