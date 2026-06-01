import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./css/EventDetail.css";


function EventDetail() {
    const {id} = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvent() {
            try {
                const response = await fetch(`/api/events/${id}`);
                const data = await response.json();
                if (!response.ok) {
                    setError(data.error || "Failed to load event");
                } else {
                    setEvent(data);
                }
            } catch {
                setError("Failed to load event");
            } finally {
            setLoading(false);
        }
    }
    loadEvent();
    }, [id]);
    
    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    if (loading) return <p className="detail-status">Loading...</p>;
    if (error) return <p className="detail-status error-text">{error}</p>;
    if (!event) return null;

    return (
        <div className="detail-page">
            <Link to="/" className="detail-back">← Back to events</Link>

            <div className="detail-tags">
                {event.tags.map((tag) => (
                <span key={tag.id} className="event-tag">{tag.name}</span>
                ))}
            </div>

            <h1 className="detail-title">{event.title}</h1>
            <p className="detail-org">by {event.organization_name}</p>

            <div className="detail-info">
                <p><strong>When:</strong> {formatDate(event.start_datetime)} – {formatDate(event.end_datetime)}</p>
                <p><strong>Where:</strong> {event.location}</p>
                {event.capacity && <p><strong>Capacity:</strong> {event.capacity} spots</p>}
            </div>

            <p className="detail-desc">{event.description}</p>

            <div className="detail-register">
                {event.registration_type === "built_in" && (
                    <button className="btn-primary">Register</button>
                )}
                {event.registration_type === "external" && (
                    <a className="btn-primary" href={event.external_url} target="_blank" rel="noopener noreferrer">
                        Register on external site
                    </a>
                )}
                {event.registration_type === "none" && (
                    <p className="detail-noreg">No registration required — just show up!</p>
                )}
            </div>
        </div>
    );
}
    
export default EventDetail;