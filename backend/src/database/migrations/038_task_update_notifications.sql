-- Migration 038: Extend notifications check constraint for task update & team notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  (type)::text = ANY (ARRAY[
    'task_assigned', 'task_overdue', 'lead_new', 'lead_followup', 'deal_stage',
    'proposal_viewed', 'invoice_overdue', 'payment_received', 'renewal_approaching',
    'system', 'creative_comment', 'creative_approved', 'creative_changes_requested',
    'CREATIVE_COMMENT', 'CREATIVE_APPROVED', 'CREATIVE_CHANGES_REQUESTED',
    'document_approved', 'document_changes_requested', 'document_rejected',
    'DOCUMENT_APPROVED', 'DOCUMENT_CHANGES_REQUESTED', 'DOCUMENT_REJECTED',
    'PROPOSAL_ACCEPTED', 'task_creative_script', 'TASK_CREATIVE_SCRIPT',
    'task_updated', 'TASK_UPDATED', 'task_status_changed', 'TASK_STATUS_CHANGED',
    'task_comment', 'TASK_COMMENT'
  ]::text[])
);
