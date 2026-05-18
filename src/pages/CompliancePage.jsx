import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { getCompliance, createCompliance, updateCompliance, removeCompliance, getClients } from '../api';
import { downloadSinglePDF } from '../utils/pdf';

export const CompliancePage = ({ adminAuth }) => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [compliance, setCompliance] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "view" | "edit"
  const [newComp, setNewComp] = useState({
    type: "GST",
    client: "",
    task: "",
    period: "Apr 2025",
    due: "",
    status: "todo",
    assignee: "PS"
  });

  const fetchData = async () => {
    try {
      const [compRes, clientsRes] = await Promise.all([getCompliance(), getClients()]);
      setCompliance(compRes.data);
      setClients(clientsRes.data);
      setNewComp(prev => ({ ...prev, client: clientsRes.data[0]?.name || "" }));
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setNewComp({
      type: "GST",
      client: clients[0]?.name || "",
      task: "",
      period: "Apr 2025",
      due: "",
      status: "todo",
      assignee: "PS"
    });
  };

  const handleAddClick = () => {
    setModalMode("add");
    resetForm();
    setShowModal(true);
  };

  const handleEyeClick = (e, item) => {
    e.stopPropagation();
    setNewComp(item);
    setModalMode(adminAuth ? "edit" : "view");
    setShowModal(true);
  };

  const handleDownloadPDFClick = (e, item) => {
    e.stopPropagation();
    downloadSinglePDF("compliance", item);
  };

  const handleDeleteCompliance = async (e, compId) => {
    e.stopPropagation();
    if (!adminAuth) {
      alert("Unauthorized action. Please log in as admin.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this compliance task?")) {
      try {
        await removeCompliance(compId);
        setCompliance(compliance.filter(c => c.id !== compId));
      } catch (err) {
        console.error(err);
        alert("Failed to delete compliance task");
      }
    }
  };

  const handleSaveCompliance = async (e) => {
    e.preventDefault();
    if (!adminAuth) {
      alert("Unauthorized action. Please log in as admin.");
      return;
    }
    try {
      if (modalMode === "edit") {
        const res = await updateCompliance(newComp);
        setCompliance(compliance.map(c => c.id === newComp.id ? res.data.compliance : c));
      } else {
        const res = await createCompliance(newComp);
        setCompliance([...compliance, res.data.compliance]);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${modalMode === "edit" ? "update" : "add"} compliance task`);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading Compliance...</div>;

  const types = ["all", "GST", "TDS", "ITR", "ADV TAX", "ROC", "PF"];
  const filtered = typeFilter === "all" ? compliance : compliance.filter(c => c.type === typeFilter);

  const summary = [
    { label: "Total Pending", value: compliance.filter(c => c.status !== "done").length, color: "#6366F1" },
    { label: "Overdue", value: compliance.filter(c => new Date(c.due) < new Date() && c.status !== "done").length, color: "#EF4444" },
    { label: "Due Soon", value: compliance.filter(c => c.status === "in_progress").length, color: "#F59E0B" },
    { label: "Filed This Month", value: compliance.filter(c => c.status === "done").length, color: "#22C55E" },
  ];

  return (
    <div style={{ padding: "28px 32px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Compliance Engine</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Auto-tracked filing deadlines for all clients</p>
        </div>
        {adminAuth && (
          <button onClick={handleAddClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Icons.Plus /> Add Manual Task
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {summary.map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "uppercase",
              background: typeFilter === t ? "#6366F1" : "#fff", color: typeFilter === t ? "#fff" : "#64748B", borderColor: typeFilter === t ? "#6366F1" : "#E2E8F0"
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
              {["Type", "Client", "Filing", "Period", "Due Date", "Assignee", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748B", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const isOverdue = new Date(c.due) < new Date() && c.status !== "done";
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #F8FAFC", background: isOverdue ? "#FFF7F7" : "transparent" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      background: c.type === "GST" ? "#EEF2FF" : c.type === "TDS" ? "#FEF3C7" : c.type === "ROC" ? "#FDF2F8" : c.type === "PF" ? "#F0FDF4" : "#F8FAFC",
                      color: c.type === "GST" ? "#4338CA" : c.type === "TDS" ? "#92400E" : c.type === "ROC" ? "#9D174D" : c.type === "PF" ? "#15803D" : "#64748B",
                    }}>{c.type}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 500 }}>{c.client}</td>
                  <td style={{ padding: "12px 16px", color: "#64748B" }}>{c.task}</td>
                  <td style={{ padding: "12px 16px", color: "#64748B" }}>{c.period}</td>
                  <td style={{ padding: "12px 16px", color: isOverdue ? "#EF4444" : "#64748B", fontWeight: isOverdue ? 600 : 400 }}>
                    {isOverdue && "⚠ "}{c.due}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Avatar name={c.assignee} color="#8B5CF6" size={26} />
                  </td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={(e) => handleEyeClick(e, c)} title={adminAuth ? "Edit Task" : "View Task"} style={{ background: "none", border: "none", cursor: "pointer", color: "#6366F1", padding: 0 }}><Icons.Eye /></button>
                      <button onClick={(e) => handleDownloadPDFClick(e, c)} title="Download PDF Summary" style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 0 }}><Icons.Download /></button>
                      {adminAuth && (
                        <button onClick={(e) => handleDeleteCompliance(e, c.id)} title="Delete Task" style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 0 }}>
                          <Icons.Trash />
                        </button>
                      )}
                      {c.status !== "done" && (
                        <button style={{ fontSize: 11, color: "#6366F1", background: "#EEF2FF", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>Mark Filed</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>No compliance entries found</div>
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
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>
                {modalMode === "view" ? "View Compliance Task" : modalMode === "edit" ? "Edit Compliance Task" : "Add Compliance Task"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748B" }}>&times;</button>
            </div>
            <form onSubmit={handleSaveCompliance}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Client</label>
                <input type="text" value={newComp.client} onChange={e => setNewComp({ ...newComp, client: e.target.value })} required placeholder="Client Name" disabled={modalMode === "view"}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Filing Type</label>
                  <input type="text" value={newComp.type} onChange={e => setNewComp({ ...newComp, type: e.target.value })} required placeholder="e.g. GST, TDS, PF" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Filing Name (Task)</label>
                  <input type="text" value={newComp.task} onChange={e => setNewComp({ ...newComp, task: e.target.value })} required placeholder="e.g. GSTR-3B" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Filing Period</label>
                  <input type="text" value={newComp.period} onChange={e => setNewComp({ ...newComp, period: e.target.value })} required placeholder="e.g. Q4 FY25" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Due Date</label>
                  <input type="date" value={newComp.due} onChange={e => setNewComp({ ...newComp, due: e.target.value })} required disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Assignee Initials</label>
                  <input type="text" value={newComp.assignee} onChange={e => setNewComp({ ...newComp, assignee: e.target.value })} required placeholder="e.g. PS, RV, AS" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Status</label>
                  <input type="text" value={newComp.status} onChange={e => setNewComp({ ...newComp, status: e.target.value })} required placeholder="e.g. todo, done" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", border: "1px solid #E2E8F0", borderRadius: 6, background: "none", cursor: "pointer", color: "#64748B" }}>
                  {modalMode === "view" ? "Close" : "Cancel"}
                </button>
                {modalMode !== "view" && (
                  <button type="submit" style={{ padding: "8px 20px", border: "none", borderRadius: 6, background: "#6366F1", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                    {modalMode === "edit" ? "Save Changes" : "Save Task"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
