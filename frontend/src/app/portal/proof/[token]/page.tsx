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

  useEffect(() => {
    if (token) {
      loadProof();
    }
  }, [token]);

  const loadProof = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPublicProof(token);
      if (res.success) {
        setData(res);
      } else {
        setError('Unable to load client proof. The link may have expired or been revoked.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to access creative proof.');
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingPin || !mediaContainerRef.current) return;
    const rect = mediaContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !authorName.trim() || !token) return;
    try {
      setSubmittingComment(true);
      await api.submitPublicProofComment(token, {
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim() || undefined,
        content: commentContent.trim(),
        pinXPercent: pendingPin?.x,
        pinYPercent: pendingPin?.y,
        timestampStartSeconds: currentAsset?.assetType === 'VIDEO' ? videoCurrentTime : undefined,
        assetId: currentAsset?.id
      });
      setCommentContent('');
      setPendingPin(null);
      setIsPlacingPin(false);
      loadProof();
    } catch (err: any) {
      alert('Failed to submit comment: ' + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverName.trim() || !approverEmail.trim() || !token) return;

    try {
      setSubmittingDecision(true);
      const res = await api.approvePublicProof(token, {
        approverName: approverName.trim(),
        approverEmail: approverEmail.trim(),
        feedbackNotes: feedbackNotes.trim() || undefined
      });
      if (res.success) {
        setShowApproveModal(false);
        setDecisionSuccessMessage('Thank you! This creative proof has been officially approved for campaign deployment.');
        loadProof();
      }
    } catch (err: any) {
      alert('Approval failed: ' + err.message);
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverName.trim() || !feedbackNotes.trim() || !token) return;

    try {
      setSubmittingDecision(true);
      const res = await api.requestChangesPublicProof(token, {
        reviewerName: approverName.trim(),
        reviewerEmail: approverEmail.trim() || undefined,
        changeNotes: feedbackNotes.trim()
      });
      if (res.success) {
        setShowRequestChangesModal(false);
        setDecisionSuccessMessage('Your change requests have been sent directly to the creative design team.');
        loadProof();
      }
    } catch (err: any) {
      alert('Request failed: ' + err.message);
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

  return (
    <div className="min-h-screen bg-[#060B13] text-slate-100 font-sans flex flex-col selection:bg-[#DC2626] selection:text-white">
      {/* 1. Portal Header (Branded, No internal CRM nav) */}
      <header className="sticky top-0 z-40 bg-[#0B1424]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#DC2626] flex items-center justify-center text-white font-black text-xs shadow-md">
            OP
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isApproved ? (
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approved</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowRequestChangesModal(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Request</span> Changes
              </button>
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 transform active:scale-95"
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
                  setIsPlacingPin(!isPlacingPin);
                  setPendingPin(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${isPlacingPin ? 'bg-[#DC2626] text-white ring-2 ring-red-400' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
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
                <div className="text-xs font-bold text-blue-300">Drop Pin Annotation</div>
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                />
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
                    disabled={submittingComment || !authorName.trim() || !commentContent.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
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
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <span className="w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{c.author_name}</span>
                    </div>
                    {c.is_resolved && (
                      <span className="text-[10px] text-emerald-400 font-bold">Resolved ✓</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>

            {/* General Feedback input */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <input
                type="text"
                placeholder="Your Name (for comment)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#060B13] border border-slate-800 rounded-xl text-xs text-white"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add general note..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                  className="flex-1 px-3 py-1.5 bg-[#060B13] border border-slate-800 rounded-xl text-xs text-white"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={submittingComment || !authorName.trim() || !commentContent.trim()}
                  className="p-2 rounded-xl bg-[#DC2626] text-white disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
                <input
                  type="email"
                  required
                  placeholder="s.jenkins@clientcompany.com"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                />
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
                <input
                  type="email"
                  placeholder="s.jenkins@clientcompany.com"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B13] border border-slate-700 rounded-xl text-xs text-white"
                />
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
