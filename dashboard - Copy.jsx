import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://election-2nlh.onrender.com";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Redirect if not logged in
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const [summary, setSummary] = useState({});
  const [surveySummary, setSurveySummary] = useState({});
  const [addresses, setAddresses] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [voters, setVoters] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  /* ==================== LOAD SUMMARY ==================== */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    loadSummary();
    loadSurveySummary();
    loadTopAddresses();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/voters/summary`, authHeader);
      setSummary(res.data);
    } catch (error) {
      console.error("Error loading summary:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/");
      }
    }
  };

  const loadSurveySummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/surveys`, authHeader);
      const totalSurveys = res.data.total || 0;

      let estimated = 0;
      if (res.data.rows) {
        res.data.rows.forEach(r => {
          estimated += Number(r.VotersCount || 0);
        });
      }

      setSurveySummary({
        total_surveys: totalSurveys,
        estimated_voters: estimated
      });
    } catch (error) {
      console.error("Error loading survey summary:", error);
    }
  };

  const loadTopAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/voters/summary`, authHeader);

      if (res.data.address_chart) {
        const top10 = [...res.data.address_chart]
          .sort((a, b) => b.Total - a.Total)
          .slice(0, 10);

        setAddresses(top10);
      }
    } catch (e) {
      console.error("Error loading addresses:", e);
    }
  };

  /* ==================== SEARCH ==================== */
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.length >= 2) {
        loadSearch();
      } else if (search.length === 0) {
        setVoters([]);
        setTotalResults(0);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search, page]);

  const loadSearch = async () => {
    try {
      const offset = (page - 1) * pageSize;
      const res = await axios.get(`${API_BASE}/voters`, {
        ...authHeader,
        params: {
          search,
          limit: pageSize,
          offset
        }
      });

      setVoters(res.data.rows || []);
      setTotalResults(res.data.total || 0);
    } catch (error) {
      console.error("Error searching voters:", error);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  /* ==================== LOGOUT ==================== */
  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, authHeader);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  /* ==================== DERIVED VALUES ==================== */
  const total = summary.total || 0;
  const visited = summary.visited || 0;
  const notVisited = summary.not_visited || 0;
  
  // ✅ FIXED: Handle sex_breakdown properly
  const sexBreakdown = summary.sex_breakdown || {};
  const male = (sexBreakdown.M || 0) + (sexBreakdown.Male || 0);
  const female = (sexBreakdown.F || 0) + (sexBreakdown.Female || 0);

  /* ==================== UI ==================== */
  return (
    <div style={{ padding: 20, background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>📊 Voter Dashboard</h2>
        <div>
          <button onClick={() => navigate("/list")} style={navButton}>
            List
          </button>
          <button onClick={() => navigate("/survey")} style={navButton}>
            📋 Survey
          </button>
          <button
            onClick={() => window.open("https://thewhatsappservice.com/sub_dashboard", "_blank")}
            style = {{...navButton, background: "#05b741ff"}}
          >
            Bulk WhatsApp
          </button>
          <button
            onClick={() => navigate("/settings")}
            style = {{...navButton, background: "#201e1eff"}}
          >
            ⚙️ Settings
          </button>
          <button onClick={handleLogout} style={{ ...navButton, background: "#dc2626" }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
        <KPI title="Total Voters" value={total} color="#3b82f6" />
        <KPI title="Visited" value={visited} subtitle={`${((visited / total) * 100 || 0).toFixed(1)}%`} color="#10b981" />
        <KPI title="Male" value={male} color="#8b5cf6" />
        <KPI title="Female" value={female} color="#ec4899" />
      </div>

      {/* ================= PIE CHARTS ================= */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 30 }}>
        <Plot
          data={[{
            type: "pie",
            values: [visited, notVisited],
            labels: ["Visited", "Not Visited"],
            hole: 0.5,
            marker: {
              colors: ["#10b981", "#ef4444"]
            }
          }]}
          layout={{ title: "Visit Status", height: 300 }}
          config={{ responsive: true }}
        />

        <Plot
          data={[{
            type: "pie",
            values: [male, female],
            labels: ["Male", "Female"],
            hole: 0.5,
            marker: {
              colors: ["#3b82f6", "#ec4899"]
            }
          }]}
          layout={{ title: "Gender Distribution", height: 300 }}
          config={{ responsive: true }}
        />

        <Plot
          data={[{
            type: "bar",
            x: ["Surveys", "Estimated Voters"],
            y: [
              surveySummary.total_surveys || 0,
              surveySummary.estimated_voters || 0
            ],
            marker: {
              color: ["#f59e0b", "#10b981"]
            }
          }]}
          layout={{ title: "Survey Status", height: 300 }}
          config={{ responsive: true }}
        />
      </div>
      
      <div>
      {/* ================= ADDRESS CHART ================= */}
      <h3 style={{ marginTop: 40 }}>🏘️ Top Addresses</h3>
      {addresses.length > 0 && (
        <Plot
          data={[
            {
              type: "bar",
              x: addresses.map(a => a.Address),
              y: addresses.map(a => a.Total),
              name: "Total"
            },
            {
              type: "bar",
              x: addresses.map(a => a.Address),
              y: addresses.map(a => a.Visited),
              name: "Visited"
            },
            {
              type: "bar",
              x: addresses.map(a => a.Address),
              y: addresses.map(a => a.NotVisited),
              name: "Not Visited"
            }
          ]}
          layout={{ barmode: "group", height: 400 }}
        />
      )}
      </div>
      {/* ================= SEARCH ================= */}
      <h3 style={{ marginTop: 40 }}>🔍 Quick Voter Search</h3>
      <input
        placeholder="Search by name (minimum 2 characters)"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{ padding: 10, width: "100%", maxWidth: 400, borderRadius: 6, border: "1px solid #ccc" }}
      />

      {/* ================= SEARCH RESULTS ================= */}
      {voters.length > 0 && (
        <>
          <div style={{ marginTop: 20 }}>
            <p style={{ color: "#666", marginBottom: 10 }}>
              Found {totalResults} result{totalResults !== 1 ? "s" : ""}
            </p>
            {voters.map((v, i) => (
              <div key={i} style={{
                background: v.Visited ? "#d1fae5" : "#fed7aa",
                borderLeft: `5px solid ${v.Visited ? "#10b981" : "#f59e0b"}`,
                padding: 15,
                borderRadius: 8,
                marginBottom: 10,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <b style={{ fontSize: 16 }}>{v.VEName}</b>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 5 }}>
                      📍 {v.VAddress} | Age: {v.Age} | {v.Sex === "M" ? "Male" : "Female"}
                    </div>
                    {v.Mobile && (
                      <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>
                        📱 {v.Mobile}
                      </div>
                    )}
                  </div>
                  <div style={{
                    padding: "5px 10px",
                    borderRadius: 5,
                    background: v.Visited ? "#10b981" : "#f59e0b",
                    color: "white",
                    fontSize: 12,
                    fontWeight: "bold"
                  }}>
                    {v.Visited ? "✅ Visited" : "⏳ Pending"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= PAGINATION ================= */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              style={paginationButton}
            >
              ⬅️ Previous
            </button>
            <span style={{ fontSize: 14, color: "#666" }}>
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              style={paginationButton}
            >
              Next ➡️
            </button>
          </div>
        </>
      )}

      <p style={{ marginTop: 40, color: "#777", textAlign: "center", fontSize: 12 }}>
        Last updated: {new Date().toLocaleString()}
      </p>
    </div>
  );
}

/* ================= KPI COMPONENT ================= */
function KPI({ title, value, subtitle, color = "#3b82f6" }) {
  return (
    <div style={{
      background: "#fff",
      padding: 20,
      borderRadius: 10,
      textAlign: "center",
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      borderTop: `4px solid ${color}`
    }}>
      <h4 style={{ margin: 0, color: "#666", fontSize: 14 }}>{title}</h4>
      <h2 style={{ margin: "10px 0", color: color, fontSize: 32 }}>{value.toLocaleString()}</h2>
      {subtitle && <small style={{ color: "#999" }}>{subtitle}</small>}
    </div>
  );
}

const navButton = {
  padding: "8px 16px",
  marginLeft: 10,
  borderRadius: 6,
  border: "none",
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};

const paginationButton = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer"
};