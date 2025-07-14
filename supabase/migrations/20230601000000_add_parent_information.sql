-- Add parent information fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS father_first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_first_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_last_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_first_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_last_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_company BOOLEAN DEFAULT FALSE;

-- Update existing records to mark them as not companies
UPDATE clients SET is_company = FALSE WHERE is_company IS NULL; 