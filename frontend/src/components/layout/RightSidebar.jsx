function RightSidebar() {

    return (
        <div className="right-sidebar">
            <div className="side-card">
                <h3>Saved Events</h3>
                <p>No saved events yet.</p>
            </div>

            <div className="side-card">
                <h3>Current Registrations</h3>
                <p>You have no active registrations.</p>
            </div>

            <div className="side-card">
                <h3>Calendar</h3>
                <p>Upcoming dates will appear here.</p>
            </div>

        </div>
    )
}

export default RightSidebar;