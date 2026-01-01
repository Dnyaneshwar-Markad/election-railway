// import React, { useEffect, useState } from "react";
// import Plot from "react-plotly.js";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const API_BASE = "https://election-2nlh.onrender.com";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (!storedToken) {
//       navigate("/", { replace: true });
//     }
//   }, [navigate]);

//   const [summary, setSummary] = useState({});
//   const [surveySummary, setSurveySummary] = useState({});
//   const [addresses, setAddresses] = useState([]);

//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const pageSize = 25;

//   const [voters, setVoters] = useState([]);
//   const [totalResults, setTotalResults] = useState(0);

//   // Detail Modal State
//   const [detailModalOpen, setDetailModalOpen] = useState(false);
//   const [selectedVoter, setSelectedVoter] = useState(null);

//   const authHeader = {
//     headers: { Authorization: `Bearer ${token}` }
//   };

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (!storedToken) return;

//     loadSummary();
//     loadSurveySummary();
//     loadTopAddresses();
//   }, []);

//   const loadSummary = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/voters/summary`, authHeader);
//       setSummary(res.data);
//     } catch (error) {
//       console.error("Error loading summary:", error);
//       if (error.response?.status === 401) {
//         alert("Session expired. Please login again.");
//         localStorage.clear();
//         navigate("/");
//       }
//     }
//   };

//   const loadSurveySummary = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/surveys`, authHeader);
//       const totalSurveys = res.data.total || 0;

//       let estimated = 0;
//       if (res.data.rows) {
//         res.data.rows.forEach(r => {
//           estimated += Number(r.VotersCount || 0);
//         });
//       }

//       setSurveySummary({
//         total_surveys: totalSurveys,
//         estimated_voters: estimated
//       });
//     } catch (error) {
//       console.error("Error loading survey summary:", error);
//     }
//   };

//   const loadTopAddresses = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/voters/summary`, authHeader);

//       if (res.data.address_chart) {
//         const top10 = [...res.data.address_chart]
//           .sort((a, b) => b.Total - a.Total)
//           .slice(0, 10);

//         setAddresses(top10);
//       }
//     } catch (e) {
//       console.error("Error loading addresses:", e);
//     }
//   };

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       if (search.length >= 2) {
//         loadSearch();
//       } else if (search.length === 0) {
//         setVoters([]);
//         setTotalResults(0);
//       }
//     }, 400);

//     return () => clearTimeout(delay);
//   }, [search, page]);

//   const loadSearch = async () => {
//     try {
//       const offset = (page - 1) * pageSize;
//       const res = await axios.get(`${API_BASE}/voters/list`, {
//         ...authHeader,
//         params: {
//           search,
//           limit: pageSize,
//           offset
//         }
//       });

//       setVoters(res.data.rows || []);
//       setTotalResults(res.data.total || 0);
//     } catch (error) {
//       console.error("Error searching voters:", error);
//     }
//   };

//   const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${API_BASE}/logout`, {}, authHeader);
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       localStorage.clear();
//       navigate("/");
//     }
//   };

//   // Open Detail Modal
//   const openDetailModal = (voter) => {
//     setSelectedVoter(voter);
//     setDetailModalOpen(true);
//   };

//   const total = summary.total || 0;
//   const visited = summary.visited || 0;
//   const notVisited = summary.not_visited || 0;
  
//   const sexBreakdown = summary.sex_breakdown || {};
//   const male = (sexBreakdown.M || 0) + (sexBreakdown.Male || 0);
//   const female = (sexBreakdown.F || 0) + (sexBreakdown.Female || 0);

//   return (
//     <div style={{ padding: 20, background: "#f5f6fa", minHeight: "100vh" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//         <h2>📊 Voter Dashboard</h2>
//         <div>
//           <button onClick={() => navigate("/list")} style={navButton}>
//             List
//           </button>
//           <button onClick={() => navigate("/survey")} style={navButton}>
//             📋 Survey
//           </button>
//           <button
//             onClick={() => window.open("https://thewhatsappservice.com/sub_dashboard", "_blank")}
//             style = {{...navButton, background: "#05b741ff"}}
//           >
//             Bulk WhatsApp
//           </button>
//           <button
//             onClick={() => navigate("/settings")}
//             style = {{...navButton, background: "#201e1eff"}}
//           >
//             ⚙️ Settings
//           </button>
//           <button onClick={handleLogout} style={{ ...navButton, background: "#dc2626" }}>
//             🚪 Logout
//           </button>
//         </div>
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
//         <KPI title="Total Voters" value={total} color="#3b82f6" />
//         <KPI title="Visited" value={visited} subtitle={`${((visited / total) * 100 || 0).toFixed(1)}%`} color="#10b981" />
//         <KPI title="Male" value={male} color="#8b5cf6" />
//         <KPI title="Female" value={female} color="#ec4899" />
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 30 }}>
//         <Plot
//           data={[{
//             type: "pie",
//             values: [visited, notVisited],
//             labels: ["Visited", "Not Visited"],
//             hole: 0.5,
//             marker: {
//               colors: ["#10b981", "#ef4444"]
//             }
//           }]}
//           layout={{ title: "Visit Status", height: 300 }}
//           config={{ responsive: true }}
//         />

