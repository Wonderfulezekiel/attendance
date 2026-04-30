/**
 * Export data to CSV format and trigger download
 */
export function exportCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        // Escape commas and quotes
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      }).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data to PDF format using browser print
 */
export function exportPDF(title: string, headers: string[], rows: string[][], filename: string) {
  if (!rows || rows.length === 0) {
    alert('No data to export.');
    return;
  }

  const tableRows = rows.map(row =>
    `<tr>${row.map(cell => `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${cell}</td>`).join('')}</tr>`
  ).join('');

  const headerCells = headers.map(h =>
    `<th style="padding:10px 12px;text-align:left;font-weight:600;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #d1d5db;background:#f9fafb;">${h}</th>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #111827; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for content to render, then print
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}
