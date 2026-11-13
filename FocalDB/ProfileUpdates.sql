-- Add fields for the FOCAL Edit Profile page

ALTER TABLE user_profile
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

ALTER TABLE user_profile
ADD COLUMN IF NOT EXISTS bio VARCHAR(500);

ALTER TABLE user_profile
ADD COLUMN IF NOT EXISTS creator_type VARCHAR(100);
