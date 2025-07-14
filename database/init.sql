-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('admin', 'assistant');

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    family_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add row level security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a secure function to handle password hashing
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial users with hashed passwords
INSERT INTO users (first_name, family_name, email, password, role) VALUES
(
    'Dina',
    'Yacoubi',
    'dina@yacoubi.com',
    hash_password('DinaYACOUBI@2025'),
    'admin'
),
(
    'Assisstant',
    'Assisstant',
    'assisstant@yacoubi.com',
    hash_password('AssistantYACOUBI@2025'),
    'assistant'
);

-- Create an index on email for faster lookups
CREATE INDEX users_email_idx ON users(email);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 