import { Link } from "react-router-dom";
import { Sparkle } from "../reusable/Icons";
import EventTagList from "../events/EventTagList";

function HomeHero({event}) {
  const formatDate = (dateString) => new Date(dateString).toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: '2-digit',
    });

  return (
    <section className="home-hero">
      <div className="home-hero-body">
        <span className="home-hero-badge">
          <Sparkle size={13} />
          Recommended for you
        </span>

        <EventTagList tags={event.tags} className="home-hero-tags" />


        <h2 className="home-hero-title">{event.title}</h2>
        <p className="home-hero-org">by {event.organization_name}</p>
        <p className="home-hero-meta">
          {formatDate(Event.start_datetime)} · {event.location}
        </p>
      </div>

      <Link to={`/events/${event.id}`} className="home-hero-button">
        View Event
      </Link>
    </section>
  );
}

export default HomeHero;