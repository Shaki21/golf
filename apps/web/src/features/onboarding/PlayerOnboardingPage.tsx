/**
 * PlayerOnboardingPage
 *
 * Single-page onboarding flow for new players
 * All steps collected on one page with sections
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea } from '../../components/shadcn';
import { User, Trophy, Target, Users, CheckCircle } from 'lucide-react';
import { TIERGolfFullLogo } from '../../components/branding/TIERGolfFullLogo';

interface OnboardingData {
  // Personal information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  phone: string;

  // Golf profile
  handicap: string;
  category: 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | '';
  club: string;
  school: string;

  // Goals
  goals: string[];
  customGoal: string;

  // Coach selection
  coachId: string;

  // Emergency contact
  emergencyContactFirstName: string;
  emergencyContactLastName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
}

export default function PlayerOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    handicap: '',
    category: '',
    club: '',
    school: '',
    goals: [],
    customGoal: '',
    coachId: '',
    emergencyContactFirstName: '',
    emergencyContactLastName: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
  });

  const [coaches, setCoaches] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);

  // Calculate if player is under 18
  const isUnder18 = useMemo(() => {
    if (!data.dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(data.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  }, [data.dateOfBirth]);

  // Fetch coaches on mount
  React.useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await apiClient.get('/coaches');
        setCoaches(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch coaches:', err);
      }
    };
    fetchCoaches();
  }, []);

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Combine standard goals with custom goal
      const allGoals = [...data.goals];
      if (data.customGoal.trim()) {
        allGoals.push(data.customGoal.trim());
      }

      const playerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        handicap: parseFloat(data.handicap) || null,
        category: data.category || 'K',
        club: data.club,
        school: data.school,
        goals: allGoals,
        coachId: data.coachId && data.coachId !== 'none' ? data.coachId : null,
        emergencyContact: {
          name: `${data.emergencyContactFirstName} ${data.emergencyContactLastName}`.trim(),
          phone: data.emergencyContactPhone,
          email: data.emergencyContactEmail,
        },
      };

      await apiClient.post('/api/v1/players/onboarding', playerData);

      // Navigate to dashboard after successful onboarding
      navigate('/');
    } catch (err: any) {
      console.error('Onboarding failed:', err);
      setError(err.response?.data?.message || 'Could not complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedGoals = [
    'Become a professional golfer',
    'Play on the national team',
    'Win junior championship',
    'Reach category A',
    'Improve handicap by 5 strokes',
    'Qualify for national tournaments',
  ];

  return (
    <div className="min-h-screen bg-tier-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <TIERGolfFullLogo height={48} variant="dark" />
          </div>
          <p className="text-[16px] text-tier-text-secondary">
            Fill in the information below to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tier-navy/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-tier-navy" />
                </div>
                <CardTitle>Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={data.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={data.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <Select value={data.gender} onValueChange={(val) => handleInputChange('gender', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-tier-navy">
                  Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="tel"
                  value={data.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. Golf Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tier-navy/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-tier-navy" />
                </div>
                <CardTitle>Golf Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Handicap
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={data.handicap}
                    onChange={(e) => handleInputChange('handicap', e.target.value)}
                    placeholder="5.4"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Player Category
                  </label>
                  <Select value={data.category} onValueChange={(val) => handleInputChange('category', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F">Category F (HCP +6 to +2)</SelectItem>
                      <SelectItem value="G">Category G (HCP +1.9 to 4.4)</SelectItem>
                      <SelectItem value="H">Category H (HCP 4.5 to 11.4)</SelectItem>
                      <SelectItem value="I">Category I (HCP 11.5 to 18.4)</SelectItem>
                      <SelectItem value="J">Category J (HCP 18.5 to 26.4)</SelectItem>
                      <SelectItem value="K">Category K (HCP 26.5 to 54)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Club
                  </label>
                  <Input
                    value={data.club}
                    onChange={(e) => handleInputChange('club', e.target.value)}
                    placeholder="Oslo GK"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-tier-navy">
                  Sports Academy
                </label>
                <Select value={data.school} onValueChange={(val) => handleInputChange('school', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sports academy (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No sports academy</SelectItem>

                    {/* WANG Toppidrett */}
                    <SelectItem value="WANG Toppidrett Oslo">WANG Toppidrett Oslo</SelectItem>
                    <SelectItem value="WANG Toppidrett Romerike">WANG Toppidrett Romerike</SelectItem>
                    <SelectItem value="WANG Toppidrett Tønsberg">WANG Toppidrett Tønsberg</SelectItem>
                    <SelectItem value="WANG Toppidrett Fredrikstad">WANG Toppidrett Fredrikstad</SelectItem>
                    <SelectItem value="WANG Toppidrett Stavanger">WANG Toppidrett Stavanger</SelectItem>

                    {/* NTG */}
                    <SelectItem value="NTG Bærum">NTG Bærum</SelectItem>
                    <SelectItem value="NTG Bergen">NTG Bergen</SelectItem>

                    {/* WANG UNG */}
                    <SelectItem value="WANG UNG Oslo">WANG UNG Oslo</SelectItem>
                    <SelectItem value="WANG UNG Romerike">WANG UNG Romerike</SelectItem>
                    <SelectItem value="WANG UNG Sandefjord">WANG UNG Sandefjord</SelectItem>
                    <SelectItem value="WANG UNG Fredrikstad">WANG UNG Fredrikstad</SelectItem>
                    <SelectItem value="WANG UNG Stavanger">WANG UNG Stavanger</SelectItem>

                    {/* NTG U */}
                    <SelectItem value="NTG U Bærum">NTG U Bærum</SelectItem>

                    {/* TEAM Norway */}
                    <SelectItem value="TEAM Norway Ung">TEAM Norway Ung</SelectItem>
                    <SelectItem value="TEAM Norway Junior">TEAM Norway Junior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 3. Goals and Ambitions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tier-navy/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-tier-navy" />
                </div>
                <CardTitle>Goals and Ambitions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-tier-navy">
                  Select your goals (you can select multiple)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedGoals.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleGoalToggle(goal)}
                      className={`
                        px-4 py-3 rounded-lg border-2 text-left transition-all
                        ${data.goals.includes(goal)
                          ? 'border-tier-navy bg-tier-navy/5 text-tier-navy'
                          : 'border-tier-border-default text-tier-text-secondary hover:border-tier-navy/50'
                        }
                      `}
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          data.goals.includes(goal) ? 'text-tier-navy' : 'text-tier-text-tertiary'
                        }`} />
                        <span className="text-sm">{goal}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-tier-navy">
                  Custom goal (optional)
                </label>
                <Textarea
                  value={data.customGoal}
                  onChange={(e) => handleInputChange('customGoal', e.target.value)}
                  placeholder="Describe your own goal..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Coach Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tier-navy/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-tier-navy" />
                </div>
                <CardTitle>Select Coach</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-tier-navy">
                  Coach (optional)
                </label>
                <Select value={data.coachId} onValueChange={(val) => handleInputChange('coachId', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No coach (can be changed later)</SelectItem>
                    {Array.isArray(coaches) && coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.firstName} {coach.lastName}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 5. Emergency Contact / Fullmakt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isUnder18 ? 'Authorization (Parent/Guardian)' : 'Emergency Contact'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    First Name {isUnder18 && <span className="text-status-error">*</span>}
                  </label>
                  <Input
                    value={data.emergencyContactFirstName}
                    onChange={(e) => handleInputChange('emergencyContactFirstName', e.target.value)}
                    placeholder="John"
                    required={isUnder18}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Last Name {isUnder18 && <span className="text-status-error">*</span>}
                  </label>
                  <Input
                    value={data.emergencyContactLastName}
                    onChange={(e) => handleInputChange('emergencyContactLastName', e.target.value)}
                    placeholder="Doe"
                    required={isUnder18}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Phone {isUnder18 && <span className="text-status-error">*</span>}
                  </label>
                  <Input
                    type="tel"
                    value={data.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    required={isUnder18}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tier-navy">
                    Email {isUnder18 && <span className="text-status-error">*</span>}
                  </label>
                  <Input
                    type="email"
                    value={data.emergencyContactEmail}
                    onChange={(e) => handleInputChange('emergencyContactEmail', e.target.value)}
                    placeholder="parent@example.com"
                    required={isUnder18}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? 'Completing...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
