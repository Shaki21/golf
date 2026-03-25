// @ts-nocheck
import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Flag, Award,
  Target, Heart, Edit2, ChevronRight, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Separator,
} from '../../components/shadcn';
import { SectionTitle } from '../../components/typography/Headings';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { cn } from 'lib/utils';

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

interface ProfileViewProps {
  profile: Profile;
  onUpdate?: (data: Partial<Profile>) => Promise<void>;
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatItemProps {
  value: string | number | null | undefined;
  label: string;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, highlight }) => (
  <div className="flex flex-col items-center text-center p-2">
    <span className={cn(
      "text-2xl font-bold",
      highlight ? "text-tier-navy" : "text-text-primary"
    )}>
      {value || '-'}
    </span>
    <span className="text-xs text-text-secondary mt-1">{label}</span>
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
  <div className="flex items-start gap-3">
    <div className="text-text-secondary mt-0.5">{icon}</div>
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-text-secondary uppercase tracking-wide">{label}</span>
      <span className="text-sm text-text-primary">{value || '-'}</span>
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
    <CardContent className="pt-4 space-y-4">
      {children}
    </CardContent>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdate }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

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

  const age = calculateAge(profile.dateOfBirth || profile.birthDate);
  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="My Profile"
        subtitle="Your personal profile and information"
        sticky={true}
      />
      <PageContainer paddingY="md" background="base" fullWidth={true}>
        <div className="space-y-6">

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profileImageUrl} alt={profile.firstName} />
                <AvatarFallback className="text-2xl font-semibold bg-tier-navy text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <SectionTitle className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </SectionTitle>
                <p className="text-sm text-text-secondary">
                  {profile.club || 'No club registered'}
                  {profile.category && ` • Category ${profile.category}`}
                </p>
                {profile.averageScore && (
                  <Badge className="mt-2 bg-achievement text-white border-0">
                    <Trophy className="w-3 h-3 mr-1" />
                    Avg {profile.averageScore}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatItem value={profile.averageScore} label="Avg Score" highlight />
            <StatItem value={profile.category} label="Category" />
            <StatItem value={age} label="Age" />
            <StatItem value={profile.wagrRank} label="WAGR Rank" />
          </div>
        </CardContent>
      </Card>

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
            label="Name"
            value={`${profile.firstName || ''} ${profile.lastName || ''}`.trim()}
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
            icon={<Target className="w-4 h-4" />}
            label="Avg score"
            value={profile.averageScore}
          />
          <ProfileField
            icon={<Award className="w-4 h-4" />}
            label="WAGR ranking"
            value={profile.wagrRank}
          />
          <ProfileField
            icon={<Calendar className="w-4 h-4" />}
            label="Category"
            value={profile.category}
          />
        </ProfileSection>

        {/* Training */}
        <ProfileSection
          icon={<Calendar className="w-5 h-5" />}
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

        {/* Emergency Contact */}
        {profile.emergencyContact && (
          <ProfileSection
            icon={<Heart className="w-5 h-5" />}
            title="Emergency contact"
            accentColor="rgb(var(--status-error))"
          >
            <ProfileField
              icon={<User className="w-4 h-4" />}
              label="Name"
              value={profile.emergencyContact.name}
            />
            <ProfileField
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={profile.emergencyContact.phone}
            />
            <ProfileField
              icon={<User className="w-4 h-4" />}
              label="Relation"
              value={profile.emergencyContact.relation}
            />
          </ProfileSection>
        )}
      </div>

      {/* Update Profile Link */}
      <Card className="bg-background-elevated border-0">
        <CardContent className="p-6 text-center">
          <Button onClick={() => navigate('/profil/oppdater')} size="lg">
            Update full profile
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-text-secondary mt-3">
            Go through all profile data including school, health and goals
          </p>
        </CardContent>
      </Card>
        </div>
      </PageContainer>
    </div>
  );
};

export default ProfileView;
