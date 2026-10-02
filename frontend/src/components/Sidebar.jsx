import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                FMS
            </div>

            <nav>

                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>

                {(
                    user?.role === "freelancer" ||
                    user?.role === "admin"
                ) && (
                    <>
                        <NavLink to="/clients">
                            Clients
                        </NavLink>

                        <NavLink to="/projects">
                            Projects
                        </NavLink>

                        <NavLink to="/tasks">
                            Tasks
                        </NavLink>

                        <NavLink to="/invoices">
                            Invoices
                        </NavLink>

                        <NavLink to="/payments">
                            Payments
                        </NavLink>
                    </>
                )}

                {user?.role === "client" && (
                    <>
                        <NavLink to="/projects">
                            My Projects
                        </NavLink>

                        <NavLink to="/tasks">
                            My Tasks
                        </NavLink>

                        <NavLink to="/invoices">
                            My Invoices
                        </NavLink>

                        <NavLink to="/payments">
                            Payments
                        </NavLink>
                    </>
                )}

                <NavLink to="/history">
                    Project History
                </NavLink>

            </nav>

        </aside>
    );
};

export default Sidebar;