/**
 * Client-Side Utility for Triggering Direct Vector PDF Downloads
 * Uses Next.js App Router API (/api/pdf/[type]) generated via pure JavaScript pdfkit
 * Sends Authorization header to ensure protected access.
 */

export type ClientPdfType = 'invoice' | 'proposal' | 'quotation' | 'report' | 'contract';

export async function downloadClientPdf(
  type: ClientPdfType,
  params: Record<string, string | number | undefined> = {}
): Promise<void> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      searchParams.set(key, String(val));
    }
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('optivir_token') : null;
  if (token) {
    searchParams.set('token', token);
  }

  const url = `/api/pdf/${type}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  let fallbackName = `${type}-document.pdf`;
  if (type === 'invoice') fallbackName = `Invoice-${params.invoice_number || params.number || 'INV-2026-089'}.pdf`;
  if (type === 'proposal') fallbackName = `Proposal-${params.number || 'PROP-2026-042'}.pdf`;
  if (type === 'quotation') fallbackName = `Quotation-${params.number || 'QUO-2026-015'}.pdf`;
  if (type === 'report') fallbackName = `Report-${params.client ? String(params.client).replace(/\s+/g, '-') : 'QBR'}.pdf`;
  if (type === 'contract') fallbackName = `Contract-${params.id || 'DOC-2026-089-MSA'}.pdf`;

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Download failed: HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (err: any) {
    console.error('PDF download error:', err);
    alert(err.message || 'Failed to download PDF');
  }
}
