import { useAuth } from "../../context/AuthContext";
import { Bell } from "../reusable/Icons";

function Topbar() {

    const {user, loading} = useAuth();

    const initials = user  
        ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
        : "";

        const roleLabel = user
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "";

    return (
        <header className="app-topbar">
            <input type="text" 
                className="topbar-search"
                placeholder="Search events, organizations, or topics..."
            />

            <div className="topbar-actions">
                <button className="topbar-icon-button" aria-label="Notifications">
                    <Bell size={20} />
                </button>

                {!loading && user && (
                    <button className="topbar-profile">
                        <span className="topbar-avatar">{initials}</span>
                        <span className="topbar-profile-info">
                            <span className="topbar-profile-name">{user.first_name}</span>
                            <span className="topbar-profile-role">{roleLabel}</span>
                        </span>
                    </button>
                )}

                {!loading && !user && (
                    <button className="topbar-profile topbar-profile-guest">Sign In</button>
                )}
            </div>
        </header>
    )
}

export default Topbar;