import { useState } from 'react';

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  size?: number;
}

const UserAvatar = ({ photoURL, displayName, email, size = 32 }: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  // Gerar iniciais do nome ou email
  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    if (email) {
      return email[0].toUpperCase();
    }
    
    return 'U';
  };

  // Gerar cor baseada no nome/email
  const getBackgroundColor = () => {
    const text = displayName || email || 'User';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  if (photoURL && !imageError) {
    return (
      <img
        src={photoURL}
        alt="Profile"
        className={`rounded-full object-cover border`}
        style={{ width: size, height: size }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    );
  }

  // Fallback para avatar com iniciais
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium ${getBackgroundColor()}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials()}
    </div>
  );
};

export default UserAvatar;
