/*
  # Update role constraint to support all role types

  1. Changes
    - Drop existing role constraint that only allows 'streaming' and 'admin'
    - Add new constraint that allows 'streaming', 'admin', 'editor', 'moderator', and 'contributor'

  2. Security
    - Maintains data integrity by ensuring only valid roles are allowed
    - Expands role system to support hierarchical permissions

  3. Notes
    - This change enables the full role-based access control system
    - All existing data remains unchanged as current roles are still valid
*/

-- Drop the existing role constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add new constraint that includes all role types
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role = ANY (ARRAY['streaming'::text, 'admin'::text, 'editor'::text, 'moderator'::text, 'contributor'::text]));