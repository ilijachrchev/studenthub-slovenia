function EventTimeLocation({location, startDatetime, endDatetime, onLocationChange, onStartChange, onEndChange}) {
    return (
        <div className="form-section">
            <h2 className="form-section-title">Time & Location</h2>

            <label className="form-label">Location<span className="required">*</span></label>

            <input 
                className="input"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. FAMNIT, Galeb"
            />

            <div className="form-row">
                <div>
                    <label className="form-label">Start</label>
                    <input 
                        className="input"
                        type="datetime-local"
                        value={startDatetime}
                        onChange={(e) => onStartChange(e.target.value)}
                    />
                </div>

                <div>
                    <label className="form-label">End</label>
                    <input 
                        className="input"
                        type="datetime-local"
                        value={endDatetime}
                        onChange={(e) => onEndChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

export default EventTimeLocation;