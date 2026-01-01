// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const API_BASE = "https://election-2nlh.onrender.com";

// export default function Settings() {
//     const navigate = useNavigate();

//     const [loading, setLoading] = useState(true);
//     const [status, setStatus] = useState(null);
//     const [users, setUsers] = useState([]);

//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");

//     const token = localStorage.getItem("token");

//     const auth = {
//         headers: { Authorization: `Bearer ${token}` },
//     };

//     // ================= LOAD USER STATUS (ADMIN CHECK) ==================
//     const loadStatus = async () => {
//         try {
//         const res = await axios.get(`${API_BASE}/user/status`, auth);

//         // if not admin -> redirect
//         if ((res.data.role || "").toLowerCase() !== "admin") {
//             alert("⚠️ तुम्हाला सेटिंग्ज पृष्ठावर प्रवेश नाही");
//             navigate("/dashboard");
//             return;
//         }

//         setStatus(res.data);
//         } catch (err) {
//         console.log(err);
//         alert("Session expired. Please login again.");
//         navigate("/login");
//         } finally {
//         setLoading(false);
//         }
//     };

//     // ================= LOAD SUB USERS ==================
//     const loadUsers = async () => {
//         try {
//         const res = await axios.get(`${API_BASE}/users`, auth);
//         setUsers(res.data || []);
//         } catch (err) {
//         console.log(err);
//         }
//     };

//     useEffect(() => {
//         loadStatus();
//         loadUsers();
//     }, []);

//     // ================= CREATE SUB USER ==================
//     const submitUser = async (e) => {
//         e.preventDefault();

//         if (!username || !password) {
//         alert("कृपया युजरनेम आणि पासवर्ड भरा");
//         return;
//         }

//         if (status.remaining <= 0) {
//         alert("❌ Allocation limit exceeded!");
//         return;
//         }

//         try {
//         await axios.post(
//             `${API_BASE}/add-subuser`,
//             { username, password },
//             auth
//         );

//         alert("✅ Subuser तयार झाला!");

//         setUsername("");
//         setPassword("");

//         loadStatus();
//         loadUsers();
//         } catch (err) {
//         alert(
//             err?.response?.data?.detail ||
//             "Server error while creating user"
//         );
//         }
//     };

//     if (loading) return <div className="p-4">Loading…</div>;

//     return (
//         <div className="p-4 space-y-4">
//         {/* TOP BAR */}
//         <div className="flex items-center justify-between">
//             <button
//             onClick={() => navigate("/dashboard")}
//             className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
//             >
//             ⬅️ Back
//             </button>

//             <h2 className="text-xl font-bold">⚙️ Settings</h2>
//         </div>

//         {/* CARD */}
//         <div className="bg-white shadow-md rounded-2xl p-4 space-y-4">

//             <div className="grid grid-cols-3 gap-3 text-center">
//             <div className="p-3 bg-blue-50 rounded-xl">
//                 <p className="text-sm">📊 Allocated</p>
//                 <p className="text-lg font-bold">{status.allocated}</p>
//             </div>

//             <div className="p-3 bg-green-50 rounded-xl">
//                 <p className="text-sm">👥 Current Users</p>
//                 <p className="text-lg font-bold">{status.users}</p>
//             </div>

//             <div className="p-3 bg-purple-50 rounded-xl">
//                 <p className="text-sm">✅ Remaining</p>
//                 <p className="text-lg font-bold">{status.remaining}</p>
//             </div>
//             </div>

//             {/* FORM */}
//             <hr />

//             <h3 className="font-semibold">➕ Create Sub User</h3>

//             <form className="space-y-3" onSubmit={submitUser}>
//             <input
//                 className="w-full border p-2 rounded-xl"
//                 placeholder="👤 Username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//             />

//             <input
//                 className="w-full border p-2 rounded-xl"
//                 placeholder="🔑 Password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//             />

//             <button
//                 className="w-full bg-blue-600 text-white p-2 rounded-xl"
//                 type="submit"
//             >
//                 Create User
//             </button>
//             </form>

//             {/* USER LIST */}
//             <hr />
//             <h3 className="font-semibold">👥 Sub Users</h3>

