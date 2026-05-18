import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { getInvoices } from '../api';

const fmt = (n) => "₹" + n.toLocaleString("en-IN");
const fmtL = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : fmt(n);

export const BillingPage = () => {
  const [tab, setTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoices().then(res => {
      setInvoices(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading Billing...</div>;

  const total = invoices.reduce((s,i)=>s+i.amount,0);
  const outstanding = invoices.reduce((s,i)=>s+(i.amount-i.paid),0);
  const overdue = invoices.filter(i=>i.status==="overdue").reduce((s,i)=>s+i.amount,0);

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#0F172A", margin:0 }}>Billing & Collections</h2>
          <p style={{ fontSize:13, color:"#64748B", margin:"4px 0 0" }}>GST-compliant invoicing and payment tracking</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:6, background:"#6366F1", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          <Icons.Plus/> New Invoice
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        <KPICard label="Invoiced (May)" value={fmtL(total)} sub={`${invoices.length} invoices`} icon={<Icons.FileText/>} accent="#6366F1"/>
        <KPICard label="Outstanding" value={fmtL(outstanding)} sub="Pending invoices" icon={<Icons.Clock/>} accent="#F59E0B"/>
        <KPICard label="Overdue" value={fmtL(overdue)} sub="Action required" icon={<Icons.AlertCircle/>} accent="#EF4444" trend="down"/>
        <KPICard label="Collected (May)" value={fmtL(35400)} sub="↑ 1 payment received" icon={<Icons.Check/>} accent="#22C55E" trend="up"/>
      </div>

      <div style={{ display:"flex", gap:0, border:"1px solid #E2E8F0", borderRadius:8, overflow:"hidden", marginBottom:20, width:"fit-content" }}>
        {["invoices","outstanding","proposals"].map(t => (
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:"8px 20px", border:"none", fontSize:13, fontWeight:500, cursor:"pointer", textTransform:"capitalize",
              background:tab===t?"#6366F1":"#fff", color:tab===t?"#fff":"#64748B" }}>
            {t==="outstanding"?"Outstanding Report":t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab==="invoices" && (
        <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
                {["Invoice No","Client","Date","Due Date","Amount","Paid","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", color:"#64748B", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom:"1px solid #F8FAFC" }}>
                  <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:12, color:"#6366F1", fontWeight:600 }}>{inv.no}</td>
                  <td style={{ padding:"12px 16px", color:"#1E293B", fontWeight:500 }}>{inv.client}</td>
                  <td style={{ padding:"12px 16px", color:"#64748B" }}>{inv.date}</td>
                  <td style={{ padding:"12px 16px", color:inv.status==="overdue"?"#EF4444":"#64748B" }}>{inv.due}</td>
                  <td style={{ padding:"12px 16px", fontWeight:600, color:"#1E293B" }}>{fmt(inv.amount)}</td>
                  <td style={{ padding:"12px 16px", color:inv.paid===inv.amount?"#22C55E":inv.paid>0?"#F59E0B":"#94A3B8" }}>
                    {inv.paid>0?fmt(inv.paid):"—"}
                  </td>
                  <td style={{ padding:"12px 16px" }}><StatusBadge status={inv.status}/></td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <button style={{ background:"none", border:"none", cursor:"pointer", color:"#94A3B8" }}><Icons.Eye/></button>
                      <button style={{ background:"none", border:"none", cursor:"pointer", color:"#94A3B8" }}><Icons.Download/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
