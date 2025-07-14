-- Create enum for document types
CREATE TYPE document_type AS ENUM ('CIN', 'Passport', 'Carte Séjour');

-- Create clients table
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    first_name_ar VARCHAR(255),
    last_name_ar VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    address_ar TEXT,
    document_type document_type NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    document_expiry DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    father_first_name VARCHAR(255),
    father_last_name VARCHAR(255),
    father_first_name_ar VARCHAR(255),
    father_last_name_ar VARCHAR(255),
    mother_first_name VARCHAR(255),
    mother_last_name VARCHAR(255),
    mother_first_name_ar VARCHAR(255),
    mother_last_name_ar VARCHAR(255),
    is_company BOOLEAN DEFAULT FALSE
);

-- Add RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create an index on document number for faster lookups
CREATE INDEX clients_document_number_idx ON clients(document_number);

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 