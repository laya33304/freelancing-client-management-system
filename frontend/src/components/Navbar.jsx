import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-title">Freelancer Management</div>

      <div className="navbar-user">
        <span>{user?.name}</span>

        <span className="user-role">{user?.role}</span>

        <button onClick={logout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
