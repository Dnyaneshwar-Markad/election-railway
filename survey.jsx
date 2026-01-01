// import React, { useEffect, useState } from "react";
// // import Plot from "react-plotly.js";
// import axios from "axios";
// // import { useNavigate } from "react-router-dom";

// const API_BASE = "https://election-2nlh.onrender.com";

// export default function Survey() {
//   const token = localStorage.getItem("token");
//   const mainAdminId = localStorage.getItem("main_admin_id");

//   const auth = {
//     headers: { Authorization: `Bearer ${token}` }
//   };

//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const pageSize = 50;

//   const [rows, setRows] = useState([]);
//   const [total, setTotal] = useState(0);

//   const [selected, setSelected] = useState([]);
//   const [headId, setHeadId] = useState(null);

//   const [houseNo, setHouseNo] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [landmark, setLandmark] = useState("");
//   const [caste, setCaste] = useState("");

//   /* ================= SEARCH ================= */
//   useEffect(() => {
//     if (search.length >= 2) {
//       loadVoters();
//     } else {
//       setRows([]);
//     }
//   }, [search, page]);

//   const loadVoters = async () => {
//     const res = await axios.get(`${API_BASE}/voters`, {
//       ...auth,
//       params: {
//         search,
//         limit: pageSize,
//         offset: (page - 1) * pageSize
//       }
//     });

//     setRows(res.data.rows || []);
//     setTotal(res.data.total || 0);
//   };

//   const totalPages = Math.max(1, Math.ceil(total / pageSize));

//   /* ================= FAMILY CALCS ================= */
//   const maleCount = selected.filter(r => r.Sex === "M").length;
//   const femaleCount = selected.filter(r => r.Sex === "F").length;

//   /* ================= SUBMIT ================= */
//   const submitSurvey = async () => {
//     if (!mobile || !/^\d{10}$/.test(mobile)) {
//       alert("❌ वैध मोबाईल नंबर द्या");
//       return;
//     }

//     const payload = {
//       family_head_id: headId,
//       selected_family_ids: selected.map(r => r.VoterID),
//       house_number: houseNo,
//       landmark,
//       mobile,
//       caste,
//       visited: 1,
//       main_admin_id: Number(mainAdminId)
//     };

//     const res = await axios.post(
//       `${API_BASE}/submit-survey`,
//       payload,
//       auth
//     );

//     if (res.data.success) {
//       alert("✅ सर्वेक्षण यशस्वी");
//       resetForm();
//     } else {
//       alert(res.data.message || "Submission failed");
//     }
//   };

//   const resetForm = () => {
//     setSearch("");
//     setSelected([]);
//     setHeadId(null);
//     setHouseNo("");
//     setMobile("");
//     setLandmark("");
//     setCaste("");
//     setPage(1);
//   };

//   /* ================= UI ================= */
//   return (
//     <div style={{ padding: 20 }}>
//       <h2>📋 सर्वेक्षण फॉर्म</h2>

//       {/* SEARCH */}
//       <input
//         placeholder="Search voter (नाव शोधा)"
//         value={search}
//         onChange={e => {
//           setSearch(e.target.value);
//           setPage(1);
//         }}
//         style={{ padding: 8, width: 350 }}
//       />

//       {/* RESULTS */}
//       {rows.map(r => (
//         <label
//           key={r.VoterID}
//           style={{
//             display: "block",
//             marginTop: 8,
//             background: r.Visited ? "#e8f5e9" : "#fff",
//             padding: 8,
//             borderRadius: 6
//           }}
//         >
//           <input
//             type="checkbox"
//             checked={selected.some(s => s.VoterID === r.VoterID)}
//             onChange={e => {
//               if (e.target.checked) {
//                 setSelected([...selected, r]);
//               } else {
//                 setSelected(selected.filter(s => s.VoterID !== r.VoterID));
//               }
//             }}
//           />{" "}
//           {r.Visited ? "✅ " : ""}
//           {r.VEName} / {r.EName} – {r.VAddress}
//         </label>
//       ))}