//         <Plot
//           data={[{
//             type: "pie",
//             values: [male, female],
//             labels: ["Male", "Female"],
//             hole: 0.5,
//             marker: {
//               colors: ["#3b82f6", "#ec4899"]
//             }
//           }]}
//           layout={{ title: "Gender Distribution", height: 300 }}
//           config={{ responsive: true }}
//         />

//         <Plot
//           data={[{
//             type: "bar",
//             x: ["Surveys", "Estimated Voters"],
//             y: [
//               surveySummary.total_surveys || 0,
//               surveySummary.estimated_voters || 0
//             ],
//             marker: {
//               color: ["#f59e0b", "#10b981"]
//             }
//           }]}
//           layout={{ title: "Survey Status", height: 300 }}
//           config={{ responsive: true }}
//         />
//       </div>
      
//       <div>
//       <h3 style={{ marginTop: 40 }}>🏘️ Top Addresses</h3>
//       {addresses.length > 0 && (
//         <Plot
//           data={[
//             {
//               type: "bar",
//               x: addresses.map(a => a.Address),
//               y: addresses.map(a => a.Total),
//               name: "Total"
//             },
//             {
//               type: "bar",
//               x: addresses.map(a => a.Address),
//               y: addresses.map(a => a.Visited),
//               name: "Visited"
//             },
//             {
//               type: "bar",
//               x: addresses.map(a => a.Address),
//               y: addresses.map(a => a.NotVisited),
//               name: "Not Visited"
//             }
//           ]}
//           layout={{ barmode: "group", height: 400 }}
//         />
//       )}
//       </div>

//       <h3 style={{ marginTop: 10 }}>🔍 Quick Voter Search</h3>
//       <input
//         placeholder="Search by name (minimum 2 characters)"
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setPage(1);
//         }}
//         style={{ padding: 10, width: "100%", maxWidth: 400, borderRadius: 6, border: "1px solid #ccc" }}
//       />

