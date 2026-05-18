import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Icons } from '../components/Icons';
import { KPICard } from '../components/KPICard';
import { Avatar } from '../components/Avatar';
import { getData } from '../api';
import { downloadDashboardPDF } from '../utils/pdf';

const fmt = (n) => "₹" + n.toLocaleString("en-IN");
const fmtL = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : fmt(n);

const COMPLIANCE_PIE = [
  { name:"Done", value:47, color:"#22C55E" },
  { name:"In Progress", value:23, color:"#F59E0B" },
  { name:"Todo", value:19, color:"#6366F1" },
  { name:"Overdue", value:11, color:"#EF4444" },
];

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData().then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  const handleDownloadDashboardSummary = () => {
    if (!data) return;
    const dashboardData = {
      clientsCount: data.clients.length,
      tasksCount: data.tasks.length,
      overdueTasksCount: data.tasks.filter(t => t.status === "todo" || t.status === "backlog").length,
      pendingComplianceCount: data.compliance.filter(c => c.status !== "done").length,
      totalOutstanding: 428300,
      totalRevenue: data.revenue.reduce((acc, curr) => acc + curr.invoiced, 0),
      team: data.team
    };
    downloadDashboardPDF(dashboardData);
  };

  if (loading) return <div style={{ padding: 40 }}>Loading Dashboard...</div>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:"#1E293B", border:"1px solid #334155", borderRadius:8, padding:"10px 14px" }}>
        <div style={{ color:"#94A3B8", fontSize:11, marginBottom:6 }}>{label}</div>
        {payload.map((p,i) => (
          <div key={i} style={{ color:p.color, fontSize:12, marginBottom:2 }}>
            {p.name}: {fmtL(p.value)}
          </div>
        ))}
      </div>
    );
  };

  const alerts = [
    { type:"overdue", msg:"GSTR-3B for Kapoor Infra overdue — due 20 May", level:"error" },
    { type:"due", msg:"TDS Return Q4 due in 5 days for 3 clients", level:"warning" },
    { type:"payment", msg:"₹1,18,000 payment pending from Kapoor Infrastructure", level:"warning" },
    { type:"info", msg:"5 ITRs due 31st July — schedule preparation now", level:"info" },
  ];

  const recentActivity = [
    { action:"Invoice #INV/2425/0089 marked paid", user:"Priya Sharma", time:"2h ago", icon:"💰" },
    { action:"GSTR-1 filed for TechForge Solutions LLP", user:"Priya Sharma", time:"4h ago", icon:"✅" },
    { action:"New client Patel Agro Exports onboarded", user:"Rajesh Kumar", time:"Yesterday", icon:"👤" },
    { action:"ROC Annual Return moved to review", user:"Rahul Verma", time:"Yesterday", icon:"📋" },
    { action:"₹47,200 invoice sent to TechForge", user:"Anjali Mehta", time:"2d ago", icon:"📧" },
  ];

  return (
    <div style={{ padding:"28px 32px", maxWidth:1200 }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Dashboard</h2>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Practice management, statistics, and billing overview.</p>
        </div>
        <button onClick={handleDownloadDashboardSummary} style={{
          display: "flex", alignItems: "center", gap: 8, background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 4px rgba(99,102,241,0.1)"
        }}>
          <Icons.Download /> Download PDF Summary
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:24 }}>
        <KPICard label="Active Clients" value={data.clients.length} sub="↑ 1 new this month" icon={<Icons.Users/>} accent="#6366F1" trend="up"/>
        <KPICard label="Tasks Due Today" value="3" sub="8 overdue · 2 urgent" icon={<Icons.Tasks/>} accent="#F59E0B" trend="down"/>
        <KPICard label="Outstanding" value={fmtL(428300)} sub="₹1.18L overdue" icon={<Icons.DollarSign/>} accent="#EF4444" trend="down"/>
        <KPICard label="Collected — May" value={fmtL(120000)} sub="↑ Target: ₹4L" icon={<Icons.TrendUp/>} accent="#22C55E" trend="up"/>
      </div>

      {/* Alerts */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {alerts.map((a,i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12, padding:"10px 16px",
              background: a.level==="error"?"#FEF2F2": a.level==="warning"?"#FFFBEB":"#EFF6FF",
              border:`1px solid ${a.level==="error"?"#FECACA":a.level==="warning"?"#FDE68A":"#BFDBFE"}`,
              borderRadius:8,
            }}>
              <span style={{ fontSize:14, color:a.level==="error"?"#DC2626":a.level==="warning"?"#D97706":"#2563EB" }}>
                {a.level==="error"?"⚠":a.level==="warning"?"⏰":"ℹ"}
              </span>
              <span style={{ fontSize:13, color:"#1E293B", flex:1 }}>{a.msg}</span>
              <span style={{ fontSize:11, color:"#94A3B8", cursor:"pointer" }}>Dismiss</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        {/* Revenue Chart */}
        <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, padding:"20px 20px 12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color:"#0F172A" }}>Revenue Trend (12 months)</div>
              <div style={{ fontSize:12, color:"#94A3B8" }}>Invoiced vs Collected</div>
            </div>
            <div style={{ display:"flex", gap:16, fontSize:11 }}>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:12, height:3, background:"#6366F1", display:"inline-block", borderRadius:2 }}/> Invoiced</span>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:12, height:3, background:"#22C55E", display:"inline-block", borderRadius:2 }}/> Collected</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenue} margin={{ top:5, right:10, bottom:0, left:10 }}>
              <defs>
                <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gCol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/100000}L`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="#6366F1" strokeWidth={2} fill="url(#gInv)"/>
              <Area type="monotone" dataKey="collected" name="Collected" stroke="#22C55E" strokeWidth={2} fill="url(#gCol)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Status */}
        <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:4 }}>Compliance Health</div>
          <div style={{ fontSize:12, color:"#94A3B8", marginBottom:12 }}>100 tasks this month</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={COMPLIANCE_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                {COMPLIANCE_PIE.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={(v)=>`${v}%`}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:8 }}>
            {COMPLIANCE_PIE.map(e => (
              <div key={e.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:e.color, flexShrink:0 }}/>
                <span style={{ color:"#64748B" }}>{e.name}</span>
                <span style={{ color:"#0F172A", fontWeight:600, marginLeft:"auto" }}>{e.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Team Productivity */}
        <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:16 }}>Team Workload</div>
          {data.team.map(m => (
            <div key={m.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <Avatar name={m.name} color={m.color} size={32}/>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:"#1E293B" }}>{m.name}</span>
                  <span style={{ fontSize:11, color:"#94A3B8" }}>{m.done}/{m.tasks} done</span>
                </div>
                <div style={{ background:"#F1F5F9", borderRadius:4, height:6, overflow:"hidden" }}>
                  <div style={{ width:`${(m.done/m.tasks)*100}%`, background:m.color, height:"100%", borderRadius:4 }}/>
                </div>
              </div>
              <span style={{ fontSize:11, color:"#94A3B8", minWidth:50, textAlign:"right" }}>{m.hours}h</span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:16 }}>Recent Activity</div>
          {recentActivity.map((a,i) => (
            <div key={i} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:18, lineHeight:1, marginTop:1 }}>{a.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"#1E293B", lineHeight:1.4 }}>{a.action}</div>
                <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{a.user} · {a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
