import React from 'react';

export const PriorityDot = ({ priority }) => {
  const colors = { urgent:"#EF4444", high:"#F59E0B", medium:"#6366F1", low:"#9CA3AF" };
  return <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:colors[priority]||"#9CA3AF", marginRight:4 }}/>;
};
