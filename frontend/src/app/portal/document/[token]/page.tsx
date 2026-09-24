'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Lock,
  KeyRound,
  ThumbsUp,
  RotateCcw,
  FileText,
  Download,
  LogOut,
  XCircle,
  Clock,
  Building2,
  User,
  Mail
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ClientDocumentPortalPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  // Session & OTP Gate State
  const sessionKey = `optivir_doc_session_${token}`;
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [needsOtp, setNeedsOtp] = useState(false);
  const [previewInfo, setPreviewInfo] = useState<any | null>(null);
  const [clientSession, setClientSession] = useState<{ email: string; name: string } | null>(null);

  // OTP Login Form State
  const [otpStep, setOtpStep] = useState<'EMAIL' | 'CODE'>('EMAIL');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Approval State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [approverName, setApproverName] = useState('');
  const [approverEmail, setApproverEmail] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionSuccessMessage, setDecisionSuccessMessage] = useState<string | null>(null);

  // PDF loading state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (token) {
      loadDocument();
    }
  }, [token]);

  const loadDocument = async (overrideToken?: string) => {
    try {
      setLoading(true);
      setError(null);
      const activeSession = overrideToken || sessionToken || (typeof window !== 'undefined' ? sessionStorage.getItem(sessionKey) : null);
      if (activeSession && !sessionToken) {
        setSessionToken(activeSession);
      }

      const res = await api.getPublicDocument(token, activeSession || undefined);

      if (res.requireOtp) {
        setNeedsOtp(true);
        setPreviewInfo(res);
        if (res.shareLink?.recipientEmail) {
          setOtpEmail(res.shareLink.recipientEmail);
        }
        if (res.shareLink?.recipientName) {
          setOtpName(res.shareLink.recipientName);
        }
      } else if (res.success && res.document) {
        setNeedsOtp(false);
        setData(res);
        if (res.clientSession) {
          setClientSession(res.clientSession);
          setApproverEmail(res.clientSession.email);
          setApproverName(res.clientSession.name);
        }
        // Build PDF URL with session token
        if (activeSession) {
          setPdfUrl(`${api.getBaseUrl()}/sales/documents/public/${token}/pdf`);
        }
      } else {
        setError(res.message || 'Failed to load document');
      }
    } catch (err: any) {
      if (err?.message?.includes('401') || err?.message?.includes('403')) {
        setNeedsOtp(true);
        if (typeof window !== 'undefined') sessionStorage.removeItem(sessionKey);
        setSessionToken(null);
      } else {
        setError(err.message || 'Failed to load document');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!otpEmail || !otpEmail.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    setRequestingOtp(true);
    setOtpError(null);
    try {
      const res = await api.requestDocumentOtp(token, otpEmail.trim(), otpName.trim() || undefined);
      if (res.success) {
        setOtpStep('CODE');
        setOtpSuccessMessage(res.message);
        setResendTimer(60);
      } else {
        setOtpError(res.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send verification code.');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      const res = await api.verifyDocumentOtp(token, otpEmail.trim(), otpCode.trim(), otpName.trim() || undefined);
      if (res.success && res.sessionToken) {
        setSessionToken(res.sessionToken);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, res.sessionToken);
        }
        setClientSession(res.client);
        setApproverEmail(res.client.email);
        setApproverName(res.client.name);
        setNeedsOtp(false);
        await loadDocument(res.sessionToken);
      } else {
        setOtpError(res.message || 'Verification failed.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmitDecision = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!approverName || !approverEmail) {
      setOtpError('Name and email are required.');
      return;
    }
    setSubmittingDecision(true);
    try {
      const res = await api.submitDocumentApproval(token, {
        decision,
        approverName: approverName.trim(),
        approverEmail: approverEmail.trim(),
        feedbackNotes: feedbackNotes.trim() || undefined,
      }, sessionToken || undefined);
      if (res.success) {
        setDecisionSuccessMessage(res.message || `Successfully ${decision === 'APPROVED' ? 'approved' : 'requested changes'}.`);
        setShowApproveModal(false);
        setShowChangesModal(false);
        setFeedbackNotes('');
        // Reload to reflect updated status
        await loadDocument(sessionToken || undefined);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to submit decision.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(sessionKey);
    setSessionToken(null);
    setClientSession(null);
    setData(null);
    setNeedsOtp(true);
    setOtpStep('EMAIL');
    setOtpCode('');
    setDecisionSuccessMessage(null);
  };

  // =========================================================================
  // LOADING STATE
  // =========================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B18] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading document portal...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ERROR STATE
  // =========================================================================
  if (error && !needsOtp) {
    return (
      <div className="min-h-screen bg-[#060B18] flex items-center justify-center p-4">
        <div className="bg-[#0F172A] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Unable to Load Document</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // OTP GATE SCREEN
  // =========================================================================
  if (needsOtp) {
    const orgName = previewInfo?.shareLink?.organizationName || 'OptiVir Ads';
    const docType = previewInfo?.shareLink?.documentType || 'document';
    const restrictedEmail = previewInfo?.shareLink?.recipientEmail;

    return (
      <div className="min-h-screen bg-[#060B18] flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-[#0F172A] to-[#0B1120] border border-slate-700/50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] px-8 py-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">{orgName}</h1>
                <p className="text-slate-400 text-xs">Document Review & Approval Portal</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Document Type Badge */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>{docType.charAt(0).toUpperCase() + docType.slice(1)} Review</span>
              </div>
              <p className="text-slate-300 text-sm mt-1">Verify your identity to review and approve this document.</p>
            </div>

            {otpStep === 'EMAIL' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                    <User className="w-3 h-3 inline mr-1" /> Your Name
                  </label>
                  <input
                    type="text"
                    value={otpName}
                    onChange={(e) => setOtpName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                    <Mail className="w-3 h-3 inline mr-1" /> Your Email Address
                  </label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Enter your work email address. A one-time verification code will be sent to your inbox.
                  </p>
                </div>

                {otpError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1" /> {otpError}
                  </div>
                )}

                <button
                  onClick={handleRequestOtp}
                  disabled={requestingOtp || !otpEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {requestingOtp ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {otpSuccessMessage && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-300 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> {otpSuccessMessage}
                  </div>
                )}

                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
                    autoFocus
                  />
                </div>

                {otpError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1" /> {otpError}
                  </div>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otpCode.length < 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {verifyingOtp ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Access Document</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => { setOtpStep('EMAIL'); setOtpCode(''); setOtpError(null); }}
                    className="hover:text-slate-300 transition cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleRequestOtp}
                    disabled={resendTimer > 0 || requestingOtp}
                    className="hover:text-blue-300 transition disabled:opacity-40 cursor-pointer"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-4 bg-[#070D18] border-t border-slate-700/30 text-center">
            <p className="text-[10px] text-slate-600">
              <Lock className="w-3 h-3 inline mr-1" />
              Secured by {orgName} • OTP-verified single-session authentication
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED DOCUMENT VIEWER
  // =========================================================================
  if (!data || !data.document) {
    return (
      <div className="min-h-screen bg-[#060B18] flex items-center justify-center">
        <div className="text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Document not found.</p>
        </div>
      </div>
    );
  }

  const { document: doc, shareLink, approvals = [] } = data;
  const docType = shareLink?.documentType || 'proposal';
  const docTypeLabel = docType.charAt(0).toUpperCase() + docType.slice(1);
  const isAlreadyApproved = doc.client_approval_decision === 'APPROVED' || doc.status === 'Accepted';
  const hasExistingDecision = !!doc.client_approval_decision;

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen bg-[#060B18]">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b border-slate-700/50 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">{shareLink?.organizationName || 'OptiVir Ads'}</h1>
              <p className="text-slate-400 text-[10px]">{docTypeLabel} Review Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {clientSession && (
              <span className="text-xs text-slate-400">
                <ShieldCheck className="w-3 h-3 inline mr-1 text-green-400" />
                {clientSession.name} ({clientSession.email})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-red-400 transition flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {decisionSuccessMessage && (
        <div className="bg-green-500/10 border-b border-green-500/30 px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-green-300 text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">{decisionSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Document Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Header Card */}
            <div className="bg-[#0F172A] border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    {docTypeLabel} #{doc.proposal_number || '—'}
                  </div>
                  <h2 className="text-white text-xl font-bold">{doc.title || 'Commercial Proposal'}</h2>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  doc.status === 'Accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  doc.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  doc.status === 'Negotiation' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {doc.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0A1628] rounded-xl p-3">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold mb-1">Client</div>
                  <div className="text-white text-sm font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    {doc.company_name || '—'}
                  </div>
                </div>
                <div className="bg-[#0A1628] rounded-xl p-3">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold mb-1">Total Amount</div>
                  <div className="text-white text-sm font-bold">{formatCurrency(doc.total_amount)}</div>
                </div>
                <div className="bg-[#0A1628] rounded-xl p-3">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold mb-1">Valid Until</div>
                  <div className="text-white text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {formatDate(doc.valid_until)}
                  </div>
                </div>
                <div className="bg-[#0A1628] rounded-xl p-3">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold mb-1">Currency</div>
                  <div className="text-white text-sm font-semibold">{doc.currency || 'INR'}</div>
                </div>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="bg-[#0F172A] border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/30 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Document Preview
                </h3>
                {pdfUrl && sessionToken && (
                  <a
                    href={`${pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      // Download PDF with auth header
                      fetch(pdfUrl, {
                        headers: { 'x-client-session': sessionToken }
                      })
                        .then(r => r.blob())
                        .then(blob => {
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${docTypeLabel}-${doc.proposal_number || 'document'}.pdf`;
                          a.click();
                          URL.revokeObjectURL(url);
                        });
                    }}
                  >
                    <Download className="w-3 h-3" />
                    Download PDF
                  </a>
                )}
              </div>
              <div className="bg-[#0A1628] p-8 min-h-[400px] flex items-center justify-center">
                {pdfUrl && sessionToken ? (
                  <div className="w-full text-center space-y-4">
                    <FileText className="w-16 h-16 text-blue-500/30 mx-auto" />
                    <p className="text-slate-400 text-sm">
                      Click "Download PDF" above to view the full {docTypeLabel.toLowerCase()} document.
                    </p>
                    <button
                      onClick={() => {
                        if (!pdfUrl || !sessionToken) return;
                        fetch(pdfUrl, {
                          headers: { 'x-client-session': sessionToken }
                        })
                          .then(r => r.blob())
                          .then(blob => {
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                          });
                      }}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      View Full PDF
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <Lock className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-slate-500 text-sm">PDF preview requires authentication</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Approval Panel */}
          <div className="space-y-6">
            {/* Approval Actions */}
            <div className="bg-[#0F172A] border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Your Decision
              </h3>

              {isAlreadyApproved ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-semibold text-sm">This {docTypeLabel} Has Been Approved</p>
                  {doc.client_approved_by_email && (
                    <p className="text-green-400/60 text-xs mt-1">by {doc.client_approved_by_email}</p>
                  )}
                  {doc.client_approved_at && (
                    <p className="text-green-400/60 text-xs">{formatDate(doc.client_approved_at)}</p>
                  )}
                </div>
              ) : hasExistingDecision && doc.client_approval_decision === 'CHANGES_REQUESTED' ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center mb-4">
                  <RotateCcw className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-300 font-semibold text-sm">Changes Have Been Requested</p>
                  <p className="text-amber-400/60 text-xs mt-1">The agency team has been notified.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Review the document above, then approve to confirm engagement or request changes if revisions are needed.
                  </p>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve {docTypeLabel}
                  </button>
                  <button
                    onClick={() => setShowChangesModal(true)}
                    className="w-full bg-[#0A1628] hover:bg-[#1E293B] text-amber-300 border border-amber-500/30 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Changes
                  </button>
                </div>
              )}
            </div>

            {/* Approval History */}
            {approvals.length > 0 && (
              <div className="bg-[#0F172A] border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-white font-bold text-sm mb-4">Approval History</h3>
                <div className="space-y-3">
                  {approvals.map((a: any, i: number) => (
                    <div key={i} className="bg-[#0A1628] rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {a.decision === 'APPROVED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        ) : a.decision === 'CHANGES_REQUESTED' ? (
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <span className="text-white text-xs font-semibold">{a.approver_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          a.decision === 'APPROVED' ? 'bg-green-500/20 text-green-300' :
                          a.decision === 'CHANGES_REQUESTED' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {a.decision.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px]">{a.approver_email} • {formatDate(a.signed_at)}</p>
                      {a.feedback_notes && (
                        <p className="text-slate-400 text-xs mt-1 italic">"{a.feedback_notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="bg-[#0A1628] border border-slate-700/30 rounded-2xl p-4 text-center">
              <Lock className="w-4 h-4 text-slate-600 mx-auto mb-2" />
              <p className="text-[10px] text-slate-600 leading-relaxed">
                This portal is secured with OTP-verified authentication.<br />
                Your approval is legally binding and digitally recorded with timestamp, IP address, and browser signature.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* APPROVAL MODAL */}
      {/* ============================================================= */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-400" />
              Approve {docTypeLabel}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              By approving, you are confirming acceptance of this {docTypeLabel.toLowerCase()} and its terms. This action is legally binding.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">Your Name *</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">Your Email *</label>
                <input
                  type="email"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">Additional Notes (optional)</label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  rows={3}
                  placeholder="Any comments or notes..."
                  className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-green-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowApproveModal(false); setFeedbackNotes(''); }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitDecision('APPROVED')}
                disabled={submittingDecision || !approverName || !approverEmail}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submittingDecision ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* REQUEST CHANGES MODAL */}
      {/* ============================================================= */}
      {showChangesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Request Changes
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Describe what changes are needed. The agency team will be notified and will revise the {docTypeLabel.toLowerCase()} accordingly.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">Your Name *</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">Your Email *</label>
                <input
                  type="email"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">What changes are needed? *</label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe the revisions needed..."
                  className="w-full bg-[#0A1628] border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowChangesModal(false); setFeedbackNotes(''); }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitDecision('CHANGES_REQUESTED')}
                disabled={submittingDecision || !approverName || !approverEmail || !feedbackNotes.trim()}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submittingDecision ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