//       {voters.length > 0 && (
//         <>
//           <div style={{ marginTop: 20 }}>
//             <p style={{ color: "#666", marginBottom: 10 }}>
//               Found {totalResults} result{totalResults !== 1 ? "s" : ""}
//             </p>
//             {voters.map((v, i) => (
//               <div 
//                 key={i} 
//                 onClick={() => openDetailModal(v)}
//                 style={{
//                   background: v.Visited ? "#d1fae5" : "#fed7aa",
//                   borderLeft: `5px solid ${v.Visited ? "#10b981" : "#f59e0b"}`,
//                   padding: 15,
//                   borderRadius: 8,
//                   marginBottom: 10,
//                   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                   cursor: "pointer",
//                   transition: "transform 0.1s ease",
//                 }}
//                 onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
//                 onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//               >
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <div>
//                     <b style={{ fontSize: 16 }}>{v.VEName}</b>
//                   </div>
//                   <div 
//                   onClick={(e)=> {
//                     e.stopPropagation();
//                     setSurveyVoter(v);
//                     setSurveyOpen(true);
//                   }}
//                   style={{
//                     padding: "5px 10px",
//                     borderRadius: 5,
//                     background: v.Visited ? "#10b981" : "#f59e0b",
//                     color: "white",
//                     fontSize: 12,
//                     fontWeight: "bold"
//                   }}>
//                     {v.Visited ? "✅ Visited" : "⏳ Pending"}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
//             <button 
//               disabled={page === 1} 
//               onClick={() => setPage(p => p - 1)}
//               style={paginationButton}
//             >
//               ⬅️ Previous
//             </button>
//             <span style={{ fontSize: 14, color: "#666" }}>
//               Page {page} of {totalPages}
//             </span>
//             <button 
//               disabled={page === totalPages} 
//               onClick={() => setPage(p => p + 1)}
//               style={paginationButton}
//             >
//               Next ➡️
//             </button>
//           </div>
//         </>
//       )}

//       {/* Voter Detail Modal */}
//       {detailModalOpen && selectedVoter && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: "rgba(0,0,0,0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1001,
//           }}
//           onClick={() => setDetailModalOpen(false)}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               background: "#fff",
//               borderRadius: 12,
//               padding: 25,
//               width: "90%",
//               maxWidth: 500,
//               maxHeight: "80vh",
//               overflow: "auto",
//               boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
//             }}
//           >
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//               <h3 style={{ margin: 0 }}>Voter Details</h3>
//               <button
//                 onClick={() => setDetailModalOpen(false)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   fontSize: 28,
//                   cursor: "pointer",
//                   color: "#666",
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <div style={{ lineHeight: 1.8 }}>
//               <div style={{ marginBottom: 12 }}>
//                 <strong>Name (Marathi):</strong> {selectedVoter.VEName}
//               </div>
//               <div style={{ marginBottom: 12 }}>
//                 <strong>Name (English):</strong> {selectedVoter.EName || "N/A"}
//               </div>
//               <div style={{ marginBottom: 12 }}>
//                 <strong>ID Card No:</strong> {selectedVoter.IDCardNo}
//               </div>
//               <div style={{ marginBottom: 12 }}>
//                 <strong>Age:</strong> {selectedVoter.Age}
//               </div>
//               <div style={{ marginBottom: 12 }}>
//                 <strong>Gender:</strong> {selectedVoter.Sex === "M" ? "Male" : "Female"}
//               </div>
//               <div style={{ marginBottom: 12 }}>
//                 <strong>Address:</strong> {selectedVoter.Address || selectedVoter.VAddress || "N/A"}
//               </div>
//               {selectedVoter.Mobile && (
//                 <div style={{ marginBottom: 12 }}>
//                   <strong>Mobile:</strong> {selectedVoter.Mobile}
//                 </div>
//               )}
//               {selectedVoter.HouseNo && (
//                 <div style={{ marginBottom: 12 }}>
//                   <strong>House No:</strong> {selectedVoter.HouseNo}
//                 </div>
//               )}
//               {selectedVoter.Landmark && (
//                 <div style={{ marginBottom: 12 }}>
//                   <strong>Landmark:</strong> {selectedVoter.Landmark}
//                 </div>
//               )}
//               {selectedVoter.Caste && (
//                 <div style={{ marginBottom: 12 }}>
//                   <strong>Caste:</strong> {selectedVoter.Caste}
//                 </div>
//               )}
//               {selectedVoter.PartNo && (
//                 <div style={{ marginBottom: 12 }}>
//                   <strong>Part No:</strong> {selectedVoter.PartNo}
//                 </div>
//               )}
//               {selectedVoter.SectionNo && (
//                 <div style={{ marginBottom: 12 }}>
//                   <strong>Section No:</strong> {selectedVoter.SectionNo}
//                 </div>
//               )}
//               <div style={{ marginBottom: 12 }}>
//                 <strong>Status:</strong>{" "}
//                 <span style={{ color: selectedVoter.Visited ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>
//                   {selectedVoter.Visited ? "✅ Visited" : "⏳ Not Visited"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       <p style={{ marginTop: 40, color: "#777", textAlign: "center", fontSize: 12 }}>
//         Last updated: {new Date().toLocaleString()}
//       </p>
//     </div>
//   );
// }

