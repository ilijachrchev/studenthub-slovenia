import { useState } from "react";

function RejectModal({event, onCancel, onConfirm, loading}) {
    const [reason, setReason] = useState("");

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>Reject "{event.title}"</h3>
                <p className="modal-subtitle">
                    Let the organizer know why, they will see this on their dashboard.
                </p>
                <textarea 
                    className="input" 
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for rejection..."    
                />
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn-reject" onClick={() => onConfirm(reason)} disabled={loading || !reason.trim()}>
                        {loading ? "Rejecting..." : "Reject Event"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RejectModal;