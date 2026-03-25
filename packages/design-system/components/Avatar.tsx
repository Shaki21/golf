/**
 * AK Golf Academy - Avatar Component
 * Design System v3.0 - Blue Palette 01
 */

import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeColor?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const sizeConfig: Record<AvatarSize, { size: number; fontSize: number }> = {
  xs: { size: 24, fontSize: 10 },
  sm: { size: 32, fontSize: 12 },
  md: { size: 40, fontSize: 14 },
  lg: { size: 56, fontSize: 18 },
  xl: { size: 80, fontSize: 24 },
};

const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getColorFromName = (name: string): string => {
  const colors = [
    '#10456A', // Primary Blue
    '#2C5F7F', // Primary Light
    '#4A7C59', // Success Green
    '#C9A227', // Gold
    '#8B6E9D', // Purple
    '#D97644', // Orange
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  showBadge = false,
  badgeColor = '#4A7C59',
  onClick,
  style,
}) => {
  const config = sizeConfig[size];
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: config.size,
    height: config.size,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const avatarStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgColor,
    color: '#FFFFFF',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    fontSize: config.fontSize,
    fontWeight: 600,
  };

  const badgeStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: config.size * 0.3,
    height: config.size * 0.3,
    minWidth: 8,
    minHeight: 8,
    borderRadius: '50%',
    backgroundColor: badgeColor,
    border: '2px solid #FFFFFF',
  };

  return (
    <div style={containerStyles} onClick={onClick}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div style={avatarStyles}>{initials}</div>
      )}
      {showBadge && <div style={badgeStyles} />}
    </div>
  );
};

// Avatar Group - for showing multiple avatars
interface AvatarGroupProps {
  users: Array<{ name: string; imageUrl?: string }>;
  max?: number;
  size?: AvatarSize;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = 'sm',
}) => {
  const displayedUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  const config = sizeConfig[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {displayedUsers.map((user, index) => (
        <div
          key={index}
          style={{
            marginLeft: index > 0 ? -config.size * 0.3 : 0,
            border: '2px solid #FFFFFF',
            borderRadius: '50%',
          }}
        >
          <Avatar name={user.name} imageUrl={user.imageUrl} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          style={{
            marginLeft: -config.size * 0.3,
            width: config.size,
            height: config.size,
            borderRadius: '50%',
            backgroundColor: '#EDF0F2',
            border: '2px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: config.fontSize * 0.9,
            fontWeight: 600,
            color: '#10456A',
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
