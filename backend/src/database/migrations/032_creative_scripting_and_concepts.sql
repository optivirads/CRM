-- 032_creative_scripting_and_concepts.sql
-- Add script_content and concept_idea columns for video scripting and poster/image concept planning

ALTER TABLE creatives ADD COLUMN IF NOT EXISTS script_content TEXT;
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS concept_idea TEXT;