//       {/* PAGINATION */}
//       {rows.length > 0 && (
//         <div style={{ marginTop: 15 }}>
//           <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>⬅ Prev</button>
//           <span style={{ margin: "0 10px" }}>
//             Page {page} of {totalPages}
//           </span>
//           <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ➡</button>
//         </div>
//       )}

//       {/* FAMILY DETAILS */}
//       {selected.length > 0 && (
//         <>
//           <hr />
//           <h3>👨‍👩‍👧‍👦 Family Details</h3>

//           <select
//             value={headId || ""}
//             onChange={e => setHeadId(Number(e.target.value))}
//           >
//             <option value="">कुटुंब प्रमुख निवडा</option>
//             {selected.map(r => (
//               <option key={r.VoterID} value={r.VoterID}>
//                 {r.VEName} / {r.EName}
//               </option>
//             ))}
//           </select>

//           <div style={{ marginTop: 10 }}>
//             <p>एकूण मतदार: {selected.length}</p>
//             <p>पुरुष: {maleCount}</p>
//             <p>स्त्री: {femaleCount}</p>
//             <p>पत्ता: {selected.find(r => r.VoterID === headId)?.VAddress}</p>
//           </div>

//           <div style={{ marginTop: 10 }}>
//             <input placeholder="घर क्रमांक" value={houseNo} onChange={e => setHouseNo(e.target.value)} />
//             <br />
//             <input placeholder="मोबाईल नंबर" value={mobile} onChange={e => setMobile(e.target.value)} />
//             <br />
//             <input placeholder="Landmark" value={landmark} onChange={e => setLandmark(e.target.value)} />
//             <br />
//             <input placeholder="जात (Optional)" value={caste} onChange={e => setCaste(e.target.value)} />
//           </div>

//           <button style={{ marginTop: 15 }} onClick={submitSurvey}>
//             Submit Survey
//           </button>
//         </>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://election-2nlh.onrender.com";

