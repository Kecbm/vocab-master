import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from './UserAvatar';

const AuthHeader = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <UserAvatar
          photoURL={currentUser.photoURL}
          displayName={currentUser.displayName}
          email={currentUser.email}
          size={32}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {currentUser.displayName || 'User'}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentUser.email}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default AuthHeader;
