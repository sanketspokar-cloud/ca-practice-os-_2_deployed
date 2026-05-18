const loadJsPDF = () => {
  return new Promise((resolve) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    document.body.appendChild(script);
  });
};

export const downloadSinglePDF = async (type, item) => {
  const jspdfModule = await loadJsPDF();
  const { jsPDF } = jspdfModule;
  const doc = new jsPDF();

  // Brand Header
  doc.setFillColor(99, 102, 241); // Indigo color matching Practice OS theme
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("PRACTICE OS REPORT", 20, 26);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("SYSTEM GENERATED SECURE DOCUMENT", 130, 24);

  // Content Block
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${type.toUpperCase()} PROFILE & STATUS`, 20, 60);

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(20, 65, 190, 65);

  doc.setFontSize(11);
  
  let y = 80;
  const addField = (label, val) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(val !== undefined && val !== null ? val : "—"), 70, y);
    y += 12;
  };

  if (type === 'client') {
    addField("Client Name", item.name);
    addField("Client Code", item.code);
    addField("Entity Type", item.entity);
    addField("PAN Card No", item.pan);
    addField("GSTIN Number", item.gstin);
    addField("Assigned Manager", item.assigned);
    addField("Status Flag", String(item.status).toUpperCase());
    addField("Outstanding Fees", `INR ${Number(item.outstanding || 0).toLocaleString("en-IN")}`);
    addField("Tasks Currently Due", item.tasksDue);
    addField("Email Address", item.email);
    addField("Phone Contact", item.phone);
  } else if (type === 'task') {
    addField("Task Title", item.title);
    addField("Client Name", item.client);
    addField("Filing / Work Type", item.type);
    addField("Assignee Staff", item.assignee);
    addField("Priority Tier", String(item.priority).toUpperCase());
    addField("Due Date", item.due);
    addField("Current Status", String(item.status).replace("_", " ").toUpperCase());
    addField("Checklist Progress", `${item.done} / ${item.checklist} subtasks completed`);
  } else if (type === 'compliance') {
    addField("Compliance Type", item.type);
    addField("Client Company", item.client);
    addField("Filing Form / Task", item.task);
    addField("Filing Period", item.period);
    addField("Due Date", item.due);
    addField("Current Status", String(item.status).toUpperCase());
    addField("Assignee Staff", item.assignee);
  } else if (type === 'invoice') {
    addField("Invoice Serial No", item.no);
    addField("Client Billed", item.client);
    addField("Invoice Date", item.date);
    addField("Due Date", item.due);
    addField("Total Amount", `INR ${Number(item.amount || 0).toLocaleString("en-IN")}`);
    addField("Collected / Paid", `INR ${Number(item.paid || 0).toLocaleString("en-IN")}`);
    addField("Current Status", String(item.status).toUpperCase());
    addField("Balance Outstanding", `INR ${(Number(item.amount || 0) - Number(item.paid || 0)).toLocaleString("en-IN")}`);
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 270, 190, 270);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont("helvetica", "normal");
  doc.text("Secure generated export · Practice OS Data System.", 20, 278);
  doc.text(`Timestamp: ${new Date().toLocaleString()}`, 130, 278);

  doc.save(`${type}_report_${item.code || item.id || item.no}.pdf`);
};

export const downloadDashboardPDF = async (data) => {
  const jspdfModule = await loadJsPDF();
  const { jsPDF } = jspdfModule;
  const doc = new jsPDF();

  // Premium Brand Header
  doc.setFillColor(99, 102, 241); 
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("PRACTICE OS - DASHBOARD METRICS", 20, 26);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`REPORT TIMESTAMP: ${new Date().toLocaleString()}`, 120, 24);

  // Overall Practice KPIs
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("FIRM-WIDE METRICS SUMMARY", 20, 60);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 64, 190, 64);

  let y = 78;
  const printRow = (label, val, unit = "") => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${unit}${val}`, 120, y);
    y += 12;
  };

  printRow("Total Registered Clients", data.clientsCount || 0);
  printRow("Active Task Pipeline", data.tasksCount || 0);
  printRow("Overdue Task Backlog", data.overdueTasksCount || 0);
  printRow("Pending Compliance Filings", data.pendingComplianceCount || 0);
  printRow("Outstanding Collections Receivable", data.totalOutstanding || 0, "INR ");
  printRow("Total Billing Revenue", data.totalRevenue || 0, "INR ");

  y += 10;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("INTERNAL STAFF & CASELOAD ALLOCATION", 20, y);
  y += 5;
  doc.line(20, y, 190, y);
  y += 12;

  (data.team || []).forEach(member => {
    if (y > 250) {
      doc.addPage();
      y = 30;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(member.name, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Role: ${member.role}   |   Caseload Managed: ${member.tasks} tasks`, 70, y);
    y += 10;
  });

  // Page Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 270, 190, 270);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Secure practice administration report compilation. Confidential.", 20, 278);
  
  doc.save("practice_os_dashboard_summary.pdf");
};
