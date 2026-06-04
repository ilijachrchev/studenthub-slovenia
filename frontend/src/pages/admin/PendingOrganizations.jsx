import { useState, useEffect, useCallback } from "react";
import PendingOrgCard from "../../components/admin/PendingOrgCard";
import "./css/PendingOrganizations.css";

function PendingOrganizations() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPending = useCallback(async () => {
        const res = await fetch("/api/admin/organizations/pending", {credentials: "include"});
        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to load pending organizations");
            return;
        }

        const data = await res.json();
        setOrganizations(data.organizations);
    }, []);

    useEffect(() => {
        async function init() {
            try {
                await loadPending();
            } catch {
                setError("Something went wrong. Please try again");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [loadPending]);

    const handleApprove = async (id) => {
        setError("");
        try {
            const res = await fetch(`/api/admin/organizations/${id}/approve`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to approve organizatio");
                return;
            }
            await loadPending();
        } catch {
            setError("Something wen wrong. Please try again");
        }
    };

    const handleReject = async (id) => {
        setError("");
        try {
            const res = await fetch(`/api/admin/organizations/${id}/reject`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to reject organization.");
                return;
            }
            await loadPending();
        } catch {
            setError("Something went wrong. Please try again");
        }
    };

    if (loading) return <p className="pending-status">Loading...</p>

    return (
        <div className="pending-organizations">
            <div className="pending-header">
                <h1>Pending Organizations</h1>
                <p className="pending-subtitle">
                    {organizations.length} application{organizations.length === 1 ? "" : "s"}
                </p>
            </div>

            {error && <p className="error-text">{error}</p>}

            {organizations.length === 0 ? (
                <p className="pending-status">Nothing to review right now.</p>
            ) : (
                <div className="pending-list">
                    {organizations.map((org) => (
                        <PendingOrgCard
                            key={org.id}
                            organization={org}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default PendingOrganizations;