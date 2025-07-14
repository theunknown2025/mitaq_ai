-- Create legal entities table
CREATE TABLE legal_entities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    denomination VARCHAR(255) NOT NULL,
    activite TEXT,
    siege_social TEXT,
    forme_juridique VARCHAR(100),
    capital_social VARCHAR(100),
    rc_number VARCHAR(100) NOT NULL,
    rc_document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for legal entity managers/associates
CREATE TABLE legal_entity_managers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    first_name_ar VARCHAR(255),
    last_name_ar VARCHAR(255),
    qualite VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    address_ar TEXT,
    document_type document_type,
    document_number VARCHAR(100),
    document_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_entity_managers ENABLE ROW LEVEL SECURITY;

-- Create indices
CREATE INDEX legal_entities_rc_number_idx ON legal_entities(rc_number);
CREATE INDEX legal_entity_managers_legal_entity_id_idx ON legal_entity_managers(legal_entity_id);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER update_legal_entities_updated_at
    BEFORE UPDATE ON legal_entities
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_legal_entity_managers_updated_at
    BEFORE UPDATE ON legal_entity_managers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 