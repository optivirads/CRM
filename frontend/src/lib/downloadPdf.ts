/**
 * Client-Side Utility for Triggering Direct Vector PDF Downloads
 * Uses Next.js App Router API (/api/pdf/[type]) generated via pure JavaScript pdfkit
 */

export type ClientPdfType = 'invoice' | 'proposal' | 'quotation' | 'report' | 'contract';

export function downloadClientPdf(
  type: ClientPdfType,
  params: Record<string, string | number | undefined> = {}
) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      searchParams.set(key, String(val));
    }
  });

  const url = `/api/pdf/${type}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  // Create an invisible anchor tag to trigger download
  const link = document.createElement('a');
  link.href = url;
  
  let fallbackName = `${type}-document.pdf`;
  if (type === 'invoice') fallbackName = `Invoice-${params.number || 'INV-2026-089'}.pdf`;
  if (type === 'proposal') fallbackName = `Proposal-${params.number || 'PROP-2026-042'}.pdf`;
  if (type === 'quotation') fallbackName = `Quotation-${params.number || 'QUO-2026-015'}.pdf`;
  if (type === 'report') fallbackName = `Report-${params.client ? String(params.client).replace(/\s+/g, '-') : 'QBR'}.pdf`;
  if (type === 'contract') fallbackName = `Contract-${params.id || 'DOC-2026-089-MSA'}.pdf`;

  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
