import React from 'react';
import { AppShell, CardSimple, StatsGrid } from '../raw-blocks';
import { Button, Text, Avatar, Badge, Divider } from '../primitives';
import { Tabs, Modal } from '../composites';

/**
 * ProfileTemplate
 * User/player profile page template
 */

interface ProfileInfo {
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  status?: 'active' | 'inactive' | 'away';
}

interface ProfileStat {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

interface ProfileTab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface ProfileTemplateProps {
  /** Profile information */
  profile: ProfileInfo;
  /** Profile statistics */
  stats?: ProfileStat[];
  /** Content tabs */
  tabs?: ProfileTab[];
  /** Show edit button */
  editable?: boolean;
  /** Edit handler */
  onEdit?: () => void;
  /** Show settings button */
  showSettings?: boolean;
  /** Settings handler */
  onSettings?: () => void;
  /** Additional actions */
  actions?: React.ReactNode;
  /** Cover image */
  coverImage?: string;
  /** Loading state */
  loading?: boolean;
}

const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  profile,
  stats = [],
  tabs = [],
  editable = false,
  onEdit,
  showSettings = false,
  onSettings,
  actions,
  coverImage,
  loading = false,
}) => {
  const [imageModalOpen, setImageModalOpen] = React.useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 w-full">
        {/* Cover Image */}
        {coverImage && (
          <div
            className="w-full h-60 bg-cover bg-center rounded-lg cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            style={{ backgroundImage: `url(${coverImage})` }}
            onClick={() => setImageModalOpen(true)}
            role="button"
            tabIndex={0}
          />
        )}

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 flex-1 text-center md:text-left">
            <div
              className="cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => setImageModalOpen(true)}
              role="button"
              tabIndex={0}
            >
              <Avatar
                src={profile.avatar}
                name={profile.name}
                size="xl"
                status={profile.status}
              />
            </div>

            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <Text variant="title1" weight={700}>
                  {profile.name}
                </Text>
                {profile.role && (
                  <Badge variant="accent" pill>
                    {profile.role}
                  </Badge>
                )}
              </div>

              {profile.bio && (
                <Text variant="body" color="secondary">
                  {profile.bio}
                </Text>
              )}

              <div className="flex flex-col gap-2">
                {profile.email && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-tier-text-secondary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <rect x="2" y="4" width="12" height="9" rx="1" strokeWidth="1.5" />
                      <path d="M2 5l6 4 6-4" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <Text variant="footnote" color="secondary">
                      {profile.email}
                    </Text>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-tier-text-secondary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <path d="M8 14s-4-3-4-6.5C4 5 5.79 3 8 3s4 2 4 4.5S8 14 8 14z" strokeWidth="1.5" />
                      <circle cx="8" cy="7" r="1.5" strokeWidth="1.5" />
                    </svg>
                    <Text variant="footnote" color="secondary">
                      {profile.location}
                    </Text>
                  </div>
                )}

                {profile.joinDate && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-tier-text-secondary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="10" height="9" rx="1" strokeWidth="1.5" />
                      <path d="M6 2v3M10 2v3M3 7h10" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <Text variant="footnote" color="secondary">
                      Medlem siden {formatDate(profile.joinDate)}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto shrink-0">
            {editable && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit profile
              </Button>
            )}
            {showSettings && onSettings && (
              <Button variant="ghost" onClick={onSettings}>
                Settings
              </Button>
            )}
            {actions}
          </div>
        </div>

        {/* Statistics */}
        {stats.length > 0 && (
          <div className="w-full">
            <StatsGrid stats={stats} showTrend columns={4} />
          </div>
        )}

        <Divider />

        {/* Content Tabs */}
        {tabs.length > 0 && (
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <Tabs
              tabs={tabs}
              variant="underline"
              defaultActiveTab={tabs[0]?.id}
            />
          </div>
        )}

        {/* Empty State */}
        {tabs.length === 0 && stats.length === 0 && (
          <CardSimple padding="lg">
            <div className="flex items-center justify-center p-10">
              <Text variant="title3" color="secondary">
                No additional information available
              </Text>
            </div>
          </CardSimple>
        )}
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        size="lg"
        showCloseButton
      >
        <div className="flex items-center justify-center p-8">
          <Avatar
            src={profile.avatar}
            name={profile.name}
            size="xl"
          />
        </div>
      </Modal>
    </AppShell>
  );
};

export default ProfileTemplate;
