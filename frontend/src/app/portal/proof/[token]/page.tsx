'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles,
  Lock,
  KeyRound,
  ThumbsUp,
  RotateCcw,
  Check,
  X,
  Layers,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { api } from '@/lib/api';
import { WatermarkOverlay } from '@/components/common/WatermarkOverlay';

export default function ClientProofingPortalPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Pin Annotation State
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Video State
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaContainerRef = useRef<HTMLDivElement | null>(null);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [approverName, setApproverName] = useState('');
  const [approverEmail, setApproverEmail] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionSuccessMessage, setDecisionSuccessMessage] = useState<string | null>(null);
  const [isDownloadingWatermarked, setIsDownloadingWatermarked] = useState(false);

  // Session & OTP Gate State
  const sessionKey = `optivir_proof_session_${token}`;
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
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (token) {
      loadProof();
    }
  }, [token]);

  const loadProof = async (overrideToken?: string) => {
    try {
      setLoading(true);
      setError(null);
      const activeSession = overrideToken || sessionToken || (typeof window !== 'undefined' ? sessionStorage.getItem(sessionKey) : null);
      if (activeSession && !sessionToken) {
        setSessionToken(activeSession);
      }

      const res = await api.getPublicProof(token, activeSession || undefined);

      if (res.requireOtp) {
        setNeedsOtp(true);
        setPreviewInfo(res);
        if (res.shareLink?.recipientEmail) {
          setOtpEmail(res.shareLink.recipientEmail);
        }
        if (res.shareLink?.recipientName) {
          setOtpName(res.shareLink.recipientName);
        }
      } else if (res.success && res.proof) {
        setNeedsOtp(false);
        setData(res);
        if (res.clientSession) {
          setClientSession(res.clientSession);
          setAuthorEmail(res.clientSession.email);
          setAuthorName(res.clientSession.name);
          setApproverEmail(res.clientSession.email);
          setApproverName(res.clientSession.name);
        }
      } else {
        setError('Unable to load client proof. The link may have expired or been revoked.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to access creative proof.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }

    try {
      setRequestingOtp(true);
      setOtpError(null);
      setOtpSuccessMessage(null);
      setDevOtpCode(null);

      const res = await api.requestProofOtp(token, otpEmail.trim(), otpName.trim() || undefined);
      if (res.success) {
        setOtpStep('CODE');
        setOtpSuccessMessage(res.message);
        if (res.devOtp) {
          setDevOtpCode(res.devOtp);
          setOtpCode(res.devOtp);
        }
        setResendTimer(60);
      } else {
        setOtpError(res.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to request verification code.');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError(null);
      const res = await api.verifyProofOtp(token, otpEmail.trim(), otpCode.trim(), otpName.trim() || undefined);
      if (res.success && res.sessionToken) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, res.sessionToken);
        }
        setSessionToken(res.sessionToken);
        setClientSession(res.client);
        if (res.client?.email) {
          setAuthorEmail(res.client.email);
          setApproverEmail(res.client.email);
        }
        if (res.client?.name) {
          setAuthorName(res.client.name);
          setApproverName(res.client.name);
        }
        setNeedsOtp(false);
        await loadProof(res.sessionToken);
      } else {
        setOtpError(res.message || 'Verification failed. Please check the code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(sessionKey);
    }
    setSessionToken(null);
    setClientSession(null);
    setNeedsOtp(true);
    setOtpStep('EMAIL');
    setOtpCode('');
    setOtpSuccessMessage(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clientSession) {
      setNeedsOtp(true);
      return;
    }
    if (!isPlacingPin || !mediaContainerRef.current) return;
    const rect = mediaContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
  };

  const handleSubmitComment = async () => {
    if (!clientSession || !sessionToken) {
      setNeedsOtp(true);
      return;
    }
    if (!commentContent.trim() || !token) return;
    try {
      setSubmittingComment(true);
      const effectiveName = clientSession?.name || authorName.trim() || clientSession?.email || 'Client Reviewer';
      const effectiveEmail = clientSession?.email || authorEmail.trim();

      await api.submitPublicProofComment(token, {
        authorName: effectiveName,
        authorEmail: effectiveEmail || undefined,
        content: commentContent.trim(),
        pinXPercent: pendingPin?.x,
        pinYPercent: pendingPin?.y,
        timestampStartSeconds: currentAsset?.assetType === 'VIDEO' ? videoCurrentTime : undefined,
        assetId: currentAsset?.id
      }, sessionToken || undefined);
      setCommentContent('');
      setPendingPin(null);
      setIsPlacingPin(false);
      setDecisionSuccessMessage('Comment added! Assigned Manager and Creator have been notified via Gmail.');
      setTimeout(() => setDecisionSuccessMessage(null), 5000);
      loadProof();
    } catch (err: any) {
      if (err.requiresOtp || err.message?.toLowerCase().includes('otp')) {
        setNeedsOtp(true);
      }
      alert(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSession || !sessionToken) {
      setShowApproveModal(false);
      setNeedsOtp(true);
      return;
    }

    try {
      setSubmittingDecision(true);
      const effectiveName = clientSession?.name || approverName.trim() || clientSession?.email;
      const effectiveEmail = clientSession?.email || approverEmail.trim();

      const res = await api.approvePublicProof(token, {
        approverName: effectiveName,
        approverEmail: effectiveEmail,
        feedbackNotes: feedbackNotes.trim() || undefined
      }, sessionToken || undefined);
      if (res.success) {
        setShowApproveModal(false);
        setDecisionSuccessMessage('Thank you! This creative proof has been officially approved. Project Manager & Creator have been notified via Gmail.');
        loadProof();
      }
    } catch (err: any) {
      if (err.requiresOtp || err.message?.toLowerCase().includes('otp')) {
        setShowApproveModal(false);
        setNeedsOtp(true);
      }
      alert('Approval failed: ' + (err.message || 'Error recording approval'));
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSession || !sessionToken) {
      setShowRequestChangesModal(false);
      setNeedsOtp(true);
      return;
    }
    if (!feedbackNotes.trim() || !token) return;

    try {
      setSubmittingDecision(true);
      const effectiveName = clientSession?.name || approverName.trim() || clientSession?.email;
      const effectiveEmail = clientSession?.email || approverEmail.trim();

      const res = await api.requestChangesPublicProof(token, {
        reviewerName: effectiveName,
        reviewerEmail: effectiveEmail || undefined,
        changeNotes: feedbackNotes.trim()
      }, sessionToken || undefined);
      if (res.success) {
        setShowRequestChangesModal(false);
        setDecisionSuccessMessage('Your change requests have been dispatched directly to the Creator & Manager via Gmail.');
        loadProof();
      }
    } catch (err: any) {
      if (err.requiresOtp || err.message?.toLowerCase().includes('otp')) {
        setShowRequestChangesModal(false);
        setNeedsOtp(true);
      }
      alert('Request failed: ' + (err.message || 'Error recording revision request'));
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleDownloadWatermarked = async (asset: any) => {
    if (!asset?.id || !token) return;
    const baseName = asset.fileName || 'client_proof_preview';

    try {
      setIsDownloadingWatermarked(true);
      const downloadEndpoint = `/api/creatives/public/proofs/${token}/assets/${asset.id}/download`;

      const response = await fetch(downloadEndpoint);
      if (!response.ok) {
        throw new Error(`Failed to generate watermarked proof (${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const isVideo = asset.assetType === 'VIDEO';
      const ext = isVideo ? '.mp4' : (asset.mimeType?.includes('png') ? '.png' : '.jpg');
      const safeName = baseName.replace(/\.[^/.]+$/, '');
      a.download = `WATERMARKED_${safeName}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error('Watermark download error:', err);
      alert('Unable to generate watermarked proof at this moment. Please try again.');
    } finally {
      setIsDownloadingWatermarked(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B13] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-[#DC2626] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">Loading Creative Proof...</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Cloudflare R2 secure storage</p>
      </div>
    );
  }

  // 0. CLIENT OTP LOGIN GATE
  if (needsOtp) {
    const orgName = previewInfo?.shareLink?.organizationName || 'OptiVir CRM';
    const creativeTitle = previewInfo?.creativeInfo?.name || 'Creative Deliverable';
    const campaignTitle = previewInfo?.creativeInfo?.campaignName;
    const restrictedEmail = previewInfo?.shareLink?.recipientEmail;

    return (
      <div className="min-h-screen bg-[#050911] text-white flex flex-col font-sans selection:bg-[#DC2626] selection:text-white relative overflow-hidden">
        {/* Background Ambient Radial Colored Glows */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[150px] pointer-events-none" />

        {/* Minimal Portal Header */}
        <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/60 p-1.5 flex items-center justify-center shadow-lg">
              <img src="/icon.png" alt={orgName} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white">{orgName}</div>
              <p className="text-[10px] text-slate-400">Client Creative Review &amp; Approval Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secured Client Gateway</span>
          </div>
        </header>

        {/* Center OTP Card */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-[#0B1528]/85 dark:bg-[#071120]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-6">
            
            {/* Top Badge & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 mb-1 shadow-lg shadow-rose-950/40">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Client Access Verification</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Sign in with a one-time OTP code sent to your work email to review, leave comments, and approve this creative.
              </p>
            </div>

            {/* Creative Info Pill */}
            <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-3.5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deliverable Ready For Review</div>
              <div className="text-sm font-bold text-white flex items-center justify-between">
                <span className="truncate mr-2">{creativeTitle}</span>
                {campaignTitle && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/40 shrink-0">
                    {campaignTitle}
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {otpError && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-700/60 rounded-xl flex items-start gap-2 text-xs text-rose-200 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{otpError}</div>
              </div>
            )}

            {/* Success Message */}
            {otpSuccessMessage && (
              <div className="p-3.5 bg-emerald-950/60 border border-emerald-700/60 rounded-xl flex items-start gap-2 text-xs text-emerald-200 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">{otpSuccessMessage}</div>
              </div>
            )}

            {/* Dev / Testing OTP Callout */}
            {devOtpCode && (
              <div className="p-3.5 bg-amber-950/60 border border-amber-600/50 rounded-xl flex items-center justify-between text-xs text-amber-200 backdrop-blur-md">
                <div>
                  <div className="font-bold text-amber-100">Testing Code (Dev / Fallback):</div>
                  <div className="font-mono text-base font-black text-amber-300 tracking-wider mt-0.5">{devOtpCode}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(devOtpCode)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold transition cursor-pointer"
                >
                  Fill Code
                </button>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {otpStep === 'EMAIL' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">Work Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Send className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="name@company.com"
                      disabled={requestingOtp || Boolean(restrictedEmail)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/60 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden transition"
                    />
                  </div>
                  {restrictedEmail && (
                    <p className="text-[10px] text-slate-400">
                      This link has been locked to <strong className="text-slate-200">{restrictedEmail}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={otpName}
                    onChange={(e) => setOtpName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    disabled={requestingOtp}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={requestingOtp}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#DC2626] to-[#991B1B] hover:from-[#EF4444] hover:to-[#DC2626] text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950/70 border border-rose-500/40 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {requestingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP Code via Gmail</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Enter 6-Digit OTP Code */}
            {otpStep === 'CODE' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">Enter 6-Digit OTP Code</label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('EMAIL');
                        setOtpError(null);
                      }}
                      className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 focus:border-rose-500 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-600 focus:outline-hidden transition"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Sent to: <strong className="text-slate-300">{otpEmail}</strong></span>
                    {resendTimer > 0 ? (
                      <span>Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={requestingOtp}
                        className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>

                {devOtpCode && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-amber-400/90 block font-medium">Verification Code:</span>
                      <span className="font-mono font-bold text-white text-base tracking-widest">{devOtpCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devOtpCode)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition"
                    >
                      Fill Code
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifyingOtp || otpCode.length < 6}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/70 border border-emerald-500/40 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {verifyingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify &amp; Access Creative Proof</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-white/5">
              <span>Client actions are logged &amp; synced with the assigned Creative Lead &amp; Project Manager.</span>
            </div>
          </div>
        </main>

        <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {orgName} • Single-Session Client Governance
        </footer>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#060B13] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-[#DC2626] flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black">Proof Access Unavailable</h1>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          {error || 'This proofing link is either invalid, expired, or has been revoked by the agency.'}
        </p>
      </div>
    );
  }

  const { creative, proof, shareLink } = data;
  const currentAsset = proof.assets?.[activeSlideIndex] || proof.assets?.[0] || null;
  const isApproved = proof.status === 'APPROVED';
  const latestApproval = proof.approvals?.find((a: any) => a.decision === 'APPROVED') || proof.approvals?.[0];

  return (
    <div className="min-h-screen bg-[#060B13] text-slate-100 font-sans flex flex-col selection:bg-[#DC2626] selection:text-white">
      {/* 1. Portal Header (Branded, No internal CRM nav) */}
      <header className="sticky top-0 z-40 bg-[#0B1424]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/60 p-1 flex items-center justify-center shadow-md">
            <img src="/icon.png" alt="OptiVir CRM" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">{creative.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/10">
                v{proof.versionNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {shareLink.organizationName || 'OptiVir Performance Agency'} • Client Proofing Portal
            </p>
          </div>
        </div>

        {/* Action Buttons & Client Badge */}
        <div className="flex items-center gap-3">
          {clientSession ? (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-emerald-500/30 rounded-xl text-xs text-slate-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">{clientSession.email}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-rose-400 ml-1.5 transition cursor-pointer text-[11px]"
                title="Switch client user / Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNeedsOtp(true)}
              className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Log in with email OTP to comment or approve"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Log in with OTP</span>
            </button>
          )}

          {isApproved ? (
            <div className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold">Approved</span>
                {latestApproval?.approver_name && (
                  <span className="text-[11px] text-emerald-300 block font-normal">
                    by {latestApproval.approver_name} {latestApproval.approver_email ? `(${latestApproval.approver_email})` : ''}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  if (!clientSession) {
                    setNeedsOtp(true);
                    return;
                  }
                  setShowRequestChangesModal(true);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Request</span> Changes
              </button>
              <button
                onClick={() => {
                  if (!clientSession) {
                    setNeedsOtp(true);
                    return;
                  }
                  setShowApproveModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 transform active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Approve Proof</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Success Notification Banner */}
      {decisionSuccessMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-center text-xs font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{decisionSuccessMessage}</span>
        </div>
      )}

      {/* 2. Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left: Media Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#070D18] border border-slate-800/80 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-2xl">
          {/* Pin Mode & Download Bar */}
          <div className="w-full flex items-center justify-between mb-4 text-xs">
            <span className="text-slate-400 font-medium">
              Format: <strong className="text-white">{creative.ad_format}</strong> ({creative.aspect_ratio || '1:1'})
            </span>

            <div className="flex items-center gap-2">
              {currentAsset?.viewingUrl && (
                <button
                  onClick={() => handleDownloadWatermarked(currentAsset)}
                  disabled={isDownloadingWatermarked}
                  title="Download Watermark-Protected Proof"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isDownloadingWatermarked ? (
                    <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isDownloadingWatermarked ? 'Watermarking Proof...' : 'Download Proof (Watermarked)'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (!clientSession) {
                    setNeedsOtp(true);
                    return;
                  }
                  setIsPlacingPin(!isPlacingPin);
                  setPendingPin(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${isPlacingPin ? 'bg-[#DC2626] text-white ring-2 ring-red-400' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isPlacingPin ? 'Click image to drop pin' : 'Add Pin Comment'}</span>
              </button>
            </div>
          </div>

          {/* Canvas Display */}
          <div
            ref={mediaContainerRef}
            onClick={handleCanvasClick}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className={`relative max-w-full max-h-[65vh] rounded-2xl overflow-hidden shadow-2xl select-none ${isPlacingPin ? 'cursor-crosshair ring-2 ring-red-500' : ''}`}
          >
            {currentAsset?.assetType === 'VIDEO' ? (
              <video
                ref={videoRef}
                src={currentAsset.viewingUrl}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="max-h-[65vh] object-contain rounded-2xl select-none pointer-events-auto"
                onTimeUpdate={() => setVideoCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setVideoDuration(videoRef.current?.duration || 0)}
              />
            ) : currentAsset?.viewingUrl ? (
              <img
                src={currentAsset.viewingUrl}
                alt="Proof"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-h-[65vh] object-contain rounded-2xl select-none pointer-events-none"
              />
            ) : (
              <div className="p-16 text-center text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-700" />
                <p>No media asset attached</p>
              </div>
            )}

            {/* Simple, Non-Intrusive Professional Watermark */}
            <WatermarkOverlay size="lg" className="z-20" />

            {/* Pins */}
            {proof.comments
              ?.filter((c: any) => c.pin_x_percent !== null && c.pin_y_percent !== null)
              .map((comment: any, idx: number) => (
                <div
                  key={comment.id}
                  style={{ left: `${comment.pin_x_percent}%`, top: `${comment.pin_y_percent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xl ring-2 ring-white cursor-pointer ${comment.is_resolved ? 'bg-emerald-600' : 'bg-[#DC2626]'}`}
                  title={`${comment.author_name}: ${comment.content}`}
                >
                  {idx + 1}
                </div>
              ))}

            {pendingPin && (
              <div
                style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xl ring-2 ring-white animate-bounce"
              >
                ?
              </div>
            )}
          </div>

          {/* Video Scrubber */}
          {currentAsset?.assetType === 'VIDEO' && (
            <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-800 mt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                      setIsVideoPlaying(true);
                    } else {
                      videoRef.current.pause();
                      setIsVideoPlaying(false);
                    }
                  }
                }}
                className="p-2 rounded-xl bg-[#DC2626] text-white"
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={videoDuration || 100}
                step={0.1}
                value={videoCurrentTime}
                onChange={(e) => {
                  const t = parseFloat(e.target.value);
                  setVideoCurrentTime(t);
                  if (videoRef.current) videoRef.current.currentTime = t;
                }}
                className="flex-1 accent-[#DC2626]"
              />
              <span className="text-xs font-mono text-slate-300">
                {videoCurrentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
              </span>
            </div>
          )}

          {/* Carousel Slide Thumbnails */}
          {proof.assets?.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto">
              {proof.assets.map((asset: any, idx: number) => (
                <button
                  key={asset.id}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition ${activeSlideIndex === idx ? 'border-[#DC2626] scale-105' : 'border-slate-800 opacity-60'}`}
                >
                  <img src={asset.thumbnailUrl || asset.viewingUrl} alt="Slide" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Ad Copy & Comment Stream */}
        <div className="w-full lg:w-96 flex flex-col space-y-4">
          {/* Ad Copy Card */}
          {(creative.primary_ad_copy || creative.headline) && (
            <div className="bg-[#0B1424] border border-slate-800 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ad Copy & Headline</h3>
              {creative.headline && (
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Headline</div>
                  <div className="text-sm font-bold text-white mt-0.5">{creative.headline}</div>
                </div>
              )}
              {creative.primary_ad_copy && (
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Primary Text</div>
                  <p className="text-xs text-slate-300 mt-0.5 whitespace-pre-wrap leading-relaxed">
                    {creative.primary_ad_copy}
                  </p>
                </div>
              )}
              {creative.call_to_action && (
                <div className="pt-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-bold">
                    CTA: {creative.call_to_action}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Comments & Annotations */}
          <div className="flex-1 bg-[#0B1424] border border-slate-800 rounded-3xl p-5 flex flex-col space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Client Annotations ({proof.comments?.length || 0})</span>
            </h3>

            {/* Pending Pin Form */}
            {pendingPin && (
              <div className="bg-blue-950/40 border border-blue-900 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-blue-300">Drop Pin Annotation</div>
                  {clientSession && (
                    <span className="text-[10px] text-slate-400">
                      Posting as <strong className="text-white">{authorName || clientSession.name || clientSession.email}</strong>
                    </span>
                  )}
                </div>
                {!clientSession && (
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/50 rounded-lg p-2.5 flex items-center justify-between">
                    <span>OTP login is required to post annotations.</span>
                    <button
                      onClick={() => setNeedsOtp(true)}
                      className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold"
                    >
                      Login
                    </button>
                  </div>
                )}
                <textarea
                  rows={2}
                  placeholder="What should be adjusted here?"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setPendingPin(null)} className="px-3 py-1 text-xs text-slate-400">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !commentContent.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    Post Pin
                  </button>
                </div>
              </div>
            )}

            {/* Comment Thread List */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {proof.comments?.length === 0 && !pendingPin && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No comments yet. Click "Add Pin Comment" on the image to leave point-and-click feedback.
                </div>
              )}

              {proof.comments?.map((c: any, idx: number) => (
                <div key={c.id} className="p-3 bg-[#060B13] border border-slate-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-white flex-wrap">
                      <span className="w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{c.author_name}</span>
                      {c.author_email && (
                        <span className="text-[11px] font-normal text-slate-400">
                          ({c.author_email})
                        </span>
                      )}
                    </div>
                    {c.is_resolved && (
                      <span className="text-[10px] text-emerald-400 font-bold">Resolved ✓</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>

            {/* General Feedback / OTP Requirement Gate */}
            {!clientSession ? (
              <div className="pt-3 border-t border-slate-800">
                <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-4 text-center space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">OTP Verification Required</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      OTP login is mandatory to post comments, drop pin annotations, or approve this creative.
                    </p>
                  </div>
                  <button
                    onClick={() => setNeedsOtp(true)}
                    className="w-full py-2 px-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Verify with Email OTP
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>
                    Commenting as <strong className="text-slate-200">{authorName || clientSession.name || clientSession.email}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified Client
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add general note or revision feedback..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    className="flex-1 px-3 py-2 bg-[#060B13] border border-slate-800 focus:border-red-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !commentContent.trim()}
                    className="p-2.5 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white disabled:opacity-50 transition-colors shadow-md shadow-red-600/20"
                    title="Send comment"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Formal Legal Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B1424] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Approve Creative Proof</h3>
              </div>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              By approving, you authorize the marketing team to schedule and deploy version <strong>v{proof.versionNumber}</strong> into live ad campaigns.
            </p>

            <form onSubmit={handleApprove} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Corporate Email Address *</label>
                {clientSession?.email ? (
                  <div className="w-full px-3 py-2 bg-[#060B13] border border-emerald-900/60 rounded-xl text-xs text-slate-200 flex items-center justify-between">
                    <span>{clientSession.email}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Verified via OTP
                    </span>
                  </div>
                ) : (
                  <input
                    type="email"
                    required
                    placeholder="s.jenkins@clientcompany.com"
                    value={approverEmail}
                    onChange={(e) => setApproverEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Approval Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Looks great, ready for launch!"
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDecision}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {submittingDecision ? 'Submitting...' : 'Sign & Approve Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Request Changes Modal */}
      {showRequestChangesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B1424] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Request Changes on Proof</h3>
              </div>
              <button onClick={() => setShowRequestChangesModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestChanges} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Corporate Email Address</label>
                {clientSession?.email ? (
                  <div className="w-full px-3 py-2 bg-[#060B13] border border-emerald-900/60 rounded-xl text-xs text-slate-200 flex items-center justify-between">
                    <span>{clientSession.email}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Verified via OTP
                    </span>
                  </div>
                ) : (
                  <input
                    type="email"
                    placeholder="s.jenkins@clientcompany.com"
                    value={approverEmail}
                    onChange={(e) => setApproverEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Revision Summary / Change Instructions *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify required modifications for the creative team..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestChangesModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDecision}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {submittingDecision ? 'Submitting...' : 'Send Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
