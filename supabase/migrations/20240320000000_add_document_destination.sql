-- Create enum type for document destination
CREATE TYPE document_destination AS ENUM ('personne_morale', 'personne_physique');

-- Add document_destination column to document_templates table
ALTER TABLE document_templates 
ADD COLUMN document_destination document_destination;

-- Update existing rows to have a default value (optional)
-- You can remove this if you don't want to set a default for existing records
UPDATE document_templates 
SET document_destination = 'personne_physique'
WHERE document_destination IS NULL;

-- Make the column required for future inserts
ALTER TABLE document_templates 
ALTER COLUMN document_destination SET NOT NULL; 