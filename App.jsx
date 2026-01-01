import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Dashboard from "./dashboard";
import Survey from "./survey";
import Settings from "./settings";
import List from "./list";

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/survey" element={<Survey />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/list" element={<List />} />
            </Routes>
        </HashRouter>
    );
}
export default App;