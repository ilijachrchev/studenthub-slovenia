function Topbar() {

    return (
        <header className="app-topbar">
            <input type="text" 
                className="topbar-search"
                placeholder="Search events, organizations, or topics..."
            />

            <div className="topbar-actions">
                <button className="topbar-icon-button"></button>
                <button className="topbar-profile">Profile</button>
            </div>
        </header>
    )
}

export default Topbar;