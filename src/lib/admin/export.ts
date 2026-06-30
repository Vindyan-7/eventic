/**
 * Utility to trigger client-side CSV downloads of administrative tables.
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? "" : row[header];
      const stringified = typeof val === "object" ? JSON.stringify(val) : String(val);
      return `"${stringified.replace(/"/g, '""')}"`;
    }).join(",")
  );
  
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
