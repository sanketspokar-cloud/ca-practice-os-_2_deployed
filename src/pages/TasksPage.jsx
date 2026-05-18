import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { PriorityDot } from '../components/PriorityDot';
import { getTasks, createTask, getClients } from '../api';

export const TasksPage = () => {
  const [view, setView] = useState("kanban");
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    client: "",
    status: "todo",
    priority: "medium",
    due: "",
    assignee: "Priya Sharma",
    type: "GST",
    checklist: 5,
    done: 0
  });

  const fetchData = async () => {
    try {
      const [tasksRes, clientsRes] = await Promise.all([getTasks(), getClients()]);
      setTasks(tasksRes.data);
      setClients(clientsRes.data);
      if (clientsRes.data.length > 0) {
        setNewTask(prev => ({ ...prev, client: clientsRes.data[0].name }));
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      const res = await createTask(newTask);
      setTasks([...tasks, res.data.task]);
      setShowModal(false);
      setNewTask({
        title: "",
        client: clients[0]?.name || "",
        status: "todo",
        priority: "medium",
        due: "",
        assignee: "Priya Sharma",
        type: "GST",
        checklist: 5,
        done: 0
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading Tasks...</div>;

  const cols = ["backlog", "todo", "in_progress", "review", "done"];
  const colLabels = { backlog: "Backlog", todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };
  const colColors = { backlog: "#94A3B8", todo: "#6366F1", in_progress: "#F59E0B", review: "#8B5CF6", done: "#22C55E" };

  return (
    <div style={{ padding: "28px 32px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Task Management</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>{tasks.length} tasks · {tasks.filter(t => t.status === "in_progress").length} in progress</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 0, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
            {["kanban", "table"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: "7px 14px", border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize",
                  background: view === v ? "#6366F1" : "#fff", color: view === v ? "#fff" : "#64748B"
                }}>
                {v === "kanban" ? "⊞ Kanban" : "≡ Table"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Icons.Plus /> New Task
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 12 }}>
          {cols.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} style={{ minWidth: 240, flex: "0 0 240px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: colColors[col] }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{colLabels[col]}</span>
                  <span style={{ background: "#F1F5F9", color: "#64748B", fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 10 }}>{colTasks.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {colTasks.map(t => (
                    <div key={t.id} style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 10, padding: 14, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#C7D2FE"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#F1F5F9"}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: colColors[col] || "#94A3B8", background: colColors[col] + "18", padding: "2px 7px", borderRadius: 10 }}>{t.type}</span>
                        <PriorityDot priority={t.priority} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", lineHeight: 1.4, marginBottom: 6 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10 }}>{t.client}</div>
                      {t.checklist > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ background: "#F1F5F9", borderRadius: 4, height: 4, overflow: "hidden" }}>
                            <div style={{ width: `${(t.done / t.checklist) * 100}%`, background: "#6366F1", height: "100%" }} />
                          </div>
                          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>{t.done}/{t.checklist} steps</div>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Avatar name={t.assignee} color="#8B5CF6" size={22} />
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: new Date(t.due) < new Date() && t.status !== "done" ? "#EF4444" : "#94A3B8" }}>
                          <Icons.Clock />{t.due}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div style={{ border: "2px dashed #F1F5F9", borderRadius: 10, padding: "20px 0", textAlign: "center", color: "#CBD5E1", fontSize: 12 }}>Drop here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                {["Task", "Client", "Type", "Assignee", "Priority", "Due Date", "Status", "Progress"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748B", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "#1E293B", maxWidth: 200 }}>{t.title}</td>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 12 }}>{t.client}</td>
                  <td style={{ padding: "12px 16px" }}><span style={{ background: "#EEF2FF", color: "#4338CA", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t.type}</span></td>
                  <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={t.assignee} color="#8B5CF6" size={24} /><span style={{ fontSize: 12, color: "#64748B" }}>{t.assignee}</span></div></td>
                  <td style={{ padding: "12px 16px" }}><span style={{ display: "flex", alignItems: "center" }}><PriorityDot priority={t.priority} /><span style={{ fontSize: 12, color: "#64748B", textTransform: "capitalize" }}>{t.priority}</span></span></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: new Date(t.due) < new Date() && t.status !== "done" ? "#EF4444" : "#64748B" }}>{t.due}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ background: "#F1F5F9", borderRadius: 4, height: 6, width: 60, overflow: "hidden" }}>
                        <div style={{ width: `${t.checklist > 0 ? (t.done / t.checklist) * 100 : 0}%`, background: "#6366F1", height: "100%" }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>{t.done}/{t.checklist}</span>
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
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Create New Task</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748B" }}>&times;</button>
            </div>
            <form onSubmit={handleSaveTask}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Task Title</label>
                <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Client</label>
                <select value={newTask.client} onChange={e => setNewTask({ ...newTask, client: e.target.value })} required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Task Type</label>
                  <select value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                    {["GST", "TDS", "ITR", "PF", "ADV TAX", "ROC"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                    {["low", "medium", "high", "urgent"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Due Date</label>
                  <input type="date" value={newTask.due} onChange={e => setNewTask({ ...newTask, due: e.target.value })} required
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Assignee</label>
                  <select value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                    {["Priya Sharma", "Rahul Verma", "Amit Singh", "Divya Patel"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Status</label>
                  <select value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                    {["backlog", "todo", "in_progress", "review", "done"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>Checklist Steps</label>
                  <input type="number" value={newTask.checklist} onChange={e => setNewTask({ ...newTask, checklist: parseInt(e.target.value) || 0 })} required min="1"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", border: "1px solid #E2E8F0", borderRadius: 6, background: "none", cursor: "pointer", color: "#64748B" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", border: "none", borderRadius: 6, background: "#6366F1", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
