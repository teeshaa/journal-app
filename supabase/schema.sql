-- Create journal_entries table with explicit constraints and no defaults
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(50) NOT NULL CHECK (theme IN ('technology_impact', 'delivery_impact', 'business_impact', 'team_impact', 'org_impact')),
  prompt TEXT NOT NULL CHECK (length(trim(prompt)) >= 5),
  content TEXT NOT NULL CHECK (length(trim(content)) >= 10 AND length(content) <= 50000),
  images TEXT[] NOT NULL,
  is_bookmarked BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  word_count INTEGER NOT NULL CHECK (word_count >= 0),
  tags TEXT[] NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_theme ON journal_entries(theme);
CREATE INDEX idx_journal_entries_is_bookmarked ON journal_entries(is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX idx_journal_entries_word_count ON journal_entries(word_count);

-- Create RLS (Row Level Security) policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

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
    array_length(images, 1) IS NULL OR array_length(images, 1) <= 5 AND
    array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10
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
    array_length(images, 1) IS NULL OR array_length(images, 1) <= 5 AND
    array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10
  );

-- Policy for users to delete their own entries
CREATE POLICY "Users can delete their own entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

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
  NEW.updated_at = now();
  
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

-- Trigger to update metadata on insert/update
CREATE TRIGGER trigger_update_journal_entry_metadata
  BEFORE INSERT OR UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_entry_metadata();

-- Function to set created_at and id for new entries
CREATE OR REPLACE FUNCTION set_journal_entry_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Set ID if not provided
  IF NEW.id IS NULL THEN
    NEW.id = gen_random_uuid();
  END IF;
  
  -- Set created_at if not provided (only on insert)
  IF TG_OP = 'INSERT' AND NEW.created_at IS NULL THEN
    NEW.created_at = now();
  END IF;
  
  -- Set updated_at if not provided
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set defaults for new entries
CREATE TRIGGER trigger_set_journal_entry_defaults
  BEFORE INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_journal_entry_defaults();

-- Create storage bucket for images with explicit configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'journal-images', 
  'journal-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies for journal images with strict validation
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'journal-images' AND 
    auth.uid()::text = (storage.foldername(name))[1] AND
    octet_length(decode(substring(name from '[^/]+$'), 'base64')) <= 10485760
  );

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'journal-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
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