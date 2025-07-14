# Templates Feature Implementation

This document outlines the templates feature added to the Mitaqai application, which allows users to upload, process, and save document templates.

## Database Setup

Execute the following SQL to create the templates table in your Supabase database:

```sql
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
```

## Environment Variables

Make sure to set the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Dependencies

Make sure to install the required dependency:

```bash
npm install @supabase/supabase-js
```

## Features

The templates implementation includes:

1. Upload and process a document (docx, pdf) into editable sections
2. Insert database field placeholders from existing database tables
3. Save processed templates to the database
4. (Future) List, edit, and manage saved templates

## Key Files

- `frontend/src/services/templateService.ts` - Handles database operations for templates
- `frontend/src/lib/supabaseClient.ts` - Supabase client configuration
- `frontend/src/app/admin/redacteur/templates/new/page.tsx` - Template editor page
- `db/migrations/create_templates_table.sql` - SQL migration for templates table 