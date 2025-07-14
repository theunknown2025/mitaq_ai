-- Add array columns for multiple languages support
ALTER TABLE document_template_fields
ADD COLUMN field_info_languages TEXT[] DEFAULT '{fr}',
ADD COLUMN field_display_languages TEXT[] DEFAULT '{fr}';

-- Update existing records to use the new columns
UPDATE document_template_fields
SET 
  field_info_languages = ARRAY[field_info_language],
  field_display_languages = ARRAY[field_display_language]; 