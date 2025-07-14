-- Create templates table for storing document templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by name
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);

-- Enable RLS (Row Level Security)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policy for accessing templates (can be customized as needed)
CREATE POLICY "Allow public access to templates" 
  ON templates
  FOR ALL
  USING (true);

-- Trigger for automatically updating the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_timestamp
BEFORE UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 