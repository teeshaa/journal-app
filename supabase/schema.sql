-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table to extend auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  total_entries INTEGER DEFAULT 0 NOT NULL,
  total_words INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_current_streak ON users(current_streak DESC);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(50) NOT NULL CHECK (theme IN ('technology_impact', 'delivery_impact', 'business_impact', 'team_impact', 'org_impact')),
  prompt TEXT NOT NULL CHECK (length(trim(prompt)) >= 5),
  content TEXT NOT NULL CHECK (length(trim(content)) >= 10 AND length(content) <= 50000),
  images TEXT[] DEFAULT '{}' NOT NULL,
  is_bookmarked BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  word_count INTEGER DEFAULT 0 NOT NULL CHECK (word_count >= 0),
  tags TEXT[] DEFAULT '{}' NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_theme ON journal_entries(theme);
CREATE INDEX IF NOT EXISTS idx_journal_entries_is_bookmarked ON journal_entries(is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX IF NOT EXISTS idx_journal_entries_word_count ON journal_entries(word_count);

-- Create RLS (Row Level Security) policies for journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON journal_entries;

-- Policy for users to only see their own entries
CREATE POLICY "Users can view their own entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own entries with validation
CREATE POLICY "Users can insert their own entries" ON journal_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    length(trim(prompt)) >= 5 AND
    length(trim(content)) >= 10 AND
    length(content) <= 50000 AND
    word_count >= 0 AND
    (array_length(images, 1) IS NULL OR array_length(images, 1) <= 5) AND
    (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10)
  );

-- Policy for users to update their own entries with validation
CREATE POLICY "Users can update their own entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    length(trim(prompt)) >= 5 AND
    length(trim(content)) >= 10 AND
    length(content) <= 50000 AND
    word_count >= 0 AND
    (array_length(images, 1) IS NULL OR array_length(images, 1) <= 5) AND
    (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10)
  );

-- Policy for users to delete their own entries
CREATE POLICY "Users can delete their own entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user creation (fixed version)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to automatically update word count and updated_at with validation
CREATE OR REPLACE FUNCTION update_journal_entry_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate content length
  IF length(trim(NEW.content)) < 10 THEN
    RAISE EXCEPTION 'Content must be at least 10 characters long';
  END IF;
  
  IF length(NEW.content) > 50000 THEN
    RAISE EXCEPTION 'Content cannot exceed 50,000 characters';
  END IF;
  
  -- Calculate word count properly
  NEW.word_count = (
    SELECT array_length(
      string_to_array(trim(regexp_replace(NEW.content, '\s+', ' ', 'g')), ' '), 
      1
    )
  );
  
  -- Ensure word_count is not null
  IF NEW.word_count IS NULL THEN
    NEW.word_count = 0;
  END IF;
  
  -- Set updated_at to current timestamp
  NEW.updated_at = NOW();
  
  -- Validate arrays are not null
  IF NEW.images IS NULL THEN
    NEW.images = '{}';
  END IF;
  
  IF NEW.tags IS NULL THEN
    NEW.tags = '{}';
  END IF;
  
  -- Validate image count
  IF array_length(NEW.images, 1) > 5 THEN
    RAISE EXCEPTION 'Maximum 5 images allowed per entry';
  END IF;
  
  -- Validate tag count
  IF array_length(NEW.tags, 1) > 10 THEN
    RAISE EXCEPTION 'Maximum 10 tags allowed per entry';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_journal_entry_metadata ON journal_entries;

-- Trigger to update metadata on insert/update
CREATE TRIGGER trigger_update_journal_entry_metadata
  BEFORE INSERT OR UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_entry_metadata();

-- Function to update user stats when journal entries change
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  user_total_entries INTEGER;
  user_total_words INTEGER;
  target_user_id UUID;
BEGIN
  -- Get the user_id from the operation
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Calculate totals for the user
  SELECT 
    COUNT(*),
    COALESCE(SUM(word_count), 0)
  INTO 
    user_total_entries,
    user_total_words
  FROM journal_entries 
  WHERE user_id = target_user_id;

  -- Update user stats
  UPDATE users 
  SET 
    total_entries = user_total_entries,
    total_words = user_total_words,
    updated_at = NOW()
  WHERE id = target_user_id;

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the operation
    RAISE LOG 'Error updating user stats: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_user_stats ON journal_entries;

-- Trigger to update user stats when entries are modified
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT OR UPDATE OR DELETE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Create storage bucket for images with explicit configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'journal-images', 
  'journal-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create storage policies for journal images with strict validation
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'journal-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'journal-images' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR bucket_id = 'journal-images')
  );

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'journal-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'journal-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ); 