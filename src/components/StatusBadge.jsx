import React from 'react';

export const StatusBadge = ({ status }) => {
  const map = {
    active:{ bg:"#D1FAE5", color:"#065F46", label:"Active" },
    inactive:{ bg:"#F3F4F6", color:"#6B7280", label:"Inactive" },
    todo:{ bg:"#EEF2FF", color:"#4338CA", label:"To Do" },
    in_progress:{ bg:"#FEF3C7", color:"#92400E", label:"In Progress" },
    done:{ bg:"#D1FAE5", color:"#065F46", label:"Done" },
    review:{ bg:"#E0E7FF", color:"#3730A3", label:"In Review" },
    backlog:{ bg:"#F9FAFB", color:"#6B7280", label:"Backlog" },
    blocked:{ bg:"#FEE2E2", color:"#991B1B", label:"Blocked" },
    cancelled:{ bg:"#F3F4F6", color:"#9CA3AF", label:"Cancelled" },
    paid:{ bg:"#D1FAE5", color:"#065F46", label:"Paid" },
    overdue:{ bg:"#FEE2E2", color:"#991B1B", label:"Overdue" },
    partial:{ bg:"#FEF3C7", color:"#92400E", label:"Partial" },
    sent:{ bg:"#E0E7FF", color:"#3730A3", label:"Sent" },
    draft:{ bg:"#F3F4F6", color:"#6B7280", label:"Draft" },
  };
  const s = map[status] || { bg:"#F3F4F6", color:"#6B7280", label: status };
  return <span style={{ background:s.bg, color:s.color, padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{s.label}</span>;
};