//             {users.length === 0 ? (
//             <p>अजून कोणतेही युजर तयार नाहीत</p>
//             ) : (
//             <ul className="space-y-2">
//                 {users.map((u) => (
//                 <li
//                     key={u.UserID}
//                     className="p-2 border rounded-xl flex justify-between"
//                 >
//                     <div>
//                     <b>{u.Username}</b>
//                     <div className="text-sm text-gray-500">
//                         Role: {u.Role}
//                     </div>
//                     </div>
//                     <span className="text-xs">{u.CreatedAt}</span>
//                 </li>
//                 ))}
//             </ul>
//             )}
//         </div>
//         </div>
//     );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://election-2nlh.onrender.com";

export default function Settings() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [users, setUsers] = useState([]);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const token = localStorage.getItem("token");

    const auth = {
        headers: { Authorization: `Bearer ${token}` },
    };

    const loadStatus = async () => {
        try {
        const res = await axios.get(`${API_BASE}/user/status`, auth);

        if ((res.data.role || "").toLowerCase() !== "admin") {
            alert("⚠️ तुम्हाला सेटिंग्ज पृष्ठावर प्रवेश नाही");
            navigate("/dashboard");
            return;
        }

        setStatus(res.data);
        } catch (err) {
        alert("Session expired. Please login again.");
        navigate("/login");
        } finally {
        setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
        const res = await axios.get(`${API_BASE}/users`, auth);
        setUsers(res.data || []);
        } catch (err) {
        console.log(err);
        }
    };

    useEffect(() => {
        loadStatus();
        loadUsers();
    }, []);

    const submitUser = async (e) => {
        e.preventDefault();

        if (!username || !password) {
        alert("कृपया युजरनेम आणि पासवर्ड भरा");
        return;
        }

        if (status.remaining <= 0) {
        alert("❌ Allocation limit exceeded!");
        return;
        }

        try {
        await axios.post(
            `${API_BASE}/add-subuser`,
            { username, password },
            auth
        );

        alert("✅ Subuser तयार झाला!");

        setUsername("");
        setPassword("");
        setShowAddModal(false);

        loadStatus();
        loadUsers();
        } catch (err) {
        alert(
            err?.response?.data?.detail ||
            "Server error while creating user"
        );
        }
    };

    const filteredUsers = users.filter((u) =>
        u.Username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const handleDeleteSubuser = async () => {
        if (!selectedUser) return;

        if (!window.confirm(`Delete user ${selectedUser.Username}?`)) return;

        try {
            await axios.delete(
            `${API_BASE}/delete-subuser/${selectedUser.UserID}`,
            auth
            );

            alert("Subuser deleted successfully");

            // refresh list
            loadUsers();

            // close popup
            setSelectedUser(null);
        } catch (err) {
            console.error(err);
            alert(
            err?.response?.data?.detail ||
            "Failed to delete subuser"
            );
        }
    };

    if (loading) {
        return (
        <div
            style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f5f7fb",
            }}
        >
            <p style={{ fontSize: 18, color: "#666" }}>Loading…</p>
        </div>
        );
    }

    return (
        <div
        style={{
            minHeight: "100vh",
            background:
            "linear-gradient(to bottom, #eef2ff, #f0f7ff, #ffffff)",
            padding: 30,
        }}
        >
        <div
            style={{
            maxWidth: 1200,
            margin: "0 auto",
            }}
        >
            {/* HEADER */}
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
                Settings
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

            {/* KPI CARDS */}
            <div
            style={{
                display: "grid",
                gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 15,
                marginBottom: 25,
            }}
            >
            <div
                style={{
                padding: 20,
                borderRadius: 15,
                background: "#fff",
                boxShadow:
                    "0 8px 15px rgba(0,0,0,0.08)",
                }}
            >
                <p style={{ color: "#666", marginBottom: 5 }}>
                Allocated
                </p>
                <p
                style={{ fontSize: 28, fontWeight: 700, color: "#2563eb" }}
                >
                {status.allocated}
                </p>
            </div>

            <div
                style={{
                padding: 20,
                borderRadius: 15,
                background: "#fff",
                boxShadow:
                    "0 8px 15px rgba(0,0,0,0.08)",
                }}
            >
                <p style={{ color: "#666", marginBottom: 5 }}>
                Current Users
                </p>
                <p
                style={{ fontSize: 28, fontWeight: 700, color: "green" }}
                >
                {status.users}
                </p>
            </div>

            <div
                style={{
                padding: 20,
                borderRadius: 15,
                background: "#fff",
                boxShadow:
                    "0 8px 15px rgba(0,0,0,0.08)",
                }}
            >
                <p style={{ color: "#666", marginBottom: 5 }}>
                Remaining
                </p>
                <p
                style={{ fontSize: 28, fontWeight: 700, color: "#7c3aed" }}
                >
                {status.remaining}
                </p>
            </div>
            </div>

            {/* SEARCH + ADD */}
            <div
            style={{
                background: "#fff",
                borderRadius: 15,
                padding: 18,
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 20,
            }}
            >
            <input
                type="text"
                placeholder="🔎 Search subuser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                }}
            />

            <button
                onClick={() => setShowAddModal(true)}
                style={{
                padding: "10px 15px",
                borderRadius: 10,
                border: "none",
                background: "#2563eb",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                }}
            >
                ➕ Add User
            </button>
            </div>

            {/* USERS LIST */}
            <div
            style={{
                background: "#fff",
                borderRadius: 15,
                padding: 18,
            }}
            >
            <h2
                style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 15,
                }}
            >
                Sub Users
            </h2>

            {filteredUsers.length === 0 ? (
                <p
                style={{
                    textAlign: "center",
                    color: "#666",
                    padding: 20,
                }}
                >
                {searchQuery ? "No users found" : "अजून कोणतेही युजर नाहीत"}
                </p>
            ) : (
                <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 12,
                }}
                >
                {filteredUsers.map((u) => (
                    <div
                    key={u.UserID}
                    onClick={() => setSelectedUser(u)}
                    style={{
                        padding: 15,
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        cursor: "pointer",
                    }}
                    >
                    <div
                        style={{
                        display: "flex",
                        justifyContent: "space-between",
                        }}
                    >
                        <h3
                        style={{
                            fontWeight: 700,
                        }}
                        >
                        {u.Username}
                        </h3>

                        <span style={{ fontSize: 11, color: "#666" }}>
                        {new Date(u.CreatedAt).toLocaleDateString()}
                        </span>
                    </div>

                    <p style={{ marginTop: 5, color: "#555" }}>
                        {u.Role}
                    </p>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>

        {/* ADD USER MODAL */}
        {showAddModal && (
            <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 15,
            }}
            >
            <div
                style={{
                background: "#fff",
                borderRadius: 15,
                width: "100%",
                maxWidth: 450,
                }}
            >
                <div
                style={{
                    padding: 15,
                    borderBottom: "1px solid #eee",
                }}
                >
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                    Subuser
                </h3>
                </div>

                <form
                onSubmit={submitUser}
                style={{ padding: 15 }}
                >
                <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Username
                    </label>
                    <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        width: "100%",
                        marginTop: 5,
                        padding: 8,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                    }}
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Password
                    </label>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: "100%",
                        marginTop: 5,
                        padding: 8,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                    }}
                    />
                </div>

                <div
                    style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 10,
                    }}
                >
                    <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                    }}
                    >
                    Cancel
                    </button>

                    <button
                    type="submit"
                    style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 10,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                    }}
                    >
                    Save
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {/* VIEW USER MODAL */}
        {selectedUser && (
            <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 15,
            }}
            >
            <div
                style={{
                background: "#fff",
                borderRadius: 15,
                width: "100%",
                maxWidth: 450,
                }}
            >
                <div
                style={{
                    padding: 18,
                    borderBottom: "1px solid #eee",
                }}
                >
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                    {selectedUser.Username}
                </h3>
                </div>

                <div style={{ padding: 18 }}>
                <p>
                    <strong>Username:</strong> {selectedUser.Username}
                </p>

                <p style={{ marginTop: 10 }}>
                    <strong>Password:</strong> {selectedUser.Password}
                    <span
                    style={{
                        display: "block",
                        fontSize: 11,
                        color: "#777",
                    }}
                    >
                    Password is hidden
                    </span>
                </p>

                <button
                    onClick={() => setSelectedUser(null)}
                    style={{
                    width: "50%",
                    marginTop: 15,
                    padding: 10,
                    borderRadius: 10,
                    background: "#374151",
                    color: "white",
                    border: "none",
                    }}
                >
                    Close
                </button>
                <button
                    style={{
                    width: "49%",
                    marginTop: 15,
                    padding: 10,
                    borderRadius: 10,
                    background: "#f64545ff",
                    color: "white",
                    border: "none",
                    }}
                    onClick={() => handleDeleteSubuser(selectedUser.user_id)}
                >
                    Delete
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}
