-- Drop dependent tables first (in correct order)
DROP TABLE IF EXISTS project_ports CASCADE;
DROP TABLE IF EXISTS project_chat_messages CASCADE;
DROP TABLE IF EXISTS project_announcements CASCADE;
DROP TABLE IF EXISTS project_schematics CASCADE;
DROP TABLE IF EXISTS examples CASCADE;

-- Now drop the main projects table
DROP TABLE IF EXISTS projects CASCADE;

-- Create projects table with chat/announcement/schematics channels
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project chat messages
CREATE TABLE IF NOT EXISTS project_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project announcements (numbered updates)
CREATE TABLE IF NOT EXISTS project_announcements (
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
CREATE TABLE IF NOT EXISTS project_schematics (
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

-- Create examples table (16x16 grids with all ports combined)
CREATE TABLE IF NOT EXISTS examples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  grid_data JSONB NOT NULL, -- Combined port layout
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_by UUID REFERENCES users(id),
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
