import { useState, useEffect, useCallback } from "react";
import PendingEventCard from "../../components/admin/PendingEventCard";
import RejectModal from "../../components/admin/RejectModal";
import "./css/PendingEvents.css";

function PendingEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rejectingEvent, setRejectingEvent] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const loadPending = useCallback(async () => {
        const res = await fetch("/api/admin/events/pending", {credentials: "include"});
        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to load pending events");
            return;
        }
        const data = await res.json();
        setEvents(data.events);
    }, []);

    useEffect(() => {
        async function init() {
            try {
                await loadPending();
            } catch {
                setError("Something went wrong. Please try again")
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [loadPending]);

    const handleApprove = async (id) => {
        setError("");
        try {
            const res = await fetch(`/api/admin/events/${id}/approve`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to approve event");
                return;
            }
            await loadPending();
        } catch {
            setError("Something went wrong. Please try again")
        }
    };

    const confirmReject = async (reason) => {
        if (!rejectingEvent) return;
        setActionLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/events/${rejectingEvent.id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({reason}),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(DataTransfer.error || "Failed to reject event");
                setActionLoading(false);
                return;
            }
            setActionLoading(false);
            setRejectingEvent(null);
            await loadPending();
        } catch {
            setError("Something went wrong. Please try again.");
            setActionLoading(false);
        }
    };

    if (loading) return <p className="pending-status">Loading...</p>
    if (error && error.length === 0) return <p className="pending-status">{error}</p>

    return (
        <div className="pending-events">
            <div className="pending-header">
                <h1>Pending Events</h1>
                <p className="pending-subtitle">
                    {events.length} event{events.length === 1 ? "" : "s"}
                </p>
            </div>

            {error && <p className="error-text">{error}</p>}

            {events.length === 0 ? (
                <p className="pending-status">Nothing to review right now.</p>
            ) : (
                <div className="pending-list">
                    {events.map((event) => (
                        <PendingEventCard 
                            key={event.id}
                            event={event}
                            onApprove={handleApprove}
                            onReject={setRejectingEvent}
                        />
                    ))}
                </div>
            )};

            {rejectingEvent && (
                <RejectModal 
                    event={rejectingEvent}
                    onCancel={() => setRejectingEvent(null)}
                    onConfirm={confirmReject}
                    loading={actionLoading}
                />
            )}
        </div>
    );
}

export default PendingEvents;