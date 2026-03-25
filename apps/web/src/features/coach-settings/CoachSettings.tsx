/**
 * CoachSettings.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Camera,  // Used by ProfileImageUpload
  Mail,
  Phone,
  Save,
  ChevronRight,
  Check,
  Settings,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { coachesAPI, settingsAPI, CoachNotificationSettings } from '../../services/api';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { useToast } from '../../components/shadcn/use-toast';

// ============================================================================
// COMPONENTS
// ============================================================================

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`w-12 h-[26px] rounded-[13px] border-none relative cursor-pointer transition-colors ${
      enabled ? 'bg-tier-navy' : 'bg-tier-border-default'
    }`}
  >
    <div
      className={`w-[22px] h-[22px] rounded-full bg-white absolute top-0.5 shadow transition-all ${
        enabled ? 'left-6' : 'left-0.5'
      }`}
    />
  </button>
);

// ============================================================================
// PROFILE IMAGE UPLOAD COMPONENT
// ============================================================================

interface ProfileImageUploadProps {
  currentImage?: string;
  initials: string;
  onUploadComplete: (imageUrl: string) => void;
  userId?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  initials,
  onUploadComplete,
  userId
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [dragActive, setDragActive] = useState(false);

  // Sync preview with currentImage when it changes
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const validateImage = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return 'Kun JPG og PNG filer er tillatt';
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return 'Bildet må være mindre enn 2MB';
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    // Validate the file
    const validationError = validateImage(file);
    if (validationError) {
      toast({
        title: 'Ugyldig fil',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'profile');
      if (userId) {
        formData.append('userId', userId);
      }

      // For now, convert to base64 data URL since we don't have a dedicated upload endpoint
      // In a production environment, this should upload to S3 via a backend endpoint
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;

        // Notify parent with the data URL
        // Note: In production, this should be an S3 URL from the backend
        onUploadComplete(dataUrl);

        toast({
          title: 'Bilde oppdatert',
          description: 'Profilbildet ditt er nå oppdatert',
        });
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Opplastingsfeil',
        description: 'Kunne ikke laste opp bildet. Prøv igjen.',
        variant: 'destructive',
      });
      // Revert preview on error
      setPreview(currentImage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(undefined);
    onUploadComplete('');
    toast({
      title: 'Bilde fjernet',
      description: 'Profilbildet er fjernet',
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Preview */}
      <div
        className={`relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center ${
          dragActive ? 'ring-2 ring-tier-navy ring-offset-2' : ''
        } ${preview ? '' : 'bg-tier-navy/15'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Profilbilde"
              className="w-full h-full object-cover"
            />
            {/* Overlay with remove button */}
            <button
              onClick={handleRemoveImage}
              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Fjern bilde"
            >
              <X size={24} className="text-white" />
            </button>
          </>
        ) : (
          <span className="text-[28px] font-semibold text-tier-navy">
            {initials}
          </span>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 size={24} className="text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Last opp profilbilde"
        />
        <Button
          variant="secondary"
          className="mb-1.5"
          leftIcon={isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          {isUploading ? 'Laster opp...' : 'Last opp bilde'}
        </Button>
        <p className="text-xs text-tier-text-secondary m-0">
          JPG, PNG maks 2MB
        </p>
      </div>
    </div>
  );
};

interface CoachProfile {
  name: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  avatar?: string;
}

// Use imported CoachNotificationSettings from api.ts
type NotificationSettings = CoachNotificationSettings;

interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  language: 'no' | 'en';
  compactView: boolean;
  showPlayerPhotos: boolean;
}

export const CoachSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'display' | 'privacy'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<CoachProfile>({
    name: '',
    email: '',
    phone: '',
    title: '',
    bio: '',
    avatar: undefined
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newBooking: true,
    bookingReminder: true,
    playerUpdate: true,
    tournamentResults: true,
    systemUpdates: false,
    emailNotifications: true,
    pushNotifications: true
  });

  const [display, setDisplay] = useState<DisplaySettings>({
    theme: 'light',
    language: 'no',
    compactView: false,
    showPlayerPhotos: true
  });

  // Fetch coach profile on mount
  const fetchProfile = useCallback(async () => {
    if (!user?.coachId && !user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const coachId = user.coachId || user.id;
      const response = await coachesAPI.getById(coachId);
      const data = response.data?.data || response.data;

      if (data) {
        setProfile({
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || '',
          email: data.email || data.user?.email || '',
          phone: data.phone || data.user?.phone || '',
          title: data.specialization || data.title || 'Trener',
          bio: data.bio || data.description || '',
          avatar: data.avatar || data.profileImage,
        });

        // Load notification settings if available
        if (data.notificationSettings) {
          setNotifications({
            ...notifications,
            ...data.notificationSettings,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Kunne ikke laste profil');
    } finally {
      setIsLoading(false);
    }
  }, [user?.coachId, user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!user?.coachId && !user?.id) return;

    setIsSaving(true);
    setError(null);
    try {
      const coachId = user.coachId || user.id;

      // Split name into first and last
      const nameParts = profile.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Save profile (including avatar if set)
      await coachesAPI.update(coachId, {
        firstName,
        lastName,
        phone: profile.phone,
        specialization: profile.title,
        bio: profile.bio,
        profileImage: profile.avatar,
      });

      // Save notification settings
      await settingsAPI.saveNotifications(notifications);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Kunne ikke lagre endringer');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-tier-surface-base min-h-screen flex items-center justify-center">
        <StateCard variant="loading" title="Laster innstillinger..." />
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'notifications', label: 'Varsler', icon: Bell },
    { key: 'display', label: 'Visning', icon: Sun },
    { key: 'privacy', label: 'Personvern', icon: Shield }
  ];

  return (
    <div className="bg-tier-surface-base min-h-screen">
      {/* TIER-compliant PageHeader */}
      <PageHeader
        title="Innstillinger"
        subtitle="Administrer din profil og preferanser"
        helpText="Administrer din trenerprofil, notifikasjonspreferanser, tilgjengelighet og andre innstillinger. Oppdater kontaktinformasjon og arbeidsplan."
      />

      <PageContainer paddingY="md">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-60 flex-shrink-0">
            <div className="bg-tier-white rounded-2xl border border-tier-border-default overflow-hidden">
              {tabs.map(tab => {
                const isActive = activeTab === tab.key;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`w-full py-3.5 px-4 border-none flex items-center gap-3 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-tier-navy/10 border-l-[3px] border-l-tier-navy'
                        : 'bg-transparent border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? 'text-tier-navy' : 'text-tier-text-secondary'}
                    />
                    <span className={`text-sm ${isActive ? 'font-semibold text-tier-navy' : 'font-medium text-tier-text-secondary'}`}>
                      {tab.label}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`text-tier-text-secondary ml-auto ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-tier-white rounded-2xl border border-tier-border-default p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-5">
                  Profilinformasjon
                </SectionTitle>

                {/* Avatar */}
                <div className="mb-6">
                  <ProfileImageUpload
                    currentImage={profile.avatar}
                    initials={profile.name.split(' ').map(n => n[0]).join('')}
                    onUploadComplete={(imageUrl) => setProfile({ ...profile, avatar: imageUrl })}
                    userId={user?.coachId || user?.id}
                  />
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[13px] font-medium text-tier-text-secondary mb-1.5">
                      Fullt navn
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-lg border border-tier-border-default text-sm text-tier-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-tier-text-secondary mb-1.5">
                      Tittel
                    </label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-lg border border-tier-border-default text-sm text-tier-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[13px] font-medium text-tier-text-secondary mb-1.5">
                      <Mail size={12} className="mr-1.5 inline" />
                      E-post
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-lg border border-tier-border-default text-sm text-tier-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-tier-text-secondary mb-1.5">
                      <Phone size={12} className="mr-1.5 inline" />
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-lg border border-tier-border-default text-sm text-tier-navy"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-medium text-tier-text-secondary mb-1.5">
                    Bio / Beskrivelse
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full py-2.5 px-3.5 rounded-lg border border-tier-border-default text-sm text-tier-navy resize-y font-inherit"
                  />
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-5">
                  Varslingsinnstillinger
                </SectionTitle>

                <div className="mb-6">
                  <SubSectionTitle className="text-sm font-semibold text-tier-text-secondary m-0 mb-3 uppercase tracking-wide">
                    Aktivitetsvarsler
                  </SubSectionTitle>
                  {[
                    { key: 'newBooking', label: 'Nye bookingforespørsler', desc: 'Når en spiller ber om en økt' },
                    { key: 'bookingReminder', label: 'Bookingpåminnelser', desc: '24 timer før planlagte økter' },
                    { key: 'playerUpdate', label: 'Spilleroppdateringer', desc: 'Når spillere logger trening eller tester' },
                    { key: 'tournamentResults', label: 'Turneringsresultater', desc: 'Når spillere registrerer resultater' },
                    { key: 'systemUpdates', label: 'Systemoppdateringer', desc: 'Nyheter og oppdateringer fra plattformen' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-tier-border-default">
                      <div>
                        <p className="text-sm font-medium text-tier-navy m-0">
                          {item.label}
                        </p>
                        <p className="text-xs text-tier-text-secondary mt-0.5 m-0">
                          {item.desc}
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={!!notifications[item.key as keyof NotificationSettings]}
                        onToggle={() => setNotifications({
                          ...notifications,
                          [item.key]: !notifications[item.key as keyof NotificationSettings]
                        })}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <SubSectionTitle className="text-sm font-semibold text-tier-text-secondary m-0 mb-3 uppercase tracking-wide">
                    Leveringsmetode
                  </SubSectionTitle>
                  {[
                    { key: 'emailNotifications', label: 'E-postvarsler', icon: Mail },
                    { key: 'pushNotifications', label: 'Push-varsler', icon: Bell }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-tier-border-default">
                      <div className="flex items-center gap-2.5">
                        <item.icon size={18} className="text-tier-text-secondary" />
                        <span className="text-sm font-medium text-tier-navy">
                          {item.label}
                        </span>
                      </div>
                      <ToggleSwitch
                        enabled={!!notifications[item.key as keyof NotificationSettings]}
                        onToggle={() => setNotifications({
                          ...notifications,
                          [item.key]: !notifications[item.key as keyof NotificationSettings]
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display Tab */}
            {activeTab === 'display' && (
              <div>
                <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-5">
                  Visningsinnstillinger
                </SectionTitle>

                <div className="mb-6">
                  <label className="block text-[13px] font-medium text-tier-text-secondary mb-2.5">
                    Tema
                  </label>
                  <div className="flex gap-3">
                    {[
                      { key: 'light', label: 'Lyst', icon: Sun },
                      { key: 'dark', label: 'Mørkt', icon: Moon },
                      { key: 'system', label: 'System', icon: Settings }
                    ].map(option => {
                      const isSelected = display.theme === option.key;
                      return (
                        <button
                          key={option.key}
                          onClick={() => setDisplay({ ...display, theme: option.key as DisplaySettings['theme'] })}
                          className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'border-2 border-tier-navy bg-tier-navy/10'
                              : 'border border-tier-border-default bg-transparent'
                          }`}
                        >
                          <option.icon
                            size={24}
                            className={isSelected ? 'text-tier-navy' : 'text-tier-text-secondary'}
                          />
                          <span className={`text-sm ${isSelected ? 'font-semibold text-tier-navy' : 'font-medium text-tier-text-secondary'}`}>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[13px] font-medium text-tier-text-secondary mb-2.5">
                    <Globe size={14} className="mr-1.5 inline" />
                    Språk
                  </label>
                  <select
                    value={display.language}
                    onChange={(e) => setDisplay({ ...display, language: e.target.value as DisplaySettings['language'] })}
                    className="w-52 py-2.5 px-3.5 rounded-lg border border-tier-border-default text-sm text-tier-navy cursor-pointer"
                  >
                    <option value="no">Norsk</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <SubSectionTitle className="text-sm font-semibold text-tier-text-secondary m-0 mb-3 uppercase tracking-wide">
                    Visningsalternativer
                  </SubSectionTitle>
                  {[
                    { key: 'compactView', label: 'Kompakt visning', desc: 'Vis mer innhold med mindre mellomrom' },
                    { key: 'showPlayerPhotos', label: 'Vis spillerbilder', desc: 'Vis profilbilder i lister' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-tier-border-default">
                      <div>
                        <p className="text-sm font-medium text-tier-navy m-0">
                          {item.label}
                        </p>
                        <p className="text-xs text-tier-text-secondary mt-0.5 m-0">
                          {item.desc}
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={!!display[item.key as keyof DisplaySettings]}
                        onToggle={() => setDisplay({
                          ...display,
                          [item.key]: !display[item.key as keyof DisplaySettings]
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-5">
                  Personvern og sikkerhet
                </SectionTitle>

                <div className="p-4 bg-tier-navy/10 rounded-xl mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={20} className="text-tier-navy" />
                    <span className="text-sm font-semibold text-tier-navy">
                      Din konto er beskyttet
                    </span>
                  </div>
                  <p className="text-[13px] text-tier-text-secondary m-0">
                    Tofaktorautentisering er aktivert. Sist innlogget: I dag kl 08:45
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button className="flex items-center justify-between py-3.5 px-4 rounded-[10px] border border-tier-border-default bg-transparent cursor-pointer">
                    <span className="text-sm text-tier-navy">
                      Endre passord
                    </span>
                    <ChevronRight size={18} className="text-tier-text-secondary" />
                  </button>
                  <button className="flex items-center justify-between py-3.5 px-4 rounded-[10px] border border-tier-border-default bg-transparent cursor-pointer">
                    <span className="text-sm text-tier-navy">
                      Administrer tofaktorautentisering
                    </span>
                    <ChevronRight size={18} className="text-tier-text-secondary" />
                  </button>
                  <button className="flex items-center justify-between py-3.5 px-4 rounded-[10px] border border-tier-border-default bg-transparent cursor-pointer">
                    <span className="text-sm text-tier-navy">
                      Last ned mine data
                    </span>
                    <ChevronRight size={18} className="text-tier-text-secondary" />
                  </button>
                  <button className="flex items-center justify-between py-3.5 px-4 rounded-[10px] border border-tier-error/30 bg-tier-error/5 cursor-pointer">
                    <span className="text-sm text-tier-error">
                      Slett konto
                    </span>
                    <ChevronRight size={18} className="text-tier-error" />
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-5 border-t border-tier-border-default flex justify-end gap-3">
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-tier-success text-sm font-medium">
                  <Check size={16} />
                  Lagret!
                </div>
              )}
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                leftIcon={<Save size={16} />}
              >
                {isSaving ? 'Lagrer...' : 'Lagre endringer'}
              </Button>
            </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default CoachSettings;
