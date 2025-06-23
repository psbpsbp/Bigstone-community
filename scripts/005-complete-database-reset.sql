-- First, drop all functions that might depend on tables
DROP FUNCTION IF EXISTS get_next_announcement_number(UUID);

-- Drop all tables in dependency order (most dependent first)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS project_ports CASCADE;
DROP TABLE IF EXISTS project_chat_messages CASCADE;
DROP TABLE IF EXISTS project_announcements CASCADE;
DROP TABLE IF EXISTS project_schematics CASCADE;
DROP TABLE IF EXISTS examples CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- Now drop the main tables
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS standards CASCADE;
DROP TABLE IF EXISTS ports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate all tables from scratch
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ports table
CREATE TABLE ports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('I', 'O', 'B')),
  type TEXT NOT NULL CHECK (type IN ('BIN', 'HEX')),
  port_count INTEGER DEFAULT 1,
  role TEXT DEFAULT 'SD',
  description TEXT,
  grid_data JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create standards table
CREATE TABLE standards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  voting_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  status TEXT DEFAULT 'voting' CHECK (status IN ('voting', 'approved', 'denied'))
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  standard_id UUID REFERENCES standards(id),
  user_id UUID REFERENCES users(id),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('approve', 'deny')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(standard_id, user_id)
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table (redesigned structure)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project chat messages
CREATE TABLE project_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project announcements (numbered updates)
CREATE TABLE project_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  update_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, update_number)
);

-- Create project schematics (file uploads)
CREATE TABLE project_schematics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to get next announcement number
CREATE OR REPLACE FUNCTION get_next_announcement_number(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(update_number), 0) + 1 
  INTO next_num 
  FROM project_announcements 
  WHERE project_id = project_uuid;
  
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;
