-- Create processed_documents table
CREATE TABLE processed_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create processed_pages table to store individual pages
CREATE TABLE processed_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES processed_documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_processed_documents_created_at ON processed_documents(created_at DESC);
CREATE INDEX idx_processed_pages_document_id ON processed_pages(document_id);
CREATE INDEX idx_processed_pages_page_number ON processed_pages(page_number);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_processed_documents_updated_at
  BEFORE UPDATE ON processed_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processed_pages_updated_at
  BEFORE UPDATE ON processed_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE processed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for processed_documents
CREATE POLICY "Enable read access for all users" ON processed_documents
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON processed_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON processed_documents
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON processed_documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for processed_pages
CREATE POLICY "Enable read access for all users" ON processed_pages
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON processed_pages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON processed_pages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON processed_pages
  FOR DELETE USING (auth.role() = 'authenticated');
