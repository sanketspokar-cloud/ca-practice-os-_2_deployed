import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { PriorityDot } from '../components/PriorityDot';
import { getTasks } from '../api';

export const TasksPage = () => {
  const [view, setView] = useState("kanban");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks().then(res => {
      setTasks(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading Tasks...</div>;

  const cols = ["backlog","todo","in_progress","review","done"];
  const colLabels = { backlog:"Backlog", todo:"To Do", in_progress:"In Progress", review:"Review", done:"Done" };
  const colColors = { backlog:"#94A3B8", todo:"#6366F1", in_progress:"#F59E0B", review:"#8B5CF6", done:"#22C55E" };

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#0F172A", margin:0 }}>Task Management</h2>
          <p style={{ fontSize:13, color:"#64748B", margin:"4px 0 0" }}>{tasks.length} tasks · {tasks.filter(t=>t.status==="in_progress").length} in progress</p>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ display:"flex", gap:0, border:"1px solid #E2E8F0", borderRadius:8, overflow:"hidden" }}>
            {["kanban","table"].map(v => (
              <button key={v} onClick={()=>setView(v)}
                style={{ padding:"7px 14px", border:"none", fontSize:12, fontWeight:500, cursor:"pointer", textTransform:"capitalize",
                  background:view===v?"#6366F1":"#fff", color:view===v?"#fff":"#64748B" }}>
                {v==="kanban"?"⊞ Kanban":"≡ Table"}
              </button>
            ))}
          </div>
          <button style={{ display:"flex", alignItems:"center", gap:6, background:"#6366F1", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <Icons.Plus/> New Task
          </button>
        </div>
      </div>

      {view==="kanban" ? (
        <div style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:12 }}>
          {cols.map(col => {
            const colTasks = tasks.filter(t=>t.status===col);
            return (
              <div key={col} style={{ minWidth:240, flex:"0 0 240px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:colColors[col] }}/>
                  <span style={{ fontSize:12, fontWeight:600, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.05em" }}>{colLabels[col]}</span>
                  <span style={{ background:"#F1F5F9", color:"#64748B", fontSize:11, fontWeight:600, padding:"1px 7px", borderRadius:10 }}>{colTasks.length}</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {colTasks.map(t => (
                    <div key={t.id} style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:10, padding:14, cursor:"pointer" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#C7D2FE"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#F1F5F9"}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:10, fontWeight:600, color:colColors[col]||"#94A3B8", background:colColors[col]+"18", padding:"2px 7px", borderRadius:10 }}>{t.type}</span>
                        <PriorityDot priority={t.priority}/>
                      </div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1E293B", lineHeight:1.4, marginBottom:6 }}>{t.title}</div>
                      <div style={{ fontSize:11, color:"#94A3B8", marginBottom:10 }}>{t.client}</div>
                      {t.checklist>0 && (
                        <div style={{ marginBottom:8 }}>
                          <div style={{ background:"#F1F5F9", borderRadius:4, height:4, overflow:"hidden" }}>
                            <div style={{ width:`${(t.done/t.checklist)*100}%`, background:"#6366F1", height:"100%" }}/>
                          </div>
                          <div style={{ fontSize:10, color:"#94A3B8", marginTop:3 }}>{t.done}/{t.checklist} steps</div>
                        </div>
                      )}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <Avatar name={t.assignee} color="#8B5CF6" size={22}/>
                        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:new Date(t.due)<new Date()&&t.status!=="done"?"#EF4444":"#94A3B8" }}>
                          <Icons.Clock/>{t.due}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTasks.length===0 && (
                    <div style={{ border:"2px dashed #F1F5F9", borderRadius:10, padding:"20px 0", textAlign:"center", color:"#CBD5E1", fontSize:12 }}>Drop here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:12, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
                {["Task","Client","Type","Assignee","Priority","Due Date","Status","Progress"].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", color:"#64748B", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} style={{ borderBottom:"1px solid #F8FAFC" }}>
                  <td style={{ padding:"12px 16px", fontWeight:500, color:"#1E293B", maxWidth:200 }}>{t.title}</td>
                  <td style={{ padding:"12px 16px", color:"#64748B", fontSize:12 }}>{t.client}</td>
                  <td style={{ padding:"12px 16px" }}><span style={{ background:"#EEF2FF", color:"#4338CA", padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:600 }}>{t.type}</span></td>
                  <td style={{ padding:"12px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:6 }}><Avatar name={t.assignee} color="#8B5CF6" size={24}/><span style={{ fontSize:12, color:"#64748B" }}>{t.assignee}</span></div></td>
                  <td style={{ padding:"12px 16px" }}><span style={{ display:"flex", alignItems:"center" }}><PriorityDot priority={t.priority}/><span style={{ fontSize:12, color:"#64748B", textTransform:"capitalize" }}>{t.priority}</span></span></td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:new Date(t.due)<new Date()&&t.status!=="done"?"#EF4444":"#64748B" }}>{t.due}</td>
                  <td style={{ padding:"12px 16px" }}><StatusBadge status={t.status}/></td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ background:"#F1F5F9", borderRadius:4, height:6, width:60, overflow:"hidden" }}>
                        <div style={{ width:`${t.checklist>0?(t.done/t.checklist)*100:0}%`, background:"#6366F1", height:"100%" }}/>
                      </div>
                      <span style={{ fontSize:11, color:"#94A3B8" }}>{t.done}/{t.checklist}</span>
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
