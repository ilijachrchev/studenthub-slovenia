import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RightSidebar from "./RightSidebar";
import "./css/StudentLayout.css";


function StudentLayout({ children }) {

    return (
        <div className="student-layout">
            <Sidebar />

            <div className="student-main-area">
                <Topbar />

                <div className="student-content-grid">
                    <main className="student-main-content">
                        {children}
                    </main>

                    <RightSidebar />
                </div>
            </div>
        </div>
    )
};

export default StudentLayout;