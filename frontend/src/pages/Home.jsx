import { useEffect, useState } from "react";
import "./css/Home.css";
import { Sparkle } from "../components/Icons";

function Home() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load events");
        } else {
          setEvents(data);
        }
      } catch {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const formatDate = (datet) =>
    new Date(datet).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <p className="home-status">Loading events…</p>;
  if (error) return <p className="home-status error-text">{error}</p>;

  return (
    <div className="home-page">
      <h1 className="home-title">Upcoming Events</h1>

      {events.length === 0 ? (
        <p className="home-status">No events yet. Check back soon.</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header"> 
                <div className="event-tags">
                  {event.tags.map((tag) => (
                    <span key={tag.id} className="event-tag">{tag.name}</span>
                  ))}
                </div>
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

              <span className="event-reg">
                {event.registration_type === "external"
                  ? "External registration"
                  : event.registration_type === "none"
                  ? "No registration"
                  : "Registration available"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;