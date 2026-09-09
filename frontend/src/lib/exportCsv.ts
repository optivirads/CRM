/**
 * Client-side CSV Exporter
 * Generates and triggers download of real CSV files from datasets
 */
export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) {
    return false;
  }

  // Extract clean keys excluding internal objects/functions
  const firstRow = rows[0];
  const headers = Object.keys(firstRow).filter(k => typeof firstRow[k] !== 'object' && typeof firstRow[k] !== 'function');

  const csvRows: string[] = [];
  csvRows.push(headers.map(h => `"${h.toUpperCase()}"`).join(','));

  rows.forEach(row => {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
