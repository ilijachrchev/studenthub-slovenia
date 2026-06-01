import { useEffect, useState } from "react";
import EventList from "../components/home/EventList";
import HomeHero from "../components/home/HomeHero";
import "./css/Home.css";

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

  if (loading) return <p className="home-status">Loading events…</p>;
  if (error) return <p className="home-status error-text">{error}</p>;

  return (
    <div className="home-page">
      <HomeHero />
      <EventList events={events} />
    </div>
  );
}

export default Home;