export default function Survey() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const mainAdminId = localStorage.getItem("main_admin_id");

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // -------- Individual Survey --------
  const [openIndividual, setOpenIndividual] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);

  const [mobile, setMobile] = useState("");
  const [landmark, setLandmark] = useState("");
  const [caste, setCaste] = useState("");
  const [houseNo, setHouseNo] = useState("");

  // -------- Family Survey --------
  const [openFamily, setOpenFamily] = useState(false);
  const [selected, setSelected] = useState([]);
  const [headId, setHeadId] = useState(null);
  const [familyMobile, setFamilyMobile] = useState("");
  const [familyLandmark, setFamilyLandmark] = useState("");
  const [familyCaste, setFamilyCaste] = useState("");
  const [familyHouseNo, setFamilyHouseNo] = useState("");

  useEffect(() => {
    loadVoters();
  }, [search, page]);

  const loadVoters = async () => {
    try{const res = await axios.get(`${API_BASE}/voters/list`, {
      ...auth,
      params: { search: search || undefined, limit: pageSize, offset: (page - 1) * pageSize }
    });

    setRows(res.data.rows || []);
    setTotal(res.data.total || 0);
    }catch (err) {
      console.error("Error loading voters:", err);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /* ================= INDIVIDUAL SUBMIT ================= */
  const submitIndividual = async () => {
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      alert("❌ वैध मोबाईल नंबर द्या");
      return;
    }

    const payload = {
      family_head_id: currentPerson.VoterID,
      selected_family_ids: [currentPerson.VoterID],
      house_number: houseNo,
      landmark,
      mobile,
      caste,
      visited: 1,
      main_admin_id: Number(mainAdminId)
    };

    try {
      const res = await axios.post(`${API_BASE}/submit-survey`, payload, auth);

    if (res.data.success) {
      alert("✅ सर्वेक्षण यशस्वी");
      setOpenIndividual(false);
      resetIndividual();
      loadVoters(); // Refresh list
    } else alert(res.data.message || "Submission failed");
    } catch (err) {
      console.error("Error submitting individual:", err);
      alert("Error submitting survey");

    }
  };

  const resetIndividual = () => {
    setMobile("");
    setLandmark("");
    setCaste("");
    setHouseNo("");
  };

  /* ================= FAMILY SUBMIT ================= */
  const submitFamily = async () => {
    if (!headId) return alert("कुटुंब प्रमुख निवडा");
    if (selected.length === 0) return alert("कुटुंबातील सदस्य निवडा");
    if (!familyMobile || !/^\d{10}$/.test(familyMobile)) {
      alert("❌ वैध मोबाईल नंबर द्या");
      return;
    }

    const payload = {
      family_head_id: headId,
      selected_family_ids: selected.map(r => r.VoterID),
      house_number: familyHouseNo,
      landmark: familyLandmark,
      mobile: familyMobile,
      caste: familyCaste,
      visited: 1,
      main_admin_id: Number(mainAdminId)
    };

    try {
      const res = await axios.post(`${API_BASE}/submit-survey`, payload, auth);

    if (res.data.success) {
      alert("✅ कुटुंब सर्वेक्षण यशस्वी");
      setSelected([]);
      setHeadId(null);
    } else alert(res.data.message || "Submission failed");
    } catch (err) {
      console.error("Error submitting family:", err);
      alert("Error submitting family survey");
    }
  };

  const resetFamily = () => {
    setSelected([]);
    setHeadId(null);
    setFamilyMobile("");
    setFamilyLandmark("");
    setFamilyCaste("");
    setFamilyHouseNo("");
  };
  const openFamilyModal = () => {
    if (rows.length === 0) {
      alert("कृपया आधी मतदार शोधा (Please search for voters first)");
      return;
    } else setOpenFamily(true);
  };

  const toggleFamilyMember = (voter) => {
    const exists = selected.find(s => s.VoterID === voter.VoterID);
    if (exists) {
      setSelected(selected.filter(s => s.VoterID !== voter.VoterID));

      if (headId === voter.VoterID) setHeadId(null);
    } else {
      setSelected([...selected, voter]);
    }
  };

  const maleCount = selected.filter(r => r.Sex === "M").length;
  const femaleCount = selected.filter(r => r.Sex === "F").length;
  const familyHead = selected.find(r => r.VoterID === headId);
  /* ================= UI ================= */
  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
        }}
        >
        <h1
            style={{
            fontSize: 34,
            fontWeight: 800,
            color: "#222",
            }}
        >
            Survey
        </h1>

        <button
            onClick={() => navigate("/dashboard")}
            style={{
            padding: "10px 18px",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            cursor: "pointer",
            fontWeight: 600,
            }}
        >
            ⬅ Back
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" , marginBottom: 15}}>
        <input
          placeholder="Search voter (नाव शोधा)"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ padding: 8, width: 550, borderRadius:"1px solid #ccc" }}
        />

        <button
        onClick={openFamilyModal}
        style={{
          padding: "9.5px 60px",
          background: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}>
          👨‍👩‍👧‍👦 Family Survey
        </button>
      </div>

      {/* ================= LIST (50 voters) ================= */}
      <div style={{ marginTop: 10 }}>
        {rows.map(r => (
          <div
            key={r.VoterID}
            style={{
              background: r.Visited ? "#d1fae5" : "#fed7aa",
              borderLeft: `5px solid ${r.Visited ? "#10b981" : "#f59e0b"}`,
              padding: 15,
              marginTop: 6,
              marginBottom: 10,
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "transform 0.1s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onClick={() => {
              setCurrentPerson(r);
              setHouseNo(r.HouseNo || "");
              setLandmark(r.Landmark || "");
              setCaste(r.Caste || "");
              setMobile(r.Mobile || "");
              setOpenIndividual(true);
            }}
          >
            <div>
              <b style={{ fontSize: 16 }}>{r.VEName}</b> / ( {r.EName}  )
            </div>
          </div>
        ))}

        {rows.length > 0 && (
          <div style={{ marginTop: 15 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "6px 12px", marginRight: 10 }}>
              ⬅ Prev
            </button>
            <span style={{ margin: "0 10px" }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)} style={{ padding: "6px 12px", marginRight: 10 }}
            >
              Next ➡
            </button>
          </div>
        )}
      </div>

      {/* ================= INDIVIDUAL FORM MODAL ================= */}
      {openIndividual && currentPerson && (
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
          onClick={() => setOpenIndividual(false)}
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
              👤 {currentPerson.VEName} / {currentPerson.EName}
            </h3>
            <p style={{ fontSize: 14, color: "#666" }}>{currentPerson.VAddress}</p>

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
                onClick={() => setOpenIndividual(false)}
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

      {/* ================= FAMILY SURVEY PANEL ================= */}
      {openFamily && (
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
          onClick={() => setOpenFamily(false)}
        >
          <div 
            style={{ 
              background: "#fff", 
              padding: 20, 
              borderRadius: 8, 
              width: 500,
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>
              👨‍👩‍👧‍👦 कुटुंब सर्वेक्षण
            </h3>
            {search && (
              <p style={{ fontSize: 14, color: "#666", marginTop: -8 }}>
                Search: <strong>{search}</strong>
              </p>
            )}

            {/* Family Head Address Display */}
            {familyHead && (
              <div style={{ 
                padding: 10, 
                background: "#e3f2fd", 
                borderRadius: 4, 
                marginBottom: 12,
                fontSize: 14
              }}>
                <strong>पत्ता:</strong> {familyHead.VAddress}
              </div>
            )}

            {/* Member Selection */}
            <div style={{ 
              maxHeight: 250, 
              overflowY: "auto", 
              border: "1px solid #ddd", 
              borderRadius: 4, 
              padding: 10,
              marginBottom: 12
            }}>
              {rows.map(r => (
                <label 
                  key={r.VoterID} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 10, 
                    padding: "6px 0",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.some(s => s.VoterID === r.VoterID)}
                    onChange={() => toggleFamilyMember(r)}
                  />
                  <span style={{ fontSize: 14 }}>
                    {r.VEName} / {r.EName} ({r.Sex})
                  </span>
                </label>
              ))}
            </div>


            <div style={{ marginBottom: 12 }}>
              <label><strong>कुटुंब प्रमुख</strong></label>

              <select
                value={headId || ""}
                onChange={e => {setHeadId(e.target.value);
                  const head = selected.find(m => m.VoterID == e.target.value);
                  if (head?.Mobile) setFamilyMobile(head.Mobile);
                }}
                style={{ width: "100%", padding: 8, borderRadius: 4, marginTop: 6 }}
                disabled={selected.length === 0}
              >
                <option value="">— Select Family Head —</option>

                {selected.map(m => (
                  <option key={m.VoterID} value={m.VoterID}>
                    {m.VEName} - [{m.EName}]
                  </option>
                ))}
              </select>
            </div>
            {/* Count Display */}
            {selected.length > 0 && (
              <div style={{ 
                display: "flex", 
                gap: 15, 
                padding: "10px", 
                background: "#f5f5f5", 
                borderRadius: 4,
                marginBottom: 12,
                fontSize: 14
              }}>
                <span><strong>एकूण:</strong> {selected.length}</span>
                <span><strong>पुरुष:</strong> {maleCount}</span>
                <span><strong>स्त्री:</strong> {femaleCount}</span>
              </div>
            )}

            {/* Form Fields */}
            <input
              placeholder="घर क्रमांक"
              value={familyHouseNo}
              onChange={e => setFamilyHouseNo(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <input
              placeholder="मोबाईल नंबर *"
              value={familyMobile}
              onChange={e => setFamilyMobile(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <input
              placeholder="Landmark"
              value={familyLandmark}
              onChange={e => setFamilyLandmark(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <input
              placeholder="जात (Optional)"
              value={familyCaste}
              onChange={e => setFamilyCaste(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button 
                onClick={submitFamily}
                disabled={selected.length === 0 || !headId}
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  background: selected.length === 0 || !headId ? "#ccc" : "#4CAF50", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 4,
                  cursor: selected.length === 0 || !headId ? "not-allowed" : "pointer"
                }}
              >
                Submit Family
              </button>
              <button 
                onClick={() => setOpenFamily(false)}
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
    </div>
  );
}

const navButton = {
  padding: "8px 16px",
  marginLeft: 10,
  borderRadius: 6,
  border: "none",
  background: "#d5dfefff",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};