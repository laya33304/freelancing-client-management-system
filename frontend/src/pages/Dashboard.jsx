import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

const Dashboard = () => {
  const { user, token } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard");
        }

        setSummary(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>Welcome back, {user?.name}</p>
        </div>

        <div className="dashboard-role">{user?.role}</div>
      </div>

      {/* Project Statistics */}

      <section>
        <h2 className="section-title">Projects</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Projects</h3>

            <p>{summary?.projects?.total || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Active Projects</h3>

            <p>{summary?.projects?.active || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Completed Projects</h3>

            <p>{summary?.projects?.completed || 0}</p>
          </div>
        </div>
      </section>

      {/* Task Statistics */}

      <section>
        <h2 className="section-title">Tasks</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>

            <p>{summary?.tasks?.total || 0}</p>
          </div>

          <div className="stat-card">
            <h3>To Do</h3>

            <p>{summary?.tasks?.todo || 0}</p>
          </div>

          <div className="stat-card">
            <h3>In Progress</h3>

            <p>{summary?.tasks?.inProgress || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>

            <p>{summary?.tasks?.completed || 0}</p>
          </div>
        </div>
      </section>

      {/* Financial Statistics */}

      <section>
        <h2 className="section-title">Financial Overview</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Invoices</h3>

            <p>{summary?.invoices?.total || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Pending Invoices</h3>

            <p>{summary?.invoices?.pending || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Partially Paid</h3>

            <p>{summary?.invoices?.partiallyPaid || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Total Received</h3>

            <p>₹{summary?.payments?.totalReceived || 0}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
