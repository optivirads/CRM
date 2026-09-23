-- Migration 031: Extend activities and notifications check constraints for proposal acceptance
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check CHECK (
  type = ANY (ARRAY[
    'Call', 'Meeting', 'Email', 'Note', 'Task', 'Follow-up', 'Reminder', 'Status Change', 'PROPOSAL_ACCEPTED'
  ])
);

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type = ANY (ARRAY[
    'task_assigned', 'task_overdue', 'lead_new', 'lead_followup', 'deal_stage',
    'proposal_viewed', 'invoice_overdue', 'payment_received', 'renewal_approaching',
    'system', 'creative_comment', 'creative_approved', 'creative_changes_requested',
    'CREATIVE_COMMENT', 'CREATIVE_APPROVED', 'CREATIVE_CHANGES_REQUESTED',
    'document_approved', 'document_changes_requested', 'document_rejected',
    'DOCUMENT_APPROVED', 'DOCUMENT_CHANGES_REQUESTED', 'DOCUMENT_REJECTED',
    'PROPOSAL_ACCEPTED'
  ])
);
