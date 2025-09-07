// components/InviteUsersButton.tsx
import { useAuth } from '@/contexts/AuthContext';

export function InviteUsersButton() {
  const { hasPermission } = useAuth();

  if (!hasPermission('users.invite')) return null; // hide if not allowed

  return (
    <button onClick={() => {/* open invite modal */}}>
      Invite Users
    </button>
  );
}
