import { useEffect, useState } from "react";
import EventList from "../components/home/EventList";
import HomeHero from "../components/home/HomeHero";
import HomeFilters from "../components/home/HomeFilters";
import "./css/Home.css";

function Home() {
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

  return (
    <div className="home-page">
      <HomeHero />
      <HomeFilters 
        filters={filters}
        active={activeFilter}
        onChange={setActiveFilter}
      />
      <EventList events={filteredEvents} activeFilter={activeFilter} />
    </div>
  );
}

export default Home;