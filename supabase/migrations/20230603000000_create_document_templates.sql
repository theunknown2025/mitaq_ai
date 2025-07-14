-- Document templates table
CREATE TABLE document_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    languages TEXT[] NOT NULL, -- Array of languages ['ar', 'fr']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document fields table
CREATE TABLE document_template_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    field_info_language VARCHAR(10) NOT NULL, -- 'ar' or 'fr'
    field_display_language VARCHAR(10) NOT NULL, -- 'ar' or 'fr'
    field_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_template_fields ENABLE ROW LEVEL SECURITY;

-- Create indices
CREATE INDEX document_template_fields_template_id_idx ON document_template_fields(document_template_id);

-- Create triggers to update updated_at
CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_document_template_fields_updated_at
    BEFORE UPDATE ON document_template_fields
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 