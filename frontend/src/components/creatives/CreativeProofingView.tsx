'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  Palette,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Share2,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Upload,
  Play,
  Pause,
  Maximize2,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Check,
  X,
  FileText,
  SlidersHorizontal,
  LayoutGrid,
  Kanban as KanbanIcon,
  List,
  Sparkle,
  Film,
  Image as ImageIcon,
  BookOpen,
  ArrowUpRight,
  Link as LinkIcon,
  Lock,
  UserCheck,
  History,
  Send,
  Mail,
  FolderClosed,
  Building2,
  Download,
  CheckSquare,
  Unlink,
  Rocket
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { WatermarkOverlay } from '@/components/common/WatermarkOverlay';

interface CreativeProofingViewProps {
  onNavigate?: (tab: any, clientId?: string, clientName?: string) => void;
}

export const CreativeProofingView: React.FC<CreativeProofingViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [isDownloadingAsset, setIsDownloadingAsset] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // State
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [creatives, setCreatives] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'grid' | 'table'>('kanban');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedClientId, setSelectedClientId] = useState('ALL');

  // Studio / Inspection Modal
  const [activeCreativeId, setActiveCreativeId] = useState<string | null>(null);
  const [activeCreativeDetails, setActiveCreativeDetails] = useState<any | null>(null);
  const [activeProofIndex, setActiveProofIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [studioLoading, setStudioLoading] = useState(false);

  // Pin & Video Annotations State
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaContainerRef = useRef<HTMLDivElement | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCreativeId, setDeletingCreativeId] = useState<string | null>(null);
  const [deletingCreativeName, setDeletingCreativeName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareLinkData, setShareLinkData] = useState<any | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareRecipientEmail, setShareRecipientEmail] = useState('');
  const [shareRecipientName, setShareRecipientName] = useState('');
  const [sharePersonalMessage, setSharePersonalMessage] = useState('');
  const [isSendingShareEmail, setIsSendingShareEmail] = useState(false);
  const [shareEmailStatus, setShareEmailStatus] = useState<string | null>(null);

  // Link Task to Creative Modal State
  const [linkTaskModal, setLinkTaskModal] = useState<{
    isOpen: boolean;
    creative: any | null;
  }>({ isOpen: false, creative: null });
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isLinkingTask, setIsLinkingTask] = useState(false);

  // Create Form State (Client -> Project -> Task Hierarchy)
  const [createForm, setCreateForm] = useState({
    name: '',
    clientId: '',
    projectId: '',
    taskId: '',
    campaignName: '',
    targetPlatform: 'META',
    adFormat: 'IMAGE',
    aspectRatio: '1:1',
    primaryAdCopy: '',
    headline: '',
    callToAction: 'Learn More',
    destinationUrl: '',
    approvalDueAt: '',
    versionTitle: 'Initial Version (v1)',
    changeSummary: 'First draft delivery'
  });
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; assetType: string; preview: string; storageKey?: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load Data
  useEffect(() => {
    loadData();
    loadClientsAndProjects();
  }, [selectedPlatform, selectedFormat, selectedStatus, selectedClientId]);

  // When Client changes in create form, filter available projects
  useEffect(() => {
    if (createForm.clientId) {
      const filtered = allProjects.filter(p => p.client_id === createForm.clientId);
      setClientProjects(filtered);
    } else {
      setClientProjects([]);
    }
    setCreateForm(prev => ({ ...prev, projectId: '', taskId: '' }));
  }, [createForm.clientId, allProjects]);

  // When Project or Client changes in create form, load available tasks
  useEffect(() => {
    if (createForm.projectId) {
      api.getTasks({ projectId: createForm.projectId }).then(res => {
        if (res.success && Array.isArray(res.data)) {
          setProjectTasks(res.data);
        } else {
          setProjectTasks([]);
        }
      }).catch(() => setProjectTasks([]));
    } else if (createForm.clientId) {
      api.getTasks({ clientId: createForm.clientId }).then(res => {
        if (res.success && Array.isArray(res.data)) {
          setProjectTasks(res.data);
        } else {
          setProjectTasks([]);
        }
      }).catch(() => setProjectTasks([]));
    } else {
      setProjectTasks([]);
    }
    setCreateForm(prev => ({ ...prev, taskId: '' }));
  }, [createForm.projectId, createForm.clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsRes, creativesRes] = await Promise.all([
        api.getCreativeMetrics().catch(() => ({ success: false, metrics: null })),
        api.getCreatives({
          clientId: selectedClientId !== 'ALL' ? selectedClientId : undefined,
          platform: selectedPlatform !== 'ALL' ? selectedPlatform : undefined,
          format: selectedFormat !== 'ALL' ? selectedFormat : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          search: searchQuery || undefined
        }).catch(() => ({ success: false, creatives: [] }))
      ]);

      if (metricsRes.success && metricsRes.metrics) {
        setMetrics(metricsRes.metrics);
      }
      if (creativesRes.success && creativesRes.creatives) {
        setCreatives(creativesRes.creatives);
      }
    } catch (err) {
      console.error('Error loading creative data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClientsAndProjects = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        api.getClients().catch(() => ({ success: false, data: [] })),
        api.getProjects().catch(() => ({ success: false, data: [] }))
      ]);

      if (clientsRes.success && clientsRes.data) {
        setClients(clientsRes.data);
      }
      if (projectsRes.success && projectsRes.data) {
        setAllProjects(projectsRes.data);
      }
    } catch (err) {
      console.warn('Failed to load clients or projects dropdown:', err);
    }
  };

  // Open Creative Studio Inspector
  const handleOpenStudio = async (creativeId: string) => {
    try {
      setActiveCreativeId(creativeId);
      setStudioLoading(true);
      const res = await api.getCreativeDetails(creativeId);
      if (res.success) {
        setActiveCreativeDetails(res);
        setActiveProofIndex(0);
        setActiveSlideIndex(0);
      }
    } catch (err) {
      console.error('Failed to open creative details:', err);
    } finally {
      setStudioLoading(false);
    }
  };

  // Open Link Task Modal for a Creative
  const openLinkTaskModal = async (creative: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLinkTaskModal({ isOpen: true, creative });
    setTaskSearchQuery('');
    setLoadingTasks(true);
    try {
      const params: any = {};
      if (creative.project_id) {
        params.projectId = creative.project_id;
      } else if (creative.client_id) {
        params.clientId = creative.client_id;
      }
      const res = await api.getTasks(params);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAvailableTasks(res.data);
      } else {
        // Fallback: fetch all active tasks in organization
        const allRes = await api.getTasks();
        if (allRes.success && Array.isArray(allRes.data)) {
          setAvailableTasks(allRes.data);
        } else {
          setAvailableTasks([]);
        }
      }
    } catch (err) {
      console.error('Failed to load tasks for linking:', err);
      setAvailableTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Perform Link or Unlink of Task to Creative
  const handleLinkTask = async (taskId: string | null) => {
    if (!linkTaskModal.creative) return;
    const creativeId = linkTaskModal.creative.id;
    try {
      setIsLinkingTask(true);
      await api.linkCreativeToTask(creativeId, taskId);

      const targetTask = taskId ? availableTasks.find(t => t.id === taskId) : null;

      // Update in local creatives list
      setCreatives(prev => prev.map(c => {
        if (c.id === creativeId) {
          return {
            ...c,
            task_id: taskId || null,
            task_title: targetTask ? targetTask.title : (taskId ? c.task_title : null),
            task_status: targetTask ? targetTask.status : (taskId ? c.task_status : null),
            task_priority: targetTask ? targetTask.priority : (taskId ? c.task_priority : null),
            task_due_date: targetTask ? targetTask.due_date : (taskId ? c.task_due_date : null)
          };
        }
        return c;
      }));

      // Update in activeCreativeDetails if open
      if (activeCreativeDetails && activeCreativeDetails.creative.id === creativeId) {
        setActiveCreativeDetails((prev: any) => ({
          ...prev,
          creative: {
            ...prev.creative,
            task_id: taskId || null,
            task_title: targetTask ? targetTask.title : (taskId ? prev.creative.task_title : null),
            task_status: targetTask ? targetTask.status : (taskId ? prev.creative.task_status : null),
            task_priority: targetTask ? targetTask.priority : (taskId ? prev.creative.task_priority : null),
            task_due_date: targetTask ? targetTask.due_date : (taskId ? prev.creative.task_due_date : null)
          }
        }));
      }

      setLinkTaskModal({ isOpen: false, creative: null });
      loadData();
    } catch (err: any) {
      console.error('Failed to link task:', err);
      alert('Failed to link task: ' + (err.message || 'Error occurred'));
    } finally {
      setIsLinkingTask(false);
    }
  };

  // Update Creative Status (e.g. APPROVED -> DEPLOYMENT_READY -> LIVE)
  const handleUpdateStatus = async (creativeId: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      // Optimistic state update
      setCreatives(prev => prev.map(c => c.id === creativeId ? { ...c, status: newStatus } : c));
      if (activeCreativeDetails && activeCreativeDetails.creative?.id === creativeId) {
        setActiveCreativeDetails((prev: any) => ({
          ...prev,
          creative: { ...prev.creative, status: newStatus }
        }));
      }

      await api.updateCreative(creativeId, { status: newStatus });
      loadData();
    } catch (err: any) {
      console.error('Failed to update creative status:', err);
      alert('Failed to update status: ' + (err.message || 'Error updating status'));
      loadData();
    }
  };

  const currentProof = activeCreativeDetails?.proofs?.[activeProofIndex] || null;
  const currentAsset = currentProof?.assets?.[activeSlideIndex] || currentProof?.assets?.[0] || null;

  // Handle Canvas Click to drop Spatial Pin Annotation
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingPin || !mediaContainerRef.current) return;
    const rect = mediaContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
  };

  // Submit Pin / Video Comment
  const handleSaveComment = async () => {
    if (!newCommentText.trim() || !activeCreativeId || !currentProof) return;
    try {
      setSubmittingComment(true);
      await api.addCreativeComment(activeCreativeId, currentProof.id, {
        assetId: currentAsset?.id,
        content: newCommentText.trim(),
        pinXPercent: pendingPin?.x,
        pinYPercent: pendingPin?.y,
        timestampStartSeconds: currentAsset?.asset_type === 'VIDEO' ? videoCurrentTime : undefined
      });

      // Reload creative studio state
      const res = await api.getCreativeDetails(activeCreativeId);
      if (res.success) {
        setActiveCreativeDetails(res);
      }
      setNewCommentText('');
      setPendingPin(null);
      setIsPlacingPin(false);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Toggle Comment Resolve
  const handleToggleResolveComment = async (commentId: string, currentResolved: boolean) => {
    try {
      await api.resolveCreativeComment(commentId, !currentResolved);
      if (activeCreativeId) {
        const res = await api.getCreativeDetails(activeCreativeId);
        if (res.success) setActiveCreativeDetails(res);
      }
    } catch (err) {
      console.error('Failed to resolve comment:', err);
    }
  };

  // Delete Comment & Spatial Pin
  const handleDeleteComment = (commentId: string) => {
    setDeletingCommentId(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!deletingCommentId) return;
    try {
      await api.deleteCreativeComment(deletingCommentId);
      if (activeCreativeId) {
        const res = await api.getCreativeDetails(activeCreativeId);
        if (res.success) setActiveCreativeDetails(res);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Internal Approval Decision / Status Change
  const handleInternalDecision = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!activeCreativeId || !currentProof) return;
    const notes = prompt(
      decision === 'APPROVED' ? 'Enter optional approval notes:' : 'Enter revision notes requested from designer:'
    );
    if (decision === 'CHANGES_REQUESTED' && !notes) return;

    try {
      await api.submitInternalApproval(activeCreativeId, currentProof.id, {
        decision,
        feedbackNotes: notes || undefined
      });
      handleOpenStudio(activeCreativeId);
      loadData();
    } catch (err) {
      console.error('Approval submission failed:', err);
    }
  };

  // Delete Creative Confirmation Trigger
  const promptDeleteCreative = (creativeId: string, creativeName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingCreativeId(creativeId);
    setDeletingCreativeName(creativeName);
    setShowDeleteModal(true);
  };

  // Confirm Delete Creative
  const handleConfirmDelete = async () => {
    if (!deletingCreativeId) return;
    try {
      setIsDeleting(true);
      await api.deleteCreative(deletingCreativeId);
      setShowDeleteModal(false);
      if (activeCreativeId === deletingCreativeId) {
        setActiveCreativeId(null);
        setActiveCreativeDetails(null);
      }
      setDeletingCreativeId(null);
      loadData();
    } catch (err: any) {
      console.error('Delete creative failed:', err);
      alert('Delete failed: ' + (err.message || 'Error deleting creative'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Generate External Cryptographic Client Share Link
  const handleGenerateShareLink = async () => {
    if (!activeCreativeId || !currentProof) return;
    try {
      const res = await api.generateShareLink(activeCreativeId, currentProof.id, {
        expiresInDays: 14,
        allowComments: true,
        allowApprovals: true,
        requireOtp: true
      });
      if (res.success) {
        setShareLinkData(res.shareLink);
        setShareEmailStatus(null);
        setShowShareModal(true);
        loadData();
      }
    } catch (err) {
      console.error('Failed to generate share link:', err);
    }
  };

  // Direct Gmail Dispatch to Client
  const handleSendShareEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCreativeId || !currentProof?.id || !shareRecipientEmail.trim()) {
      alert('Please enter a valid client recipient email.');
      return;
    }

    try {
      setIsSendingShareEmail(true);
      setShareEmailStatus(null);
      const res = await api.sendProofEmailToClient(activeCreativeId, currentProof.id, {
        recipientEmail: shareRecipientEmail.trim(),
        recipientName: shareRecipientName.trim() || undefined,
        personalMessage: sharePersonalMessage.trim() || undefined,
      });

      if (res.success) {
        setShareEmailStatus(`Invitation dispatched to ${shareRecipientEmail.trim()} via Gmail!`);
        setTimeout(() => setShareEmailStatus(null), 5000);
      }
    } catch (err: any) {
      alert('Failed to send email: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSendingShareEmail(false);
    }
  };

  // User Permission Rule:
  // "nobody other than account manager, the one created the creative and owner should be able to download creatives. everybody else should get the version with watermark only"
  const canDownloadOriginal = (creative?: any, proof?: any) => {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    const isOwner = Boolean(user.isOwner || role === 'owner' || role === 'super_admin');
    const isAccountManager = Boolean(
      role === 'account_manager' ||
      (activeCreativeDetails?.creative?.client_account_manager_id && activeCreativeDetails.creative.client_account_manager_id === user.id) ||
      (creative?.account_manager_id && creative.account_manager_id === user.id)
    );
    const isCreator = Boolean(
      (creative?.created_by && user.id === creative.created_by) ||
      (creative?.designer_id && user.id === creative.designer_id) ||
      (proof?.uploaded_by && user.id === proof.uploaded_by) ||
      (proof?.created_by && user.id === proof.created_by)
    );
    return isOwner || isAccountManager || isCreator;
  };

  // Download asset (strictly enforcing watermarking for non-exempt users)
  const handleDownloadAsset = async (asset: any, forceWatermark = false) => {
    if (!asset?.id || !activeCreativeId || !currentProof?.id) return;

    const exempt = canDownloadOriginal(activeCreativeDetails?.creative, currentProof);
    const mode = (exempt && !forceWatermark) ? 'original' : 'watermarked';
    const fileName = asset.fileName || 'proof_asset';

    try {
      setIsDownloadingAsset(true);

      if (mode === 'original') {
        const a = document.createElement('a');
        a.href = asset.viewingUrl;
        a.download = fileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // Non-exempt users (everybody else) or if watermarked requested:
      // Request watermarked stream generated by backend watermark engine
      const token = localStorage.getItem('optivir_token');
      const res = await fetch(
        `${api.getBaseUrl()}/creatives/${activeCreativeId}/proofs/${currentProof.id}/assets/${asset.id}/download?mode=watermarked`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to generate watermarked file (${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const isVideo = asset.asset_type === 'VIDEO' || asset.assetType === 'VIDEO';
      const ext = isVideo ? '.mp4' : (asset.mimeType?.includes('png') ? '.png' : '.jpg');
      const safeName = fileName.replace(/\.[^/.]+$/, '');
      a.download = `WATERMARKED_${safeName}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Unable to generate watermarked proof file. Please try again.');
    } finally {
      setIsDownloadingAsset(false);
    }
  };

  // Handle Direct Upload to Cloudflare R2
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newUploads: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const preview = URL.createObjectURL(file);
      newUploads.push({
        file,
        assetType: isVideo ? 'VIDEO' : 'IMAGE',
        preview
      });
    }
    setUploadedFiles(prev => [...prev, ...newUploads]);
  };

  // Submit Creative Creation Form
  const handleSubmitCreateCreative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // 1. Upload files directly to Cloudflare R2 via Backend Streaming (Bypasses browser CORS & supports large files up to 500MB)
      const processedAssets: any[] = [];
      const totalFiles = uploadedFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const item = uploadedFiles[i];

        const uploadRes = await api.uploadCreativeAssetDirect(
          item.file,
          {
            assetType: createForm.adFormat === 'CAROUSEL' ? 'CAROUSEL_SLIDE' : item.assetType,
            slideOrder: i + 1,
            versionNumber: 1
          },
          (filePercent) => {
            const baseProgress = 10 + Math.round((i / totalFiles) * 75);
            const chunkProgress = Math.round((filePercent / 100) * (75 / totalFiles));
            setUploadProgress(Math.min(85, baseProgress + chunkProgress));
          }
        );

        if (!uploadRes.success || !uploadRes.storageKey) {
          throw new Error(`Failed to upload ${item.file.name}`);
        }

        processedAssets.push({
          storageKey: uploadRes.storageKey,
          fileName: uploadRes.fileName || item.file.name,
          fileSizeBytes: uploadRes.fileSizeBytes || item.file.size,
          mimeType: uploadRes.mimeType || item.file.type || 'image/jpeg',
          assetType: createForm.adFormat === 'CAROUSEL' ? 'CAROUSEL_SLIDE' : item.assetType,
          slideOrder: i + 1
        });
      }

      setUploadProgress(85);

      // 2. Register Creative & Initial Proof on Backend (Client -> Project cascade)
      await api.createCreative({
        clientId: createForm.clientId || undefined,
        projectId: createForm.projectId || undefined,
        taskId: createForm.taskId || undefined,
        name: createForm.name.trim(),
        campaignName: createForm.campaignName || undefined,
        targetPlatform: createForm.targetPlatform,
        adFormat: createForm.adFormat,
        aspectRatio: createForm.aspectRatio,
        primaryAdCopy: createForm.primaryAdCopy || undefined,
        headline: createForm.headline || undefined,
        callToAction: createForm.callToAction || undefined,
        destinationUrl: createForm.destinationUrl || undefined,
        approvalDueAt: createForm.approvalDueAt || undefined,
        initialProof: processedAssets.length > 0 ? {
          title: createForm.versionTitle || 'Initial Version (v1)',
          changeSummary: createForm.changeSummary || 'Initial creative upload',
          assets: processedAssets
        } : undefined
      });

      setUploadProgress(100);
      setShowCreateModal(false);
      setUploadedFiles([]);
      setCreateForm({
        name: '',
        clientId: '',
        projectId: '',
        taskId: '',
        campaignName: '',
        targetPlatform: 'META',
        adFormat: 'IMAGE',
        aspectRatio: '1:1',
        primaryAdCopy: '',
        headline: '',
        callToAction: 'Learn More',
        destinationUrl: '',
        approvalDueAt: '',
        versionTitle: 'Initial Version (v1)',
        changeSummary: 'First draft delivery'
      });
      loadData();
    } catch (err: any) {
      console.error('Creative creation failed:', err);
      alert('Upload failed: ' + (err.message || 'Error uploading creative assets'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'DEPLOYMENT_READY':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Ready for Ads</span>;
      case 'PENDING_CLIENT_APPROVAL':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Client Review</span>;
      case 'CHANGES_REQUESTED':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Revisions Req.</span>;
      case 'INTERNAL_REVIEW':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5"><Eye className="w-3 h-3" /> Internal Review</span>;
      case 'LIVE':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Live Campaign</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 flex items-center gap-1.5"><SlidersHorizontal className="w-3 h-3" /> Draft</span>;
    }
  };

  // Kanban Columns
  const kanbanColumns = [
    { id: 'DRAFT', label: 'Draft & Creation', color: 'border-slate-400' },
    { id: 'INTERNAL_REVIEW', label: 'Internal Review', color: 'border-purple-500' },
    { id: 'PENDING_CLIENT_APPROVAL', label: 'Pending Client Approval', color: 'border-amber-500' },
    { id: 'CHANGES_REQUESTED', label: 'Changes Requested', color: 'border-rose-500' },
    { id: 'APPROVED', label: 'Client Approved', color: 'border-emerald-500' },
    { id: 'DEPLOYMENT_READY', label: 'Deployment Ready', color: 'border-blue-500' },
    { id: 'LIVE', label: 'Live Campaigns', color: 'border-cyan-500' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* 1. Header & KPI Metrics Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#DC2626]/20">
              Cloudflare R2 Private Storage
            </span>
            <span className="text-xs text-slate-500 font-medium">• Multi-Tenant & Client Scoped</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Creative Studio & Client Proofing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Client $\to$ Project ad creative management, spatial annotations, video timestamps & R2 proofs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Creative Proof</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Creatives</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.totalCreatives}</div>
            <div className="text-[11px] text-slate-400 mt-1">Assigned accounts</div>
          </div>
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pending Approval</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics.pendingClientApproval}</div>
            <div className="text-[11px] text-slate-400 mt-1">With clients</div>
          </div>
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Client Approved</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics.approved}</div>
            <div className="text-[11px] text-emerald-500/80 font-medium mt-1">Signed off</div>
          </div>
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Revisions Req.</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{metrics.changesRequested}</div>
            <div className="text-[11px] text-slate-400 mt-1">Feedback logged</div>
          </div>
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Approval Rate</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{metrics.approvalRate}%</div>
            <div className="text-[11px] text-slate-400 mt-1">First-pass accuracy</div>
          </div>
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Overdue SLAs</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{metrics.overdue}</div>
            <div className="text-[11px] text-slate-400 mt-1">Past target date</div>
          </div>
        </div>
      )}

      {/* 2. Controls & Filters Bar */}
      <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by creative title, client, or campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Client Filter */}
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.company_name || c.name || 'Unnamed Client'}</option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Platforms</option>
              <option value="META">Meta (FB/IG)</option>
              <option value="GOOGLE_ADS">Google Ads</option>
              <option value="TIKTOK">TikTok</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="YOUTUBE">YouTube</option>
            </select>

            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Formats</option>
              <option value="IMAGE">Single Image</option>
              <option value="VIDEO">Video / UGC Reel</option>
              <option value="CAROUSEL">Carousel Slides</option>
              <option value="COPY_ONLY">Ad Copy Only</option>
              <option value="BANNER">Banner Display</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${viewMode === 'kanban' ? 'bg-white dark:bg-[#0B1424] text-[#DC2626] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                title="Kanban Board View"
              >
                <KanbanIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${viewMode === 'grid' ? 'bg-white dark:bg-[#0B1424] text-[#DC2626] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${viewMode === 'table' ? 'bg-white dark:bg-[#0B1424] text-[#DC2626] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Views: Kanban vs Grid vs Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Fetching creative assets & proofs from Cloudflare R2...</p>
        </div>
      ) : creatives.length === 0 ? (
        <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-[#DC2626] mx-auto flex items-center justify-center">
            <Palette className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Creative Proofs Found</h3>
            <p className="text-xs text-slate-500">
              Start building client ad creatives, reels, carousels, and upload directly to Cloudflare R2 for client approval.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            Create First Proof Version
          </button>
        </div>
      ) : (
        <>
          {/* VIEW: KANBAN BOARD */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
              {kanbanColumns.map(col => {
                const columnCreatives = creatives.filter(c => c.status === col.id);
                return (
                  <div key={col.id} className="flex flex-col bg-slate-100/70 dark:bg-[#080E1A]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 min-w-[260px]">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.color.replace('border', 'bg')}`} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{col.label}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {columnCreatives.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar pr-1">
                      {columnCreatives.map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleOpenStudio(c.id)}
                          className="group bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#0F1C33] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs hover:shadow-md transition cursor-pointer space-y-2.5 relative"
                        >
                          {/* Media Thumbnail Preview */}
                          {c.previewUrl ? (
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900">
                              {c.ad_format === 'VIDEO' ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white relative">
                                  <video
                                    src={c.previewUrl}
                                    controlsList="nodownload"
                                    onContextMenu={(e) => e.preventDefault()}
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:scale-110 transition">
                                    <Play className="w-6 h-6 text-white drop-shadow-md" />
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={c.previewUrl}
                                  alt={c.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              )}
                              <WatermarkOverlay size="sm" />
                              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold z-20">
                                {c.active_version ? `v${c.active_version}` : 'v1'}
                              </span>
                            </div>
                          ) : (
                            <div className="aspect-video w-full rounded-lg bg-slate-100 dark:bg-slate-800/60 flex flex-col items-center justify-center text-slate-400 gap-1">
                              <ImageIcon className="w-6 h-6" />
                              <span className="text-[10px] font-medium">No Preview</span>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              <span>{c.target_platform}</span>
                              <span>•</span>
                              <span>{c.ad_format}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#DC2626] transition">
                              {c.name}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 line-clamp-1">
                              <span>{c.client_name || 'Internal Agency Ad'}</span>
                              {c.project_name && <span>• {c.project_name}</span>}
                            </div>
                          </div>

                          {/* Linked Task Deliverable Badge */}
                          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                            {c.task_title ? (
                              <button
                                onClick={(e) => openLinkTaskModal(c, e)}
                                title={`Linked Deliverable: ${c.task_title} (Click to change/unlink)`}
                                className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold transition group/task text-left"
                              >
                                <CheckSquare className="w-3 h-3 shrink-0 text-[#DC2626]" />
                                <span className="truncate flex-1">{c.task_title}</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => openLinkTaskModal(c, e)}
                                title="Link this creative to a project task deliverable"
                                className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-[#DC2626] transition py-0.5"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                <span>Link Task</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                            <div className="flex items-center gap-1 text-slate-400">
                              <MessageSquare className="w-3 h-3" />
                              <span>{c.unresolved_comments_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {getStatusBadge(c.status)}
                              <button
                                onClick={(e) => promptDeleteCreative(c.id, c.name, e)}
                                title="Delete Creative"
                                className="p-1 text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Advance Action on Kanban Card */}
                          {c.status === 'APPROVED' && (
                            <button
                              onClick={(e) => handleUpdateStatus(c.id, 'DEPLOYMENT_READY', e)}
                              className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-xs transition transform active:scale-95 cursor-pointer"
                              title="Advance to Deployment Ready (Ready for Ads deployment)"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Move to Deployment Ready →</span>
                            </button>
                          )}

                          {c.status === 'DEPLOYMENT_READY' && (
                            <div className="mt-2 space-y-1.5">
                              <button
                                onClick={(e) => handleUpdateStatus(c.id, 'LIVE', e)}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-xs transition transform active:scale-95 cursor-pointer"
                                title="Mark as Live in ad campaign"
                              >
                                <Rocket className="w-3.5 h-3.5" />
                                <span>Mark Live Campaign →</span>
                              </button>
                              <button
                                onClick={(e) => handleUpdateStatus(c.id, 'APPROVED', e)}
                                className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-[10px] transition cursor-pointer"
                                title="Revert to Client Approved"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Revert to Approved</span>
                              </button>
                            </div>
                          )}

                          {c.status === 'LIVE' && (
                            <button
                              onClick={(e) => handleUpdateStatus(c.id, 'DEPLOYMENT_READY', e)}
                              className="w-full mt-2 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] shadow-2xs transition transform active:scale-95 cursor-pointer"
                              title="Revert back to Deployment Ready"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Revert to Deployment Ready</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW: GRID CARDS */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {creatives.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleOpenStudio(c.id)}
                  className="group bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#0F1C33] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col relative"
                >
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    {c.previewUrl ? (
                      c.ad_format === 'VIDEO' ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white relative">
                          <video
                            src={c.previewUrl}
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                            className="w-full h-full object-cover pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:scale-110 transition">
                            <Play className="w-8 h-8 text-white drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={c.previewUrl}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 bg-slate-100 dark:bg-slate-800/60">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs font-medium">No media uploaded</span>
                      </div>
                    )}
                    {c.previewUrl && <WatermarkOverlay size="sm" />}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20">
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                        {c.target_platform}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                        {c.ad_format}
                      </span>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#DC2626] text-white text-[10px] font-bold shadow-xs">
                      v{c.active_version || 1}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400">
                        {c.client_name || 'Direct Brand'} {c.project_name && `• ${c.project_name}`}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#DC2626] transition">
                        {c.name}
                      </h3>
                      {c.primary_ad_copy && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 italic">
                          "{c.primary_ad_copy}"
                        </p>
                      )}

                      {/* Linked Task Row on Grid Card */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                        {c.task_title ? (
                          <button
                            onClick={(e) => openLinkTaskModal(c, e)}
                            title={`Linked Deliverable: ${c.task_title} (Click to change/unlink)`}
                            className="w-full flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition text-left"
                          >
                            <CheckSquare className="w-3.5 h-3.5 shrink-0 text-[#DC2626]" />
                            <span className="truncate flex-1">{c.task_title}</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => openLinkTaskModal(c, e)}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-[#DC2626] transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Link Task Deliverable</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {c.unresolved_comments_count || 0}
                        </span>
                        <span>•</span>
                        <span>{c.version_count || 1} versions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(c.status)}
                        <button
                          onClick={(e) => promptDeleteCreative(c.id, c.name, e)}
                          title="Delete Creative"
                          className="p-1 text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Advance Action on Grid Card */}
                    {c.status === 'APPROVED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(c.id, 'DEPLOYMENT_READY', e);
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-xs transition transform active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Move to Deployment Ready →</span>
                      </button>
                    )}

                    {c.status === 'DEPLOYMENT_READY' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(c.id, 'LIVE', e);
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-xs transition transform active:scale-95 cursor-pointer"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Mark Live Campaign →</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW: TABLE */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Creative Name</th>
                      <th className="py-3 px-4">Client & Project</th>
                      <th className="py-3 px-4">Deliverable Task</th>
                      <th className="py-3 px-4">Platform & Format</th>
                      <th className="py-3 px-4">Active Version</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Comments</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {creatives.map(c => (
                      <tr
                        key={c.id}
                        onClick={() => handleOpenStudio(c.id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative">
                            {c.previewUrl ? (
                              <>
                                {c.ad_format === 'VIDEO' || c.previewUrl.match(/\.(mp4|mov|webm|avi|mkv)($|\?)/i) ? (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-950 relative">
                                    <video
                                      src={c.previewUrl}
                                      controlsList="nodownload"
                                      onContextMenu={(e) => e.preventDefault()}
                                      className="w-full h-full object-cover pointer-events-none"
                                      muted
                                      playsInline
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <Play className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <img src={c.previewUrl} alt={c.name} className="w-full h-full object-cover" />
                                )}
                                <WatermarkOverlay size="xs" />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div>{c.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{c.campaign_name || 'No campaign'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          <div>{c.client_name || 'Agency Ad'}</div>
                          {c.project_name && <div className="text-[11px] text-slate-400 font-normal">{c.project_name}</div>}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {c.task_title ? (
                            <button
                              onClick={(e) => openLinkTaskModal(c, e)}
                              title={`Linked Deliverable: ${c.task_title} (Click to change/unlink)`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition max-w-[180px] truncate"
                            >
                              <CheckSquare className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                              <span className="truncate">{c.task_title}</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => openLinkTaskModal(c, e)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-[#DC2626] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Link Task</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {c.target_platform} • {c.ad_format}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                          v{c.active_version || 1}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            {c.unresolved_comments_count || 0} open
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {c.status === 'APPROVED' && (
                              <button
                                onClick={(e) => handleUpdateStatus(c.id, 'DEPLOYMENT_READY', e)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Advance to Deployment Ready"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Deploy</span>
                              </button>
                            )}
                            {c.status === 'DEPLOYMENT_READY' && (
                              <button
                                onClick={(e) => handleUpdateStatus(c.id, 'LIVE', e)}
                                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Mark Live Campaign"
                              >
                                <Rocket className="w-3 h-3" />
                                <span>Live</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenStudio(c.id)}
                              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#DC2626] hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Open Studio
                            </button>
                            <button
                              onClick={(e) => promptDeleteCreative(c.id, c.name, e)}
                              title="Delete Creative"
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. CREATIVE PROOFING STUDIO MODAL (CANVAS + PIN ANNOTATIONS + VIDEO SCRUBBER) */}
      {/* ========================================================================= */}
      {activeCreativeId && activeCreativeDetails && isMounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-hidden animate-fade-in">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-7xl h-[94vh] max-h-[calc(100vh-2rem)] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-[#070D18]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {activeCreativeDetails.creative.name}
                    </h2>
                    <select
                      value={activeCreativeDetails.creative.status}
                      onChange={(e) => handleUpdateStatus(activeCreativeDetails.creative.id, e.target.value)}
                      className="text-[11px] font-bold py-1 px-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer hover:border-blue-500 transition shadow-2xs"
                      title="Change Creative Status"
                    >
                      <option value="DRAFT">Draft & Creation</option>
                      <option value="INTERNAL_REVIEW">Internal Review</option>
                      <option value="PENDING_CLIENT_APPROVAL">Pending Client Approval</option>
                      <option value="CHANGES_REQUESTED">Changes Requested</option>
                      <option value="APPROVED">Client Approved</option>
                      <option value="DEPLOYMENT_READY">Deployment Ready</option>
                      <option value="LIVE">Live Campaign</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                    <span>Client: <strong>{activeCreativeDetails.creative.client_name || 'Internal'}</strong></span>
                    {activeCreativeDetails.creative.project_name && (
                      <>
                        <span>•</span>
                        <span>Project: <strong>{activeCreativeDetails.creative.project_name}</strong></span>
                      </>
                    )}
                    {activeCreativeDetails.creative.task_title && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                          <CheckSquare className="w-3 h-3" />
                          <span>Task: {activeCreativeDetails.creative.task_title}</span>
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>Platform: <strong>{activeCreativeDetails.creative.target_platform}</strong></span>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeCreativeDetails.creative.status === 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(activeCreativeDetails.creative.id, 'DEPLOYMENT_READY')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    title="Advance to Deployment Ready"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mark Deployment Ready</span>
                  </button>
                )}
                {activeCreativeDetails.creative.status === 'DEPLOYMENT_READY' && (
                  <button
                    onClick={() => handleUpdateStatus(activeCreativeDetails.creative.id, 'LIVE')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    title="Mark campaign as Live"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Launch Live Campaign</span>
                  </button>
                )}
                <button
                  onClick={() => openLinkTaskModal(activeCreativeDetails.creative)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs hover:border-[#DC2626] hover:text-[#DC2626] cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>{activeCreativeDetails.creative.task_id ? 'Change Linked Task' : 'Link Task Deliverable'}</span>
                </button>
                {activeCreativeDetails.creative.task_id && onNavigate && (
                  <button
                    onClick={() => {
                      setActiveCreativeId(null);
                      setActiveCreativeDetails(null);
                      onNavigate('tasks');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition shadow-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
                    <span>View Task</span>
                  </button>
                )}
                {currentAsset?.viewingUrl && (
                  canDownloadOriginal(activeCreativeDetails.creative, currentProof) ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDownloadAsset(currentAsset, false)}
                        disabled={isDownloadingAsset}
                        title="Download Original Clean File (Owner, Account Manager & Creator Only)"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Original</span>
                      </button>
                      <button
                        onClick={() => handleDownloadAsset(currentAsset, true)}
                        disabled={isDownloadingAsset}
                        title="Download Watermarked Proof Version"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>Watermarked</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownloadAsset(currentAsset, true)}
                      disabled={isDownloadingAsset}
                      title="Download Proof (Watermark Protected)"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isDownloadingAsset ? (
                        <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>{isDownloadingAsset ? 'Watermarking Proof...' : 'Download Proof (Watermarked)'}</span>
                    </button>
                  )
                )}
                <button
                  onClick={handleGenerateShareLink}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Client Share Link</span>
                </button>
                <button
                  onClick={() => handleInternalDecision('APPROVED')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Proof</span>
                </button>
                <button
                  onClick={() => handleInternalDecision('CHANGES_REQUESTED')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Changes</span>
                </button>
                <button
                  onClick={() => promptDeleteCreative(activeCreativeDetails.creative.id, activeCreativeDetails.creative.name)}
                  title="Delete Creative"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveCreativeId(null);
                    setActiveCreativeDetails(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Left = Canvas & Scrubber, Right = Comments & Version History */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* LEFT: MEDIA CANVAS & INTERACTIVE PINS */}
              <div className="flex-1 bg-slate-950 flex flex-col items-center justify-between p-4 overflow-hidden relative">
                {/* Version switcher pill and Toolbar on canvas */}
                <div className="w-full flex items-center justify-between z-10 text-white text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Version:</span>
                    <div className="flex items-center bg-slate-900/80 backdrop-blur-md rounded-lg p-0.5 border border-slate-800">
                      {activeCreativeDetails.proofs.map((p: any, idx: number) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveProofIndex(idx);
                            setActiveSlideIndex(0);
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${activeProofIndex === idx ? 'bg-[#DC2626] text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          v{p.version_number}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canvas Controls: Watermark Toggle + Pin Drop Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowWatermark(!showWatermark)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${showWatermark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'}`}
                      title="Toggle Preview Watermark"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{showWatermark ? 'Watermark: ON' : 'Watermark: OFF'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsPlacingPin(!isPlacingPin);
                        setPendingPin(null);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${isPlacingPin ? 'bg-[#DC2626] text-white ring-2 ring-red-400' : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isPlacingPin ? 'Click canvas to drop pin' : 'Place Pin Annotation'}</span>
                    </button>
                  </div>
                </div>

                {/* Media Container with Spatial Coordinates */}
                <div className="flex-1 flex items-center justify-center w-full my-2 relative overflow-hidden">
                  <div
                    ref={mediaContainerRef}
                    onClick={handleCanvasClick}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className={`relative max-w-full max-h-[60vh] rounded-xl overflow-hidden shadow-2xl bg-black flex items-center justify-center select-none ${isPlacingPin ? 'cursor-crosshair ring-2 ring-red-500' : ''}`}
                  >
                    {/* Render Image or Video */}
                    {currentAsset?.asset_type === 'VIDEO' ? (
                      <video
                        ref={videoRef}
                        src={currentAsset.viewingUrl}
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        className="max-h-[60vh] max-w-full object-contain rounded-xl select-none"
                        onTimeUpdate={() => setVideoCurrentTime(videoRef.current?.currentTime || 0)}
                        onLoadedMetadata={() => setVideoDuration(videoRef.current?.duration || 0)}
                      />
                    ) : currentAsset?.viewingUrl ? (
                      <img
                        src={currentAsset.viewingUrl}
                        alt="Proof version"
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        className="max-h-[60vh] max-w-full object-contain rounded-xl select-none pointer-events-none"
                      />
                    ) : (
                      <div className="p-16 text-center text-slate-400 space-y-2">
                        <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
                        <p className="text-xs">No visual asset attached to this version</p>
                      </div>
                    )}

                    {/* Simple, Non-Intrusive Professional Watermark */}
                    {showWatermark && <WatermarkOverlay size="lg" className="z-20" />}

                    {/* Render Existing Spatial Pin Markers */}
                    {currentProof?.comments
                      ?.filter((c: any) => c.pin_x_percent !== null && c.pin_y_percent !== null)
                      .map((comment: any, idx: number) => (
                        <div
                          key={comment.id}
                          style={{
                            left: `${comment.pin_x_percent}%`,
                            top: `${comment.pin_y_percent}%`
                          }}
                          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-lg ring-2 ring-white transition transform hover:scale-125 cursor-pointer ${comment.is_resolved ? 'bg-emerald-600 text-white opacity-70' : 'bg-[#DC2626] text-white'}`}
                          title={`${comment.author_name}: ${comment.content}`}
                        >
                          {idx + 1}
                        </div>
                      ))}

                    {/* Render Pending Pin */}
                    {pendingPin && (
                      <div
                        style={{
                          left: `${pendingPin.x}%`,
                          top: `${pendingPin.y}%`
                        }}
                        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xl ring-2 ring-white animate-bounce"
                      >
                        ?
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Scrubber & Playback Controls (If Video Asset) */}
                {currentAsset?.asset_type === 'VIDEO' && (
                  <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-800 space-y-2 text-white">
                    <div className="flex items-center gap-3">
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
                        className="p-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white transition cursor-pointer"
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
                          const time = parseFloat(e.target.value);
                          setVideoCurrentTime(time);
                          if (videoRef.current) videoRef.current.currentTime = time;
                        }}
                        className="flex-1 accent-[#DC2626] cursor-pointer"
                      />

                      <span className="text-xs font-mono text-slate-300">
                        {videoCurrentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                )}

                {/* Carousel Slides Strip (If Carousel Asset) */}
                {currentProof?.assets?.length > 1 && (
                  <div className="w-full flex items-center justify-center gap-2 pt-2 overflow-x-auto">
                    {currentProof.assets.map((asset: any, idx: number) => (
                      <button
                        key={asset.id}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition ${activeSlideIndex === idx ? 'border-[#DC2626] scale-110' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                      >
                        <img src={asset.thumbnailUrl || asset.viewingUrl} alt="Slide" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 right-0 px-1 text-[9px] font-bold bg-black/80 text-white">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: COMMENTS THREADS & METADATA DRAWER */}
              <div className="w-full lg:w-96 bg-white dark:bg-[#0B1424] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                {/* Deliverable Task Section in Studio Sidebar */}
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070D18]/90 space-y-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <CheckSquare className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Deliverable Task</span>
                    </div>
                    <button
                      onClick={() => openLinkTaskModal(activeCreativeDetails.creative)}
                      className="text-[11px] font-bold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{activeCreativeDetails.creative.task_id ? 'Change' : 'Link Task'}</span>
                    </button>
                  </div>

                  {activeCreativeDetails.creative.task_id ? (
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-2 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-slate-400">
                            #{activeCreativeDetails.creative.task_id.slice(0, 6).toUpperCase()}
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {activeCreativeDetails.creative.task_title || 'Linked Deliverable Task'}
                          </div>
                        </div>
                        {activeCreativeDetails.creative.task_priority && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            {activeCreativeDetails.creative.task_priority}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                        {onNavigate && (
                          <button
                            onClick={() => {
                              setActiveCreativeId(null);
                              setActiveCreativeDetails(null);
                              onNavigate('tasks');
                            }}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open in Tasks</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleLinkTask(null)}
                          className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Unlink className="w-3 h-3" />
                          <span>Unlink</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2 bg-white/50 dark:bg-slate-900/40">
                      <span className="text-[11px] text-slate-400">No task linked to this creative</span>
                      <button
                        onClick={() => openLinkTaskModal(activeCreativeDetails.creative)}
                        className="px-2.5 py-1 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Link Task</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#070D18]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#DC2626]" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Annotations & Feedback ({currentProof?.comments?.length || 0})
                    </h3>
                  </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                  {/* Pending Comment Composer */}
                  {pendingPin && (
                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-bold">
                        <span>New Pin Annotation at ({pendingPin.x}%, {pendingPin.y}%)</span>
                        <button onClick={() => setPendingPin(null)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        placeholder="Type feedback for this pinned location..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        rows={3}
                        className="w-full p-2 bg-white dark:bg-[#060B13] border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setPendingPin(null)}
                          className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveComment}
                          disabled={submittingComment || !newCommentText.trim()}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                        >
                          Save Annotation
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {currentProof?.comments?.length === 0 && !pendingPin && (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-xs">No feedback or pins on this version yet.</p>
                      <p className="text-[11px] text-slate-500">Click "Place Pin Annotation" on the canvas to add one.</p>
                    </div>
                  )}

                  {/* Existing Comments */}
                  {currentProof?.comments?.map((c: any, idx: number) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border transition ${c.is_resolved ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-[#070D18] border-slate-200 dark:border-slate-800'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {c.author_name}
                          </span>
                          {c.author_email && (
                            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                              ({c.author_email})
                            </span>
                          )}
                          {c.is_client_comment && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Client
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleResolveComment(c.id, c.is_resolved)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${c.is_resolved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500'}`}
                          >
                            {c.is_resolved ? 'Resolved ✓' : 'Mark Resolved'}
                          </button>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                            title="Delete Annotation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 whitespace-pre-wrap">
                        {c.content}
                      </p>

                      {c.timestamp_start_seconds !== null && (
                        <div className="mt-2 text-[10px] font-mono text-blue-500 font-semibold flex items-center gap-1">
                          <Play className="w-2.5 h-2.5" />
                          <span>At {parseFloat(c.timestamp_start_seconds).toFixed(1)}s</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Simple Comment Input (Without pin) */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D18]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add general comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveComment()}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
                    />
                    <button
                      onClick={handleSaveComment}
                      disabled={submittingComment || !newCommentText.trim()}
                      className="p-2 rounded-xl bg-[#DC2626] text-white hover:bg-[#B91C1C] transition disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 5. CREATE NEW CREATIVE PROOF MODAL (Client -> Project Hierarchy) */}
      {/* ========================================================================= */}
      {showCreateModal && isMounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Ad Creative Proof</h3>
                  <p className="text-xs text-slate-500">Assign to client & project, then stream directly to Cloudflare R2</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateCreative} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Creative Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer UGC Hook 01"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Client -> Project -> Task Hierarchy Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Client Account *
                  </label>
                  <select
                    required
                    value={createForm.clientId}
                    onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Select client account...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project (Optional)
                  </label>
                  <select
                    value={createForm.projectId}
                    disabled={!createForm.clientId}
                    onChange={(e) => setCreateForm({ ...createForm, projectId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">
                      {!createForm.clientId
                        ? 'Select client first'
                        : clientProjects.length === 0
                          ? 'No projects found'
                          : 'Select project...'}
                    </option>
                    {clientProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Linked Task (Optional)
                  </label>
                  <select
                    value={createForm.taskId}
                    disabled={!createForm.clientId && !createForm.projectId}
                    onChange={(e) => setCreateForm({ ...createForm, taskId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">
                      {!createForm.clientId
                        ? 'Select client first'
                        : projectTasks.length === 0
                          ? 'No tasks found'
                          : 'Select task deliverable...'}
                    </option>
                    {projectTasks.map(t => (
                      <option key={t.id} value={t.id}>
                        #{t.id.slice(0, 4).toUpperCase()} • {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Platform</label>
                  <select
                    value={createForm.targetPlatform}
                    onChange={(e) => setCreateForm({ ...createForm, targetPlatform: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="META">Meta (FB & IG)</option>
                    <option value="GOOGLE_ADS">Google Ads</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="ALL">Omni-Platform</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ad Format</label>
                  <select
                    value={createForm.adFormat}
                    onChange={(e) => setCreateForm({ ...createForm, adFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="IMAGE">Single Image</option>
                    <option value="VIDEO">Video / Reel (MP4)</option>
                    <option value="CAROUSEL">Carousel Slides</option>
                    <option value="COPY_ONLY">Ad Copy Only</option>
                    <option value="BANNER">Banner Display</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aspect Ratio</label>
                  <select
                    value={createForm.aspectRatio}
                    onChange={(e) => setCreateForm({ ...createForm, aspectRatio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="1:1">1:1 (Square Feed)</option>
                    <option value="9:16">9:16 (Story / Reel)</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="4:5">4:5 (Portrait Feed)</option>
                  </select>
                </div>
              </div>

              {/* Ad Copy Fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Ad Copy</label>
                  <textarea
                    rows={2}
                    placeholder="Enter main caption / body copy..."
                    value={createForm.primaryAdCopy}
                    onChange={(e) => setCreateForm({ ...createForm, primaryAdCopy: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. 50% Off First Month"
                      value={createForm.headline}
                      onChange={(e) => setCreateForm({ ...createForm, headline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Call to Action (CTA)</label>
                    <input
                      type="text"
                      placeholder="e.g. Shop Now, Get Quote"
                      value={createForm.callToAction}
                      onChange={(e) => setCreateForm({ ...createForm, callToAction: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* R2 Direct Upload Dropzone */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Creative Asset Files (Direct Cloudflare R2 Upload)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#DC2626] rounded-2xl p-6 text-center space-y-2 bg-slate-50/50 dark:bg-[#060B13]/50 transition cursor-pointer relative">
                  <input
                    type="file"
                    multiple={createForm.adFormat === 'CAROUSEL'}
                    accept={createForm.adFormat === 'VIDEO' ? 'video/mp4,video/quicktime' : 'image/*'}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#DC2626] mx-auto" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Click or drag & drop asset files here
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Direct Cloudflare R2 presigned PUT streaming (Images, Reels up to 500MB, Carousel slides)
                  </p>
                </div>

                {/* Uploaded Files Previews */}
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {uploadedFiles.map((item, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 group">
                        {item.assetType === 'VIDEO' ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[10px]">
                            <Film className="w-4 h-4" />
                          </div>
                        ) : (
                          <img src={item.preview} alt="Upload" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                          className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 bg-black/80 text-white text-[9px] px-1 font-bold">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Streaming to Cloudflare R2...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#DC2626] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading to R2...</span>
                    </>
                  ) : (
                    <span>Create & Register Proof</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 6. DELETE CREATIVE CONFIRMATION MODAL (R2 Assets Cleanup) */}
      {/* ========================================================================= */}
      {showDeleteModal && isMounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Creative & Purge Proofs</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{deletingCreativeName}"</strong>? This will purge all proof versions, spatial pin annotations, client sign-offs, and automatically delete all associated media files from Cloudflare R2.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCreativeId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Purging R2 Assets...</span>
                  </>
                ) : (
                  <span>Permanently Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 7. CLIENT SHARE LINK MODAL (Cryptographic SHA-256 Hashed URL) */}
      {/* ========================================================================= */}
      {showShareModal && shareLinkData && isMounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Client Proofing Portal Link</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Share this secure, cryptographic link with your client. They will see only the clean proofing viewer without internal CRM access, and can drop pin comments and legally approve.
            </p>

            <div className="bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <input
                type="text"
                readOnly
                value={shareLinkData.shareUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLinkData.shareUrl);
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-bold shrink-0 transition cursor-pointer"
              >
                {shareCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected with Client Email OTP</span>
              </span>
              <a
                href={shareLinkData.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Preview Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Direct Send via Gmail Section */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Mail className="w-4 h-4 text-rose-500" />
                  <span>Send Direct Invitation via Gmail</span>
                </div>
                <span className="text-[10px] text-slate-400">Notifies Team on Activity</span>
              </div>

              {shareEmailStatus && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{shareEmailStatus}</span>
                </div>
              )}

              <form onSubmit={handleSendShareEmail} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    required
                    value={shareRecipientEmail}
                    onChange={(e) => setShareRecipientEmail(e.target.value)}
                    placeholder="client@brand.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
                  />
                  <input
                    type="text"
                    value={shareRecipientName}
                    onChange={(e) => setShareRecipientName(e.target.value)}
                    placeholder="Client Contact Name (optional)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <textarea
                  rows={2}
                  value={sharePersonalMessage}
                  onChange={(e) => setSharePersonalMessage(e.target.value)}
                  placeholder="Add optional personal note for client..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Manager &amp; Creator will receive Gmail alerts upon comments/approval.
                  </span>
                  <button
                    type="submit"
                    disabled={isSendingShareEmail || !shareRecipientEmail.trim()}
                    className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSendingShareEmail ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send via Gmail</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 8. LINK / RELINK DELIVERABLE TASK MODAL */}
      {/* ========================================================================= */}
      {linkTaskModal.isOpen && linkTaskModal.creative && isMounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Link Task Deliverable</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[280px]">
                    {linkTaskModal.creative.name} {linkTaskModal.creative.client_name ? `• ${linkTaskModal.creative.client_name}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLinkTaskModal({ isOpen: false, creative: null })}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Link Status Banner */}
            {linkTaskModal.creative.task_id && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider">Currently Linked Task</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {linkTaskModal.creative.task_title || `#${linkTaskModal.creative.task_id.slice(0, 6).toUpperCase()}`}
                  </div>
                </div>
                <button
                  onClick={() => handleLinkTask(null)}
                  disabled={isLinkingTask}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Unlink</span>
                </button>
              </div>
            )}

            {/* Task Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search deliverable tasks by title, ID, or priority..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#060B13] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
              />
            </div>

            {/* Available Tasks List */}
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {loadingTasks ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading deliverable tasks...</p>
                </div>
              ) : availableTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-semibold">No tasks found</p>
                  <p className="text-[11px] text-slate-500">Create deliverable tasks in the Tasks tab first.</p>
                </div>
              ) : (
                availableTasks
                  .filter(t => {
                    if (!taskSearchQuery) return true;
                    const q = taskSearchQuery.toLowerCase();
                    return (
                      (t.title && t.title.toLowerCase().includes(q)) ||
                      (t.id && t.id.toLowerCase().includes(q)) ||
                      (t.priority && t.priority.toLowerCase().includes(q)) ||
                      (t.status && t.status.toLowerCase().includes(q)) ||
                      (t.project_name && t.project_name.toLowerCase().includes(q))
                    );
                  })
                  .map(t => {
                    const isSelected = linkTaskModal.creative?.task_id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleLinkTask(t.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#DC2626]/10 border-[#DC2626] text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-[#070D18] hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400">
                              #{t.id.slice(0, 4).toUpperCase()}
                            </span>
                            {t.priority && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                t.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                                t.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-blue-500/10 text-blue-500'
                              }`}>
                                {t.priority}
                              </span>
                            )}
                            <span className="text-[10px] font-medium text-slate-400">
                              {t.status || 'TODO'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                            {t.title}
                          </div>
                          {t.project_name && (
                            <div className="text-[10px] text-slate-400 truncate">
                              Project: {t.project_name}
                            </div>
                          )}
                        </div>

                        <button
                          disabled={isLinkingTask}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer ${
                            isSelected
                              ? 'bg-[#DC2626] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-[#DC2626] hover:text-white text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Linked</span>
                            </>
                          ) : (
                            <>
                              <LinkIcon className="w-3.5 h-3.5" />
                              <span>Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setLinkTaskModal({ isOpen: false, creative: null })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Feedback Annotation Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCommentId}
        title="Delete Annotation Pin"
        description="Are you sure you want to delete this feedback annotation and pin?"
        subDescription="This thread and all associated feedback notes will be removed from the canvas."
        confirmText="Delete Annotation"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteComment}
        onClose={() => setDeletingCommentId(null)}
      />
    </div>
  );
};
