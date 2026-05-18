import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { getClients, createClient } from '../api';

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

export const ClientsPage = ({ onClientClick }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    code: "",
    entity: "Private Limited",
    gstin: "",
    pan: "",
    status: "active",
    partner: "Rajesh Kumar",
    outstanding: 0,
    tasksDue: 0,
    industry: "",
    email: "",
    phone: "",
    assigned: "Priya Sharma"
  });

  const fetchClients = () => {
    getClients().then(res => {
      setClients(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSaveClient = async (e) => {
    e.preventDefault();
    try {
      const res = await createClient(newClient);
      setClients([...clients, res.data.client]);
      setShowModal(false);
      setNewClient({
        name: "",
        code: "",
        entity: "Private Limited",
        gstin: "",
        pan: "",
        status: "active",
        partner: "Rajesh Kumar",
        outstanding: 0,
        tasksDue: 0,
        industry: "",
        email: "",
        phone: "",
        assigned: "Priya Sharma"
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add client");
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading Clients...</div>;

  const filtered = clients.filter(c =>
    (filter === "all" || c.status === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.gstin || "").includes(search) || (c.pan || "").includes(search))
  );

  return (
    <div style={{ padding: "28px 32px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Clients</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>{clients.length} total clients · {clients.filter(c => c.status === "active").length} active</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Icons.Plus /> Add Client
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}><Icons.Search /></span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, PAN, GSTIN..."
            style={{ width: "100%", paddingLeft: 36, padding: "9px 12px 9px 36px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1E293B", outline: "none", boxSizing: "border-box" }} />
        </div>
        {["all", "active", "inactive", "prospect"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize",
              background: filter === f ? "#6366F1" : "#fff", color: filter === f ? "#fff" : "#64748B", borderColor: filter === f ? "#6366F1" : "#E2E8F0"
            }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
              {["Client", "Code", "Entity", "Status", "Assigned To", "Outstanding", "Tasks", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748B", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid #F8FAFC", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => onClientClick(c)}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 600, color: "#0F172A" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.email}</div>
                </td>
                <td style={{ padding: "12px 16px", color: "#64748B", fontFamily: "monospace" }}>{c.code}</td>
                <td style={{ padding: "12px 16px", color: "#64748B" }}>{c.entity}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={c.status} /></td>
                <td style={{ padding: "12px 16px", color: "#64748B" }}>{c.assigned}</td>
                <td style={{ padding: "12px 16px", fontWeight: c.outstanding > 0 ? 600 : 400, color: c.outstanding > 0 ? "#EF4444" : "#22C55E" }}>
                  {c.outstanding > 0 ? fmt(c.outstanding) : "—"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {c.tasksDue > 0 ? <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{c.tasksDue} due</span> : <span style={{ color: "#94A3B8" }}>—</span>}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}><Icons.Eye /></button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}><Icons.Edit /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>No clients found</div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #E2E8F0",
            width: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Add New Client</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748B" }}>&times;</button>
            </div>
            <form onSubmit={handleSaveClient}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Client Name</label>
                <input type="text" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Client Code</label>
                  <input type="text" value={newClient.code} onChange={e => setNewClient({ ...newClient, code: e.target.value })} required placeholder="CLT-0008"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Entity Type</label>
                  <select value={newClient.entity} onChange={e => setNewClient({ ...newClient, entity: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                    {["Private Limited", "Public Limited", "LLP", "Partnership", "Proprietorship", "HUF"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>PAN</label>
                  <input type="text" value={newClient.pan} onChange={e => setNewClient({ ...newClient, pan: e.target.value })} required
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>GSTIN (Optional)</label>
                  <input type="text" value={newClient.gstin} onChange={e => setNewClient({ ...newClient, gstin: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Industry</label>
                  <input type="text" value={newClient.industry} onChange={e => setNewClient({ ...newClient, industry: e.target.value })} required
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Assigned Manager</label>
                  <select value={newClient.assigned} onChange={e => setNewClient({ ...newClient, assigned: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                    {["Priya Sharma", "Rahul Verma", "Amit Singh", "Divya Patel"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Email</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} required
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Phone</label>
                  <input type="text" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} required
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", border: "1px solid #E2E8F0", borderRadius: 6, background: "none", cursor: "pointer", color: "#64748B" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", border: "none", borderRadius: 6, background: "#6366F1", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