// function KPI({ title, value, subtitle, color = "#3b82f6" }) {
//   return (
//     <div style={{
//       background: "#fff",
//       padding: 20,
//       borderRadius: 10,
//       textAlign: "center",
//       boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
//       borderTop: `4px solid ${color}`
//     }}>
//       <h4 style={{ margin: 0, color: "#666", fontSize: 14 }}>{title}</h4>
//       <h2 style={{ margin: "10px 0", color: color, fontSize: 32 }}>{value.toLocaleString()}</h2>
//       {subtitle && <small style={{ color: "#999" }}>{subtitle}</small>}
//     </div>
//   );
// }

// const navButton = {
//   padding: "8px 16px",
//   marginLeft: 10,
//   borderRadius: 6,
//   border: "none",
//   background: "#3b82f6",
//   color: "white",
//   cursor: "pointer",
//   fontWeight: "bold"
// };

// const paginationButton = {
//   padding: "8px 16px",
//   borderRadius: 6,
//   border: "1px solid #ccc",
//   background: "white",
//   cursor: "pointer"
// };

import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://election-2nlh.onrender.com";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const mainAdminId = localStorage.getItem("main_admin_id");

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

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);

  // Survey Modal State
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyVoter, setSurveyVoter] = useState(null);
  const [mobile, setMobile] = useState("");
  const [landmark, setLandmark] = useState("");
  const [caste, setCaste] = useState("");
  const [houseNo, setHouseNo] = useState("");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

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
      const res = await axios.get(`${API_BASE}/voters/list`, {
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

  // Open Detail Modal
  const openDetailModal = (voter) => {
    setSelectedVoter(voter);
    setDetailModalOpen(true);
  };

  // Open Survey Modal
  const openSurveyModal = (voter) => {
    setSurveyVoter(voter);
    setHouseNo(voter.HouseNo || "");
    setLandmark(voter.Landmark || "");
    setCaste(voter.Caste || "");
    setMobile(voter.Mobile || "");
    setSurveyOpen(true);
  };

  // Submit Individual Survey
  const submitIndividual = async () => {
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      alert("⌠वैध मोबाईल नंबर द्या");
      return;
    }

    const payload = {
      family_head_id: surveyVoter.VoterID,
      selected_family_ids: [surveyVoter.VoterID],
      house_number: houseNo,
      landmark,
      mobile,
      caste,
      visited: 1,
      main_admin_id: Number(mainAdminId)
    };

    try {
      const res = await axios.post(`${API_BASE}/submit-survey`, payload, authHeader);

      if (res.data.success) {
        alert("✅ सर्वेक्षण यशस्वी");
        setSurveyOpen(false);
        resetSurveyForm();
        loadSearch(); // Refresh the search results
        loadSummary(); // Refresh the summary
      } else {
        alert(res.data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Error submitting individual:", err);
      alert("Error submitting survey");
    }
  };

  const resetSurveyForm = () => {
    setMobile("");
    setLandmark("");
    setCaste("");
    setHouseNo("");
    setSurveyVoter(null);
  };

  const total = summary.total || 0;
  const visited = summary.visited || 0;
  const notVisited = summary.not_visited || 0;
  
  const sexBreakdown = summary.sex_breakdown || {};
  const male = (sexBreakdown.M || 0) + (sexBreakdown.Male || 0);
  const female = (sexBreakdown.F || 0) + (sexBreakdown.Female || 0);

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
        <KPI title="Total Voters" value={total} color="#3b82f6" />
        <KPI title="Visited" value={visited} subtitle={`${((visited / total) * 100 || 0).toFixed(1)}%`} color="#10b981" />
        <KPI title="Male" value={male} color="#8b5cf6" />
        <KPI title="Female" value={female} color="#ec4899" />
      </div>

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

      <h3 style={{ marginTop: 10 }}>🔍 Quick Voter Search</h3>
      <input
        placeholder="Search by name (minimum 2 characters)"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{ padding: 10, width: "100%", maxWidth: 400, borderRadius: 6, border: "1px solid #ccc" }}
      />

      {voters.length > 0 && (
        <>
          <div style={{ marginTop: 20 }}>
            <p style={{ color: "#666", marginBottom: 10 }}>
              Found {totalResults} result{totalResults !== 1 ? "s" : ""}
            </p>
            {voters.map((v, i) => (
              <div 
                key={i} 
                onClick={() => openDetailModal(v)}
                style={{
                  background: v.Visited ? "#d1fae5" : "#fed7aa",
                  borderLeft: `5px solid ${v.Visited ? "#10b981" : "#f59e0b"}`,
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.1s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <b style={{ fontSize: 16 }}>{v.VEName}</b>
                  </div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      openSurveyModal(v);
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 5,
                      background: v.Visited ? "#10b981" : "#f59e0b",
                      color: "white",
                      fontSize: 12,
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    {v.Visited ? "✅ Visited" : "⏳ Pending"}
                  </div>
                </div>
              </div>
            ))}
          </div>

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

      {/* Voter Detail Modal */}
      {detailModalOpen && selectedVoter && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 25,
              width: "90%",
              maxWidth: 500,
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Voter Details</h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 28,
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ lineHeight: 1.8 }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Name (Marathi):</strong> {selectedVoter.VEName}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Name (English):</strong> {selectedVoter.EName || "N/A"}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>ID Card No:</strong> {selectedVoter.IDCardNo}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Age:</strong> {selectedVoter.Age}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Gender:</strong> {selectedVoter.Sex === "M" ? "Male" : "Female"}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Address:</strong> {selectedVoter.Address || selectedVoter.VAddress || "N/A"}
              </div>
              {selectedVoter.Mobile && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Mobile:</strong> {selectedVoter.Mobile}
                </div>
              )}
              {selectedVoter.HouseNo && (
                <div style={{ marginBottom: 12 }}>
                  <strong>House No:</strong> {selectedVoter.HouseNo}
                </div>
              )}
              {selectedVoter.Landmark && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Landmark:</strong> {selectedVoter.Landmark}
                </div>
              )}
              {selectedVoter.Caste && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Caste:</strong> {selectedVoter.Caste}
                </div>
              )}
              {selectedVoter.PartNo && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Part No:</strong> {selectedVoter.PartNo}
                </div>
              )}
              {selectedVoter.SectionNo && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Section No:</strong> {selectedVoter.SectionNo}
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <strong>Status:</strong>{" "}
                <span style={{ color: selectedVoter.Visited ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>
                  {selectedVoter.Visited ? "✅ Visited" : "⏳ Not Visited"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Modal */}
      {surveyOpen && surveyVoter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={() => setSurveyOpen(false)}
        >
          <div 
            style={{ 
              background: "#fff", 
              padding: 20, 
              borderRadius: 8, 
              width: 400,
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>
              👤 {surveyVoter.VEName} / {surveyVoter.EName}
            </h3>
            <p style={{ fontSize: 14, color: "#666" }}>{surveyVoter.VAddress}</p>

            <input
              placeholder="घर क्रमांक"
              value={houseNo}
              onChange={e => setHouseNo(e.target.value)}
              style={{ width: "100%", marginTop: 12, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <input
              placeholder="मोबाईल नंबर *"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <input
              placeholder="Landmark"
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <input
              placeholder="जात (Optional)"
              value={caste}
              onChange={e => setCaste(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button 
                onClick={submitIndividual}
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  background: "#4CAF50", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Submit
              </button>
              <button 
                onClick={() => setSurveyOpen(false)}
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  background: "#f44336", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={{ marginTop: 40, color: "#777", textAlign: "center", fontSize: 12 }}>
        Last updated: {new Date().toLocaleString()}
      </p>
    </div>
  );
}

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