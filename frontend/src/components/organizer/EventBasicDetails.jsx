function EventBasicDetails({ title, description, onTitleChange, onDescriptionChange }) {
    return (
        <div className="form-section">
            <h2 className="form-section-title">Basic Details</h2>

            <label className="form-label">Event Title<span className="required">*</span></label>

            <input 
                className="input"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Introduction to Motion Capture"
            />

            <label className="form-label">Description</label>
            <textarea 
                className="input"
                rows={4}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="What is motion capture?"
            />
        </div>
    );
}

export default EventBasicDetails;