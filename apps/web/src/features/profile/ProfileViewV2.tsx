/**
 * ProfileViewV2 - Improved profile view with better colors and design
 *
 * Fixes:
 * - Proper name display (firstName + lastName)
 * - Profile image upload functionality
 * - Golf club autocomplete
 * - Better color scheme with gradient header
 * - Consistent design throughout
 */

import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Flag, Award,
  Target, Trophy, Edit2, ChevronRight, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Separator,
} from '../../components/shadcn';
import ProfileImageUpload from '../../components/profile/ProfileImageUpload';
import { SectionTitle } from '../../components/typography/Headings';
import { PageHeader } from '../../ui/raw-blocks';
import { cn } from 'lib/utils';
import { playersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { PlayerExportButton } from '../../components/export';

// ============================================================================
// TYPES
// ============================================================================

interface EmergencyContact {
  name?: string;
  phone?: string;
  relation?: string;
}

interface Profile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  profileImageUrl?: string;
  dateOfBirth?: string;
  birthDate?: string;
  gender?: string;
  club?: string;
  category?: string;
  handicap?: number;
  averageScore?: number;
  wagrRank?: number;
  weeklyTrainingHours?: number;
  currentPeriod?: string;
  emergencyContact?: EmergencyContact;
}

interface ProfileViewV2Props {
  profile: Profile;
  onUpdate?: (data: Partial<Profile>) => Promise<void>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCategoryColor = (category?: string): string => {
  const colors: Record<string, string> = {
    'A': 'rgb(var(--category-a))', // TIER Gold
    'B': 'rgb(var(--category-b))', // Dark Gold
    'C': 'rgb(var(--category-c))', // Bronze Gold
  };
  return colors[category || ''] || 'rgb(var(--text-tertiary))';
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const calculateAge = (birthDate?: string | null): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const getGenderLabel = (gender?: string): string => {
  if (!gender) return '-';
  if (gender === 'male') return 'Male';
  if (gender === 'female') return 'Female';
  return gender;
};

const getPeriodLabel = (period?: string): string => {
  if (!period) return '-';
  const labels: Record<string, string> = {
    E: 'Evaluation',
    G: 'Foundation',
    S: 'Specialization',
    T: 'Tournament',
  };
  return labels[period] || period;
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  value: string | number | null | undefined;
  label: string;
  icon: React.ReactNode;
  category?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, category }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1">
    <div className="flex items-center justify-between mb-2">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: category ? getCategoryColor(category) + '20' : 'rgb(var(--surface-secondary))' }}
      >
        <div style={{ color: category ? getCategoryColor(category) : 'rgb(var(--text-secondary))' }}>
          {icon}
        </div>
      </div>
    </div>
    <div className="text-3xl font-bold mb-1" style={{ color: category ? getCategoryColor(category) : 'rgb(var(--text-primary))' }}>
      {value || '-'}
    </div>
    <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
      {label}
    </div>
  </div>
);

// ============================================================================
// PROFILE FIELD COMPONENT
// ============================================================================

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="text-gray-500 mt-0.5">{icon}</div>
    <div className="flex flex-col gap-0.5 flex-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || '-'}</span>
    </div>
  </div>
);

// ============================================================================
// PROFILE SECTION COMPONENT
// ============================================================================

