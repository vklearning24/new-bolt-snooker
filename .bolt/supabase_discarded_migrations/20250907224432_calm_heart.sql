/*
  # Update user roles and add audit logging

  1. Schema Changes
    - Update role constraint to include 'editor' and 'moderator'
    - Create role_audit_logs table for tracking role changes
  
  2. Security
    - Update RLS policies for new roles
    - Add policies for audit log access
  
  3. Functions
    - Create function to check if user is last admin
    - Create trigger for automatic audit logging
*/

-- Update the role constraint to include new roles
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role = ANY (ARRAY['streaming'::text, 'admin'::text, 'editor'::text, 'moderator'::text]));

-- Create audit log table
CREATE TABLE IF NOT EXISTS role_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_role text,
  new_role text NOT NULL,
  old_is_active boolean,
  new_is_active boolean,
  change_reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE role_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs (only admins can view)
CREATE POLICY "Admins can view all audit logs"
  ON role_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
      AND user_profiles.is_active = true
    )
  );

-- Create policy for inserting audit logs (system use)
CREATE POLICY "System can insert audit logs"
  ON role_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (changed_by_user_id = auth.uid());

-- Update existing RLS policies for user_profiles to include new roles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Recreate policies with updated role checks
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policies for managing all users
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'admin'
      AND admin_check.is_active = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'admin'
      AND admin_check.is_active = true
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'admin'
      AND admin_check.is_active = true
    )
  );

-- Function to check if user is the last admin
CREATE OR REPLACE FUNCTION is_last_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count integer;
  user_role text;
BEGIN
  -- Get the user's current role
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id AND is_active = true;
  
  -- If user is not an admin, they're not the last admin
  IF user_role != 'admin' THEN
    RETURN false;
  END IF;
  
  -- Count active admins
  SELECT COUNT(*) INTO admin_count
  FROM user_profiles
  WHERE role = 'admin' AND is_active = true;
  
  -- Return true if there's only one admin
  RETURN admin_count <= 1;
END;
$$;

-- Function to log role changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log if role or is_active changed
  IF (OLD.role != NEW.role OR OLD.is_active != NEW.is_active) THEN
    INSERT INTO role_audit_logs (
      changed_user_id,
      changed_by_user_id,
      old_role,
      new_role,
      old_is_active,
      new_is_active,
      change_reason
    ) VALUES (
      NEW.id,
      auth.uid(),
      OLD.role,
      NEW.role,
      OLD.is_active,
      NEW.is_active,
      CASE 
        WHEN OLD.role != NEW.role AND OLD.is_active != NEW.is_active THEN 
          'Role changed from ' || OLD.role || ' to ' || NEW.role || ' and status changed'
        WHEN OLD.role != NEW.role THEN 
          'Role changed from ' || OLD.role || ' to ' || NEW.role
        WHEN OLD.is_active != NEW.is_active THEN 
          'Status changed to ' || CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END
        ELSE 'Profile updated'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic audit logging
DROP TRIGGER IF EXISTS user_profile_audit_trigger ON user_profiles;
CREATE TRIGGER user_profile_audit_trigger
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();