import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { getInvoices, createInvoice, updateInvoice, getClients } from '../api';
import { downloadSinglePDF } from '../utils/pdf';

const fmt = (n) => "₹" + n.toLocaleString("en-IN");
const fmtL = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : fmt(n);

export const BillingPage = ({ adminAuth }) => {
  const [tab, setTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "view" | "edit"
  const [newInvoice, setNewInvoice] = useState({
    no: "",
    client: "",
    date: "",
    due: "",
    amount: 0,
    paid: 0,
    status: "draft"
  });

  const fetchData = async () => {
    try {
      const [invRes, clientsRes] = await Promise.all([getInvoices(), getClients()]);
      setInvoices(invRes.data);
      setClients(clientsRes.data);
      setNewInvoice(prev => ({ ...prev, client: clientsRes.data[0]?.name || "" }));
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setNewInvoice({
      no: "",
      client: clients[0]?.name || "",
      date: "",
      due: "",
      amount: 0,
      paid: 0,
      status: "draft"
    });
  };

  const handleAddClick = () => {
    setModalMode("add");
    resetForm();
    setShowModal(true);
  };

  const handleEyeClick = (e, invoice) => {
    e.stopPropagation();
    setNewInvoice(invoice);
    setModalMode(adminAuth ? "edit" : "view");
    setShowModal(true);
  };

  const handleDownloadPDFClick = (e, invoice) => {
    e.stopPropagation();
    downloadSinglePDF("invoice", invoice);
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!adminAuth) {
      alert("Unauthorized action. Please log in as admin.");
      return;
    }
    try {
      if (modalMode === "edit") {
        const res = await updateInvoice(newInvoice, adminAuth.email, adminAuth.password);
        setInvoices(invoices.map(i => i.id === newInvoice.id ? res.data.invoice : i));
      } else {
        const res = await createInvoice(newInvoice, adminAuth.email, adminAuth.password);
        setInvoices([...invoices, res.data.invoice]);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${modalMode === "edit" ? "update" : "create"} invoice`);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading Billing...</div>;

  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.reduce((s, i) => s + (i.amount - i.paid), 0);
  const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const collected = invoices.reduce((s, i) => s + i.paid, 0);

  return (
    <div style={{ padding: "28px 32px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Billing & Collections</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>GST-compliant invoicing and payment tracking</p>
        </div>
        {adminAuth && (
          <button onClick={handleAddClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Icons.Plus /> New Invoice
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <KPICard label="Invoiced (Total)" value={fmtL(total)} sub={`${invoices.length} invoices`} icon={<Icons.FileText />} accent="#6366F1" />
        <KPICard label="Outstanding" value={fmtL(outstanding)} sub="Pending invoices" icon={<Icons.Clock />} accent="#F59E0B" />
        <KPICard label="Overdue" value={fmtL(overdue)} sub="Action required" icon={<Icons.AlertCircle />} accent="#EF4444" trend="down" />
        <KPICard label="Collected (Total)" value={fmtL(collected)} sub={`${invoices.filter(i => i.status === "paid").length} paid`} icon={<Icons.Check />} accent="#22C55E" trend="up" />
      </div>

      <div style={{ display: "flex", gap: 0, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden", marginBottom: 20, width: "fit-content" }}>
        {["invoices", "outstanding", "proposals"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "8px 20px", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", textTransform: "capitalize",
              background: tab === t ? "#6366F1" : "#fff", color: tab === t ? "#fff" : "#64748B"
            }}>
            {t === "outstanding" ? "Outstanding Report" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "invoices" && (
        <div style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                {["Invoice No", "Client", "Date", "Due Date", "Amount", "Paid", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748B", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#6366F1", fontWeight: 600 }}>{inv.no}</td>
                  <td style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 500 }}>{inv.client}</td>
                  <td style={{ padding: "12px 16px", color: "#64748B" }}>{inv.date}</td>
                  <td style={{ padding: "12px 16px", color: inv.status === "overdue" ? "#EF4444" : "#64748B" }}>{inv.due}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1E293B" }}>{fmt(inv.amount)}</td>
                  <td style={{ padding: "12px 16px", color: inv.paid === inv.amount ? "#22C55E" : inv.paid > 0 ? "#F59E0B" : "#94A3B8" }}>
                    {inv.paid > 0 ? fmt(inv.paid) : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={inv.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={(e) => handleEyeClick(e, inv)} title={adminAuth ? "Edit Invoice" : "View Invoice"} style={{ background: "none", border: "none", cursor: "pointer", color: "#6366F1" }}><Icons.Eye /></button>
                      <button onClick={(e) => handleDownloadPDFClick(e, inv)} title="Download PDF Summary" style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><Icons.Download /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                {modalMode === "view" ? "View Invoice Details" : modalMode === "edit" ? "Edit Invoice Details" : "Create New Invoice"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748B" }}>&times;</button>
            </div>
            <form onSubmit={handleSaveInvoice}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Invoice No</label>
                  <input type="text" value={newInvoice.no} onChange={e => setNewInvoice({ ...newInvoice, no: e.target.value })} required placeholder="e.g. INV/2425/0094" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Client</label>
                  <input type="text" value={newInvoice.client} onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })} required placeholder="Client Name" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Invoice Date</label>
                  <input type="date" value={newInvoice.date} onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })} required disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Due Date</label>
                  <input type="date" value={newInvoice.due} onChange={e => setNewInvoice({ ...newInvoice, due: e.target.value })} required disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Amount (₹)</label>
                  <input type="number" value={newInvoice.amount} onChange={e => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) || 0 })} required min="0" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Paid Amount (₹)</label>
                  <input type="number" value={newInvoice.paid} onChange={e => setNewInvoice({ ...newInvoice, paid: parseFloat(e.target.value) || 0 })} required min="0" disabled={modalMode === "view"}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Status</label>
                <input type="text" value={newInvoice.status} onChange={e => setNewInvoice({ ...newInvoice, status: e.target.value })} required placeholder="e.g. draft, sent, paid, overdue" disabled={modalMode === "view"}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", border: "1px solid #E2E8F0", borderRadius: 6, background: "none", cursor: "pointer", color: "#64748B" }}>
                  {modalMode === "view" ? "Close" : "Cancel"}
                </button>
                {modalMode !== "view" && (
                  <button type="submit" style={{ padding: "8px 20px", border: "none", borderRadius: 6, background: "#6366F1", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                    {modalMode === "edit" ? "Save Changes" : "Save Invoice"}
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
