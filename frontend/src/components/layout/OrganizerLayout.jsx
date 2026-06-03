import OrganizerSidebar from "./OrganizerSidebar";
import Topbar from "./Topbar";
import "./css/OrganizerLayout.css";

function OrganizerLayout({children}) {
    return (
        <div className="organizer-layout">
            <OrganizerSidebar />
            
            <div className="organizer-main-area">
                <Topbar />

                <main className="organizer-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default OrganizerLayout;