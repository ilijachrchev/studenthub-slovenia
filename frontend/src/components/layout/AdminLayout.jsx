import AdminSidebar from "./AdminSidebar";
import Topbar from "./Topbar";
import "./css/AdminLayout.css";

function AdminLayout({ children}) {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            
            <div className="admin-main-area">
                <Topbar />

                <main className="admin-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;