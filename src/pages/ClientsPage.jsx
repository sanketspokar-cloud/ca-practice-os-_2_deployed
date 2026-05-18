import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { getClients } from '../api';

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

export const ClientsPage = ({ onClientClick }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients().then(res => {
      setClients(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading Clients...</div>;

  const filtered = clients.filter(c =>
    (filter==="all" || c.status===filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     (c.gstin||"").includes(search) || (c.pan||"").includes(search))
  );

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#0F172A", margin:0 }}>Clients</h2>
          <p style={{ fontSize:13, color:"#64748B", margin:"4px 0 0" }}>{clients.length} total clients · {clients.filter(c=>c.status==="active").length} active</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:6, background:"#6366F1", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          <Icons.Plus/> Add Client
        </button>
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        <div style={{ flex:1, position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}><Icons.Search/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name, PAN, GSTIN..."
            style={{ width:"100%", paddingLeft:36, padding:"9px 12px 9px 36px", border:"1px solid #E2E8F0", borderRadius:8, fontSize:13, color:"#1E293B", outline:"none", boxSizing:"border-box" }}/>
        </div>
        {["all","active","inactive","prospect"].map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"8px 16px", borderRadius:8, border:"1px solid", fontSize:12, fontWeight:500, cursor:"pointer", textTransform:"capitalize",
              background:filter===f?"#6366F1":"#fff", color:filter===f?"#fff":"#64748B", borderColor:filter===f?"#6366F1":"#E2E8F0" }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
              {["Client","Code","Entity","Status","Assigned To","Outstanding","Tasks","Actions"].map(h => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", color:"#64748B", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom:"1px solid #F8FAFC", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>onClientClick(c)}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ fontWeight:600, color:"#0F172A" }}>{c.name}</div>
                  <div style={{ fontSize:11, color:"#94A3B8" }}>{c.email}</div>
                </td>
                <td style={{ padding:"12px 16px", color:"#64748B", fontFamily:"monospace" }}>{c.code}</td>
                <td style={{ padding:"12px 16px", color:"#64748B" }}>{c.entity}</td>
                <td style={{ padding:"12px 16px" }}><StatusBadge status={c.status}/></td>
                <td style={{ padding:"12px 16px", color:"#64748B" }}>{c.assigned}</td>
                <td style={{ padding:"12px 16px", fontWeight:c.outstanding>0?600:400, color:c.outstanding>0?"#EF4444":"#22C55E" }}>
                  {c.outstanding>0?fmt(c.outstanding):"—"}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  {c.tasksDue>0 ? <span style={{ background:"#FEF3C7", color:"#92400E", padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600 }}>{c.tasksDue} due</span> : <span style={{ color:"#94A3B8" }}>—</span>}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", gap:8 }}>
                    <button style={{ background:"none", border:"none", cursor:"pointer", color:"#94A3B8", padding:4 }}><Icons.Eye/></button>
                    <button style={{ background:"none", border:"none", cursor:"pointer", color:"#94A3B8", padding:4 }}><Icons.Edit/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && (
          <div style={{ textAlign:"center", padding:"40px 0", color:"#94A3B8" }}>No clients found</div>
        )}
      </div>
    </div>
  );
};
