import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { getCompliance } from '../api';

export const CompliancePage = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompliance().then(res => {
      setCompliance(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading Compliance...</div>;

  const types = ["all","GST","TDS","ITR","ADV TAX","ROC","PF"];
  const filtered = typeFilter==="all" ? compliance : compliance.filter(c=>c.type===typeFilter);

  const summary = [
    { label:"Total Pending", value:compliance.filter(c=>c.status!=="done").length, color:"#6366F1" },
    { label:"Overdue", value:2, color:"#EF4444" },
    { label:"Due This Week", value:3, color:"#F59E0B" },
    { label:"Filed This Month", value:compliance.filter(c=>c.status==="done").length, color:"#22C55E" },
  ];

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#0F172A", margin:0 }}>Compliance Engine</h2>
          <p style={{ fontSize:13, color:"#64748B", margin:"4px 0 0" }}>Auto-tracked filing deadlines for all clients</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:6, background:"#6366F1", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          <Icons.Plus/> Add Manual Task
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {summary.map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:"#94A3B8", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {types.map(t => (
          <button key={t} onClick={()=>setTypeFilter(t)}
            style={{ padding:"6px 14px", borderRadius:20, border:"1px solid", fontSize:12, fontWeight:500, cursor:"pointer", textTransform:"uppercase",
              background:typeFilter===t?"#6366F1":"#fff", color:typeFilter===t?"#fff":"#64748B", borderColor:typeFilter===t?"#6366F1":"#E2E8F0" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
              {["Type","Client","Filing","Period","Due Date","Assignee","Status","Actions"].map(h => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", color:"#64748B", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const isOverdue = new Date(c.due)<new Date() && c.status!=="done";
              return (
                <tr key={c.id} style={{ borderBottom:"1px solid #F8FAFC", background:isOverdue?"#FFF7F7":"transparent" }}>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{
                      padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:700, textTransform:"uppercase",
                      background: c.type==="GST"?"#EEF2FF":c.type==="TDS"?"#FEF3C7":c.type==="ROC"?"#FDF2F8":c.type==="PF"?"#F0FDF4":"#F8FAFC",
                      color: c.type==="GST"?"#4338CA":c.type==="TDS"?"#92400E":c.type==="ROC"?"#9D174D":c.type==="PF"?"#15803D":"#64748B",
                    }}>{c.type}</span>
                  </td>
                  <td style={{ padding:"12px 16px", color:"#1E293B", fontWeight:500 }}>{c.client}</td>
                  <td style={{ padding:"12px 16px", color:"#64748B" }}>{c.task}</td>
                  <td style={{ padding:"12px 16px", color:"#64748B" }}>{c.period}</td>
                  <td style={{ padding:"12px 16px", color:isOverdue?"#EF4444":"#64748B", fontWeight:isOverdue?600:400 }}>
                    {isOverdue && "⚠ "}{c.due}
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <Avatar name={c.assignee} color="#8B5CF6" size={26}/>
                  </td>
                  <td style={{ padding:"12px 16px" }}><StatusBadge status={c.status}/></td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      {c.status==="done" ? (
                        <button style={{ fontSize:11, color:"#22C55E", background:"#D1FAE5", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontWeight:600 }}>✓ Filed</button>
                      ) : (
                        <button style={{ fontSize:11, color:"#6366F1", background:"#EEF2FF", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontWeight:600 }}>Mark Filed</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
