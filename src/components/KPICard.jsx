import React from 'react';

export const KPICard = ({ label, value, sub, icon, accent, trend }) => (
  <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, padding:"16px 20px", display:"flex", flexDirection:"column", gap:8 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontSize:12, color:"#64748B", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
      <div style={{ width:32, height:32, borderRadius:8, background:accent+"18", display:"flex", alignItems:"center", justifyContent:"center", color:accent }}>{icon}</div>
    </div>
    <div style={{ fontSize:24, fontWeight:700, color:"#0F172A", lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:trend==="up"?"#22C55E":trend==="down"?"#EF4444":"#94A3B8" }}>{sub}</div>}
  </div>
);
