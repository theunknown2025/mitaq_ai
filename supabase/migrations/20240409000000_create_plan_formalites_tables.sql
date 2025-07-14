-- Create plans table
CREATE TABLE plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create formalites table
CREATE TABLE formalites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    responsible_id UUID NOT NULL REFERENCES personnel(id),
    days INTEGER NOT NULL CHECK (days > 0),
    reminder_days INTEGER NOT NULL CHECK (reminder_days >= 0),
    is_dependent BOOLEAN NOT NULL DEFAULT false,
    depends_on_id UUID REFERENCES formalites(id),
    order_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reminder_days_check CHECK (reminder_days <= days),
    CONSTRAINT dependency_check CHECK (
        (is_dependent = false AND depends_on_id IS NULL) OR
        (is_dependent = true AND depends_on_id IS NOT NULL)
    )
);

-- Create formalite_documents table for storing multiple documents per formalite
CREATE TABLE formalite_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    formalite_id UUID NOT NULL REFERENCES formalites(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE formalites ENABLE ROW LEVEL SECURITY;
ALTER TABLE formalite_documents ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX formalites_plan_id_idx ON formalites(plan_id);
CREATE INDEX formalites_responsible_id_idx ON formalites(responsible_id);
CREATE INDEX formalites_depends_on_id_idx ON formalites(depends_on_id);
CREATE INDEX formalite_documents_formalite_id_idx ON formalite_documents(formalite_id);

-- Create triggers for updated_at
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formalites_updated_at
    BEFORE UPDATE ON formalites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formalite_documents_updated_at
    BEFORE UPDATE ON formalite_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 