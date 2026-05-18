import React from 'react';

export const Avatar = ({ name, color, size=32 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:color||"#6366F1", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*0.35, fontWeight:600, flexShrink:0 }}>
    {name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
  </div>
);