interface ProfileSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ icon, title, children, accentColor = 'rgb(var(--tier-navy))' }) => (
  <Card className="border border-gray-200">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accentColor + '20' }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
      </div>
    </CardHeader>
    <Separator />
    <CardContent className="pt-4 space-y-2">
      {children}
    </CardContent>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProfileViewV2: React.FC<ProfileViewV2Props> = ({ profile, onUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const age = calculateAge(profile.dateOfBirth || profile.birthDate);
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Name not set';

  const handleImageUpload = async (file: File) => {
    if (!onUpdate) return;

    setIsUploading(true);
    try {
      const response = await playersAPI.uploadProfileImage(file);
      const { imageUrl } = response.data.data;
      await onUpdate({ profileImageUrl: imageUrl });
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async () => {
    if (!onUpdate) return;

    try {
      await playersAPI.removeProfileImage();
      await onUpdate({ profileImageUrl: undefined });
    } catch (error) {
      console.error('Image removal failed:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage personal information, golf data and settings"
        helpText="Complete overview of your profile with personal information, contact details, golf statistics and training data. Upload profile picture, edit information and export your data. View handicap, category and WAGR ranking."
      />

      {/* Profile Header Card with Gradient */}
      <Card className="border-0 overflow-hidden">
        <div
          className="h-32"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--tier-navy)) 0%, rgb(var(--category-j)) 100%)'
          }}
        />
        <CardContent className="p-6 -mt-16 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              {/* Profile Image Upload */}
              <ProfileImageUpload
                currentImageUrl={profile.profileImageUrl}
                userName={fullName}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                size="xl"
              />

              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <SectionTitle className="text-2xl font-bold text-gray-900">
                  {fullName}
                </SectionTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {profile.club || 'No club registered'}
                  {profile.category && ` • Category ${profile.category}`}
                </p>
                {profile.handicap !== undefined && (
                  <Badge
                    className="mt-2 border-0"
                    style={{
                      backgroundColor: getCategoryColor(profile.category),
                      color: 'white'
                    }}
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    HCP {profile.handicap}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {user?.playerId && (
                <PlayerExportButton playerId={user.playerId} />
              )}
              <Button
                variant="outline"
                onClick={() => navigate('/profil/rediger')}
                className="border-2"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          value={profile.handicap}
          label="Handicap"
          icon={<Trophy size={20} />}
          category={profile.category}
        />
        <StatCard
          value={profile.averageScore}
          label="Avg score"
          icon={<Activity size={20} />}
        />
        <StatCard
          value={profile.category}
          label="Category"
          icon={<Award size={20} />}
          category={profile.category}
        />
        <StatCard
          value={age}
          label="Age"
          icon={<Calendar size={20} />}
        />
      </div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Information */}
        <ProfileSection
          icon={<User className="w-5 h-5" />}
          title="Personal information"
          accentColor="rgb(var(--tier-navy))"
        >
          <ProfileField
            icon={<User className="w-4 h-4" />}
            label="Full name"
            value={fullName}
          />
          <ProfileField
            icon={<Calendar className="w-4 h-4" />}
            label="Date of birth"
            value={formatDate(profile.dateOfBirth || profile.birthDate)}
          />
          <ProfileField
            icon={<Flag className="w-4 h-4" />}
            label="Gender"
            value={getGenderLabel(profile.gender)}
          />
        </ProfileSection>

        {/* Contact Information */}
        <ProfileSection
          icon={<Mail className="w-5 h-5" />}
          title="Contact information"
          accentColor="rgb(var(--status-success))"
        >
          <ProfileField
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={profile.email}
          />
          <ProfileField
            icon={<Phone className="w-4 h-4" />}
            label="Phone"
            value={profile.phone}
          />
          <ProfileField
            icon={<MapPin className="w-4 h-4" />}
            label="Address"
            value={profile.address}
          />
        </ProfileSection>

        {/* Golf Profile */}
        <ProfileSection
          icon={<Target className="w-5 h-5" />}
          title="Golf profile"
          accentColor="rgb(var(--tier-gold))"
        >
          <ProfileField
            icon={<Flag className="w-4 h-4" />}
            label="Home club"
            value={profile.club}
          />
          <ProfileField
            icon={<Award className="w-4 h-4" />}
            label="Handicap"
            value={profile.handicap}
          />
          <ProfileField
            icon={<Target className="w-4 h-4" />}
            label="Avg score"
            value={profile.averageScore}
          />
          <ProfileField
            icon={<Trophy className="w-4 h-4" />}
            label="WAGR ranking"
            value={profile.wagrRank}
          />
        </ProfileSection>

        {/* Training */}
        <ProfileSection
          icon={<Activity className="w-5 h-5" />}
          title="Training"
          accentColor="rgb(var(--category-j))"
        >
          <ProfileField
            icon={<Calendar className="w-4 h-4" />}
            label="Hours per week"
            value={profile.weeklyTrainingHours ? `${profile.weeklyTrainingHours} hours` : undefined}
          />
          <ProfileField
            icon={<Target className="w-4 h-4" />}
            label="Current period"
            value={getPeriodLabel(profile.currentPeriod)}
          />
        </ProfileSection>
      </div>

      {/* Update Profile Link */}
      <Card className="bg-gray-50 border-0">
        <CardContent className="p-6 text-center">
          <Button
            onClick={() => navigate('/profil/oppdater')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
          >
            Update full profile
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-600 mt-3">
            Go through all profile data including school, health and goals
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileViewV2;
