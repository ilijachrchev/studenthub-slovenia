import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Wave } from "../components/reusable/Icons";
import EventList from "../components/home/EventList";
import HomeHero from "../components/home/HomeHero";
import HomeFilters from "../components/home/HomeFilters";
import "./css/Home.css";

function Home() {
  const {user} = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [tags, setTags] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    async function loadEvents() {
      try {
        const [evetnsRes, tagsRes] = await Promise.all([
          fetch("/api/events", { credentials: "include" }),
          fetch("/api/tags"),
        ]);

        const eventsData = await evetnsRes.json();
        const tagsData = await tagsRes.json();

        if (!evetnsRes.ok) {
          setError(eventsData.error || "Failed to load events");
        } else {
          setEvents(eventsData);
          setTags(Array.isArray(tagsData) ? tagsData : []);
        }
      } catch {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) return <p className="home-status">Loading events…</p>;
  if (error) return <p className="home-status error-text">{error}</p>;

  const filters = ["All", ...tags.map((tag) => tag.name)];
  const filteredEvents =
    activeFilter === "All"
      ? events
      : events.filter((event) =>
          event.tags.some((tag) => tag.name === activeFilter)
        );

  const featuredEvents = events[0]?.score >= 0 ? events[0] : null;

  const listEvents = featuredEvents
        ? events.filter((event) => event.id !== featuredEvents.id)
        : events;

  return (
    <div className="home-page">
      <div className="home-greeting">
        <h1 className="home-greeting-title">
          {user ? `Hi, ${user.first_name}` : "Find student events around you"}
          {user && (
            <span className="home-greeting-wave">
              <Wave size={26} />
            </span>
          )}
        </h1>
        <p className="home-greeting-subtitle">
          Discover workshops, hackathons, lectures, and career events from student organizations.
        </p>
      </div>
      <HomeFilters 
        filters={filters}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      {featuredEvents && <HomeHero event={featuredEvents}/>}

      <EventList events={filteredEvents} activeFilter={activeFilter} />
    </div>
  );
}

export default Home;