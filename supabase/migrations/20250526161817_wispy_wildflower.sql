/*
  # Initial Schema Setup for ResumePilot

  1. New Tables
    - `profiles`
      - Stores user profile information
      - Links to Supabase auth.users
    - `resumes`
      - Stores resume documents
      - Contains metadata and content
    - `cover_letters`
      - Stores cover letter documents
      - Contains metadata and content
    - `shared_documents`
      - Tracks document sharing
      - Manages access control

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure document sharing
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cover_letters table
CREATE TABLE IF NOT EXISTS cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shared_documents table
CREATE TABLE IF NOT EXISTS shared_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('resume', 'cover_letter')),
  shared_by uuid REFERENCES auth.users(id) NOT NULL,
  shared_with uuid REFERENCES auth.users(id),
  access_code text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Resumes policies
CREATE POLICY "Users can view their own resumes"
  ON resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create resumes"
  ON resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Cover letters policies
CREATE POLICY "Users can view their own cover letters"
  ON cover_letters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create cover letters"
  ON cover_letters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters"
  ON cover_letters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters"
  ON cover_letters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Shared documents policies
CREATE POLICY "Users can view shared documents"
  ON shared_documents
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = shared_by OR 
    auth.uid() = shared_with OR
    (access_code IS NOT NULL AND expires_at > now())
  );

CREATE POLICY "Users can create shared documents"
  ON shared_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = shared_by);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON cover_letters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX idx_shared_documents_document ON shared_documents(document_id, document_type);