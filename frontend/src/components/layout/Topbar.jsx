import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Bell } from "../reusable/Icons";
import { useEffect, useRef, useState } from "react";

function Topbar() {

    const {user, loading} = useAuth();
    const navigate = useNavigate();
    const [term, setTerm] = useState("");
    const timerRef = useRef(null);

    const initials = user  
        ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
        : "";

        const roleLabel = user
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "";

    const runSearch = (value) => {
        const query = value.trim();
        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`, {replace: true});
        } else {
            navigate("/", {replace: true});
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setTerm(value);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => runSearch(value), 300);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            if (timerRef.current) clearTimeout(timerRef.current);
            runSearch(term);
        }
    };

    return (
        <header className="app-topbar">
            <input type="text" 
                className="topbar-search"
                placeholder="Search events, organizations, or topics..."
                value={term}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
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
                    <button className="topbar-profile topbar-profile-guest"
                        onClick={() => navigate("/login")}
                    >
                        Sign In
                    </button>
                )}
            </div>
        </header>
    )
}

export default Topbar;