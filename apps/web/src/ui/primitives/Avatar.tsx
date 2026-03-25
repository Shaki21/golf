/**
 * TIER Golf - Avatar Component
 * Premium Light System: Stone × Midnight Blue × Emerald × Soft Gold
 *
 * Rules:
 * - No random color hashing for backgrounds (premium systems avoid noise)
 * - Default avatar is neutral stone
 * - Optional status dot is allowed but should not compete with achievements
 */

import React from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  /** @deprecated Use imageUrl instead */
  src?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  // Keep badgeColor for backward compatibility, but default should be calm.
  badgeColor?: string;
  /** Status indicator - maps to badge display */
  status?: "online" | "offline" | "away" | "active" | "inactive" | string;
  onClick?: () => void;
  className?: string;
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
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  src,
  size = "md",
  showBadge = false,
  badgeColor,
  status,
  onClick,
  className,
  style,
}) => {
  const config = sizeConfig[size];
  const initials = getInitials(name);
  const imageSrc = imageUrl || src; // backwards compat

  // Map status to badge visibility and color
  const shouldShowBadge = showBadge || Boolean(status);
  const resolvedBadgeColor = badgeColor ?? (
    status === "online" || status === "active" ? "var(--tier-status-success)" :
    status === "away" ? "var(--tier-status-warning)" :
    status === "offline" || status === "inactive" ? "var(--tier-text-muted)" :
    "var(--tier-action-active)"
  );

  return (
    <div
      className={[
        "relative flex-shrink-0 overflow-hidden rounded-full",
        onClick ? "cursor-pointer" : "cursor-default",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: config.size, height: config.size, ...style }}
      onClick={onClick}
      aria-label={name}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-ak-surface-card text-ak-text-primary"
          style={{ fontSize: config.fontSize, fontWeight: 600 }}
        >
          {initials}
        </div>
      )}

      {shouldShowBadge ? (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2 border-ak-surface-base"
          style={{
            width: Math.max(config.size * 0.3, 8),
            height: Math.max(config.size * 0.3, 8),
            backgroundColor: resolvedBadgeColor,
          }}
        />
      ) : null}
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
  size = "sm",
}) => {
  const displayed = users.slice(0, max);
  const remainingCount = Math.max(users.length - max, 0);
  const config = sizeConfig[size];

  return (
    <div className="flex items-center">
      {displayed.map((user, index) => (
        <div
          key={`${user.name}-${index}`}
          className="rounded-full border-2 border-ak-surface-base"
          style={{ marginLeft: index > 0 ? -config.size * 0.3 : 0 }}
        >
          <Avatar name={user.name} imageUrl={user.imageUrl} size={size} />
        </div>
      ))}

      {remainingCount > 0 ? (
        <div
          className="flex items-center justify-center rounded-full border-2 border-ak-surface-base bg-ak-surface-border text-ak-action-active font-semibold"
          style={{
            marginLeft: -config.size * 0.3,
            width: config.size,
            height: config.size,
            fontSize: config.fontSize * 0.9,
          }}
        >
          +{remainingCount}
        </div>
      ) : null}
    </div>
  );
};

export default Avatar;
