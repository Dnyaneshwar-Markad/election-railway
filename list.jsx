import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://election-2nlh.onrender.com";

export default function List() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const mainAdminId = localStorage.getItem("main_admin_id");

    // KPI State
    const [total, setTotal] = useState(0);
    const [visited, setVisited] = useState(0);
    const [notVisited, setNotVisited] = useState(0);
    const [male, setMale] = useState(0);
    const [female, setFemale] = useState(0);
    const [totalSurnames, setTotalSurnames] = useState(0);
    const [totalAddresses, setTotalAddresses] = useState(0);
    const [totalPartNos, setTotalPartNos] = useState(0);

    // Active View State
    const [activeView, setActiveView] = useState("total");
    const [searchTerm, setSearchTerm] = useState("");

    // Voter List State
    const [voters, setVoters] = useState([]);
    const [voterPage, setVoterPage] = useState(1);
    const [voterTotal, setVoterTotal] = useState(0);
    const voterPageSize = 20;

    // Group State
    const [groups, setGroups] = useState([]);
    const [groupSearch, setGroupSearch] = useState("");
    const [allSurnamesData, setAllSurnamesData] = useState([]);
    const [allAddressesData, setAllAddressesData] = useState([]);
    const [allPartNosData, setAllPartNosData] = useState([]);

    // Modal State for Groups
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMembers, setModalMembers] = useState([]);
    const [modalPage, setModalPage] = useState(1);
    const modalPageSize = 10;

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

    // Fetch Helper
    const apiFetch = async (url, params = {}) => {
        const query = new URLSearchParams(
            Object.entries(params).filter(([, v]) => v !== undefined)
        ).toString();
        
        const response = await fetch(`${url}${query ? `?${query}` : ""}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error("API Error");
        return response.json();
    };

    // Load KPI
    const loadKPI = async () => {
        try {
            const data = await apiFetch(`${API_BASE}/voters/summary`);
            setTotal(data?.total || 0);
            setVisited(data?.visited || 0);
            setNotVisited(data?.not_visited || 0);
            
            const sexBreakdown = data?.sex_breakdown || {};
            setMale(sexBreakdown.M || 0);
            setFemale(sexBreakdown.F || 0);
        } catch (e) {
            console.error("KPI load error:", e);
        }
    };

    // Load Group Counts and Lists
    const loadGroupCounts = async (search = "") => {
        try {
            const params = search ? { search } : {};
            const data = await apiFetch(`${API_BASE}/voters-data/counts`, params);
            
            setAllSurnamesData(data?.surnames || []);
            setAllAddressesData(data?.addresses || []);
            setAllPartNosData(data?.part_numbers || []);
            
            setTotalSurnames(data?.total_surnames || 0);
            setTotalAddresses(data?.total_addresses || 0);
            setTotalPartNos(data?.total_part_numbers || 0);
            
            if (activeView === "surname") {
                setGroups(data?.surnames || []);
            } else if (activeView === "address") {
                setGroups(data?.addresses || []);
            } else if (activeView === "partno") {
                setGroups(data?.part_numbers || []);
            }
        } catch (e) {
            console.error("Count load error:", e);
        }
    };

    // Load Voters with Filters
    const loadVoters = async (page = 1, search = "", filters = {}) => {
        try {
            const params = {
                offset: (page - 1) * voterPageSize,
                limit: voterPageSize,
                search: search || undefined,
                ...filters,
            };

            const data = await apiFetch(`${API_BASE}/voters/list`, params);
            setVoters(data?.rows || []);
            setVoterTotal(data?.total || 0);
            setVoterPage(page);
        } catch (e) {
            console.error("Voters load error:", e);
        }
    };

    // Load specific group members from API
    const loadGroupMembers = async (groupType, groupValue) => {
        try {
            const params = {
                view_type: groupType,
                limit: 3000,
            };

            if (groupType === "surname") {
                params.surname = groupValue;
            } else if (groupType === "address") {
                params.address = groupValue;
            } else if (groupType === "part_no") {
                params.part_no = groupValue;
            }

            const data = await apiFetch(`${API_BASE}/voters-data`, params);

            const group = data?.data?.[0];
            if (group) {
                setModalTitle(group.group);
                setModalMembers(group.members);
                setModalPage(1);
                setModalOpen(true);
            }
        } catch (e) {
            console.error("Group members load error:", e);
        }
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
            const response = await fetch(`${API_BASE}/submit-survey`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const res = await response.json();

            if (res.success) {
                alert("✅ सर्वेक्षण यशस्वी");
                setSurveyOpen(false);
                resetSurveyForm();
                
                // Refresh the current view
                const filters = {};
                if (activeView === "visited") filters.visited = true;
                if (activeView === "notVisited") filters.visited = false;
                if (activeView === "male") filters.sex = "M";
                if (activeView === "female") filters.sex = "F";
                
                loadVoters(voterPage, searchTerm, filters);
                loadKPI();
            } else {
                alert(res.message || "Submission failed");
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

    // Initial Load
    useEffect(() => {
        loadKPI();
        loadVoters(1, "", {});
        loadGroupCounts();
    }, []);

    // KPI Click Handlers
    const handleKPIClick = (view) => {
        setActiveView(view);
        setSearchTerm("");
        setGroupSearch("");
        setVoterPage(1);

        switch (view) {
            case "total":
                loadVoters(1, "", {});
                break;
            case "visited":
                loadVoters(1, "", { visited: true });
                break;
            case "notVisited":
                loadVoters(1, "", { visited: false });
                break;
            case "male":
                loadVoters(1, "", { sex: "M" });
                break;
            case "female":
                loadVoters(1, "", { sex: "F" });
                break;
            case "surname":
                setGroups(allSurnamesData);
                break;
            case "address":
                setGroups(allAddressesData);
                break;
            case "partno":
                setGroups(allPartNosData);
                break;
        }
    };

    // Search Handler for Voters
    const handleVoterSearch = (search) => {
        setSearchTerm(search);
        const filters = {};
        
        if (activeView === "visited") filters.visited = true;
        if (activeView === "notVisited") filters.visited = false;
        if (activeView === "male") filters.sex = "M";
        if (activeView === "female") filters.sex = "F";

        loadVoters(1, search, filters);
    };

    // Search Handler for Groups
    const handleGroupSearch = (search) => {
        setGroupSearch(search);
        loadGroupCounts(search);
    };

    // Open Modal with Group Members
    const openModal = (groupItem) => {
        if (activeView === "surname") {
            loadGroupMembers("surname", groupItem.surname);
        } else if (activeView === "address") {
            loadGroupMembers("address", groupItem.address);
        } else if (activeView === "partno") {
            loadGroupMembers("part_no", groupItem.part_no);
        }
    };

    // Open Detail Modal
    const openDetailModal = (voter) => {
        setSelectedVoter(voter);
        setDetailModalOpen(true);
    };

    // KPI Component
    const KPI = ({ title, value, subtitle, color, view, active }) => (
        <div
            onClick={() => handleKPIClick(view)}
            style={{
                padding: 15,
                borderRadius: 12,
                background: color,
                color: "#fff",
                boxShadow: active ? "0 12px 24px rgba(0,0,0,.2)" : "0 8px 16px rgba(0,0,0,.12)",
                cursor: "pointer",
                transform: active ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s ease",
                border: active ? "3px solid #fff" : "none",
            }}
        >
            <div style={{ fontSize: 13, opacity: 0.9 }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
            {subtitle && <div style={{ fontSize: 12 }}>{subtitle}</div>}
        </div>
    );

    // Pagination
    const voterTotalPages = Math.ceil(voterTotal / voterPageSize);
    const paginatedModalMembers = modalMembers.slice(
        (modalPage - 1) * modalPageSize,
        modalPage * modalPageSize
    );
    const modalTotalPages = Math.ceil(modalMembers.length / modalPageSize);

    return (
        <div style={{ padding: 25, fontFamily: "system-ui, sans-serif" }}>
            {/* Header with Back Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>List Dashboard</h2>
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

            {/* KPI Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 15,
                }}
            >
                <KPI title="Total Voters" value={total} color="#3b82f6" view="total" active={activeView === "total"} />
                <KPI title="Visited" value={visited} subtitle={`${((visited / total) * 100 || 0).toFixed(1)}%`} color="#10b981" view="visited" active={activeView === "visited"} />
                <KPI title="Not Visited" value={notVisited} subtitle={`${((notVisited / total) * 100 || 0).toFixed(1)}%`} color="#f59e0b" view="notVisited" active={activeView === "notVisited"} />
                <KPI title="Male" value={male} color="#8b5cf6" view="male" active={activeView === "male"} />
                <KPI title="Female" value={female} color="#ec4899" view="female" active={activeView === "female"} />
                <KPI title="Surnames" value={totalSurnames || "--"} color="#0ea5e9" view="surname" active={activeView === "surname"} />
                <KPI title="Addresses" value={totalAddresses || "--"} color="#fbbf24" view="address" active={activeView === "address"} />
                <KPI title="Part Numbers" value={totalPartNos || "--"} color="#f97316" view="partno" active={activeView === "partno"} />
            </div>

            {/* Voter List View */}
            {["total", "visited", "notVisited", "male", "female"].includes(activeView) && (
                <div style={{ marginTop: 35 }}>
                    <h3 style={{ marginBottom: 15 }}>
                        {activeView === "total" && "All Voters"}
                        {activeView === "visited" && "Visited Voters"}
                        {activeView === "notVisited" && "Not Visited Voters"}
                        {activeView === "male" && "Male Voters"}
                        {activeView === "female" && "Female Voters"}
                    </h3>

                    <input
                        placeholder="Search voters..."
                        value={searchTerm}
                        onChange={(e) => handleVoterSearch(e.target.value)}
                        style={{
                            padding: 10,
                            width: "100%",
                            maxWidth: 400,
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            marginBottom: 15,
                        }}
                    />

                    {voters.length === 0 ? (
                        <div style={{ padding: 20, textAlign: "center", color: "#666" }}>No voters found</div>
                    ) : (
                        voters.map((v, i) => (
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
                        ))
                    )}

                    {voterTotalPages > 1 && (
                        <div style={{ display: "flex", gap: 10, marginTop: 15, alignItems: "center", justifyContent: "center" }}>
                            <button
                                disabled={voterPage === 1}
                                onClick={() => {
                                    const filters = {};
                                    if (activeView === "visited") filters.visited = true;
                                    if (activeView === "notVisited") filters.visited = false;
                                    if (activeView === "male") filters.sex = "M";
                                    if (activeView === "female") filters.sex = "F";
                                    loadVoters(voterPage - 1, searchTerm, filters);
                                }}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: 6,
                                    border: "1px solid #ddd",
                                    background: voterPage === 1 ? "#f3f4f6" : "#fff",
                                    cursor: voterPage === 1 ? "not-allowed" : "pointer",
                                }}
                            >
                                ◀ Previous
                            </button>
                            <span>Page {voterPage} / {voterTotalPages}</span>
                            <button
                                disabled={voterPage === voterTotalPages}
                                onClick={() => {
                                    const filters = {};
                                    if (activeView === "visited") filters.visited = true;
                                    if (activeView === "notVisited") filters.visited = false;
                                    if (activeView === "male") filters.sex = "M";
                                    if (activeView === "female") filters.sex = "F";
                                    loadVoters(voterPage + 1, searchTerm, filters);
                                }}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: 6,
                                    border: "1px solid #ddd",
                                    background: voterPage === voterTotalPages ? "#f3f4f6" : "#fff",
                                    cursor: voterPage === voterTotalPages ? "not-allowed" : "pointer",
                                }}
                            >
                                Next ▶
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Group List View */}
            {["surname", "address", "partno"].includes(activeView) && (
                <div style={{ marginTop: 35 }}>
                    <h3 style={{ marginBottom: 15 }}>
                        {activeView === "surname" && "Surnames"}
                        {activeView === "address" && "Addresses"}
                        {activeView === "partno" && "Part Numbers"}
                    </h3>

                    <input
                        placeholder={`Search ${activeView === "surname" ? "surnames" : activeView === "address" ? "addresses" : "part numbers"}...`}
                        value={groupSearch}
                        onChange={(e) => handleGroupSearch(e.target.value)}
                        style={{
                            padding: 10,
                            width: "100%",
                            maxWidth: 400,
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            marginBottom: 15,
                        }}
                    />

                    {groups.length === 0 ? (
                        <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
                            No {activeView === "surname" ? "surnames" : activeView === "address" ? "addresses" : "part numbers"} found
                        </div>
                    ) : (
                        groups.map((g, i) => {
                            const displayName = activeView === "surname" ? g.surname : activeView === "address" ? g.address : g.part_no;
                            const count = g.count;
                            
                            return (
                                <div
                                    key={i}
                                    onClick={() => openModal(g)}
                                    style={{
                                        padding: 12,
                                        borderRadius: 10,
                                        background: "#fff",
                                        marginBottom: 8,
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        boxShadow: "0 2px 6px rgba(0,0,0,.08)",
                                        transition: "transform 0.1s ease",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    <b>{displayName}</b>
                                    <span style={{ color: "#666" }}>{count} voters</span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Group Members Modal */}
            {modalOpen && (
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
                        zIndex: 1000,
                    }}
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 25,
                            width: "95%",
                            maxWidth: 900,
                            maxHeight: "88vh",
                            overflow: "auto",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 20,
                                borderBottom: "2px solid #f3f4f6",
                                paddingBottom: 15,
                            }}
                        >
                            <h3 style={{ margin: 0 }}>{modalTitle}</h3>
                            <button
                                onClick={() => setModalOpen(false)}
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

                        {paginatedModalMembers.map((m, i) => (
                            <div
                                key={i}
                                onClick={() => openDetailModal(m)}
                                style={{
                                    background: m.Visited ? "#d1fae5" : "#fed7aa",
                                    borderLeft: `5px solid ${m.Visited ? "#10b981" : "#f59e0b"}`,
                                    padding: 12,
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    cursor: "pointer",
                                    transition: "transform 0.1s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <b>{m.VEName}</b>
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openSurveyModal(m);
                                        }}
                                        style={{
                                            padding: "5px 10px",
                                            borderRadius: 5,
                                            background: m.Visited ? "#10b981" : "#f59e0b",
                                            color: "white",
                                            fontSize: 12,
                                            fontWeight: "bold",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {m.Visited ? "✅ Visited" : "⏳ Pending"}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {modalTotalPages > 1 && (
                            <div style={{ display: "flex", gap: 10, marginTop: 15, alignItems: "center", justifyContent: "center" }}>
                                <button
                                    disabled={modalPage === 1}
                                    onClick={() => setModalPage((p) => p - 1)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #ddd",
                                        background: modalPage === 1 ? "#f3f4f6" : "#fff",
                                        cursor: modalPage === 1 ? "not-allowed" : "pointer",
                                    }}
                                >
                                    ◀ Previous
                                </button>
                                <span>Page {modalPage} / {modalTotalPages}</span>
                                <button
                                    disabled={modalPage === modalTotalPages}
                                    onClick={() => setModalPage((p) => p + 1)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #ddd",
                                        background: modalPage === modalTotalPages ? "#f3f4f6" : "#fff",
                                        cursor: modalPage === modalTotalPages ? "not-allowed" : "pointer",
                                    }}
                                >
                                    Next ▶
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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
                                <strong>Gender:</strong> {selectedVoter.Sex === "M" ? "Male" : selectedVoter.Gender === "M" ? "Male" : "Female"}
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
                {selectedVoter.Visited !== undefined && (
                    <div style={{ marginBottom: 12 }}>
                    <strong>Status:</strong>{" "}
                    <span style={{ color: selectedVoter.Visited ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>
                        {selectedVoter.Visited ? "✅ Visited" : "⏳ Not Visited"}
                    </span>
                    </div>
                )}
                </div>
            </div>
            </div>
        )}
        {/* Survey Popup Modal */}
        {surveyOpen && surveyVoter && (
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
            zIndex: 1100,
            }}
            onClick={() => setSurveyOpen(false)}
        >
            <div
            onClick={(e) => e.stopPropagation()}
            style={{
                background: "#fff",
                borderRadius: 12,
                padding: 25,
                width: "95%",
                maxWidth: 500,
                maxHeight: "85vh",
                overflow: "auto",
            }}
            >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Individual Survey</h3>
                <button
                onClick={() => setSurveyOpen(false)}
                style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer" }}
                >
                ×
                </button>
            </div>

            <div style={{ marginBottom: 12 }}>
                <strong>{surveyVoter.VEName}</strong>
                <div style={{ fontSize: 13, color: "#777" }}>{surveyVoter.Address}</div>
            </div>

            <label>Mobile</label>
            <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
                placeholder="Enter mobile"
            />

            <label>House No</label>
            <input
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label>Landmark</label>
            <input
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label>Caste</label>
            <input
                value={caste}
                onChange={(e) => setCaste(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 15 }}
            />

            <button
                onClick={submitIndividual}
                style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "none",
                background: "#10b981",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                }}
            >
                Submit Survey
            </button>
            </div>
        </div>
        )}

        </div>
    );
}