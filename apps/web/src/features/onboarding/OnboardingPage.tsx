/**
 * OnboardingPage - TIER Golf
 *
 * Multi-step onboarding wizard that collects player intake data
 * and generates an annual training plan.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Check, User, Trophy, Activity,
  AlertTriangle, Calendar, Clock, Target, Loader2
} from 'lucide-react';
import { PageTitle, SectionTitle } from '../../ui/components/typography';
import { useAuth } from '../../contexts/AuthContext';
import { intakeAPI, trainingPlanAPI } from '../../services/api';
import { AKLogo } from '../../components/branding/AKLogo';

// Form sections
const sections = [
  { id: 'welcome', title: 'Welcome', subtitle: 'Let\'s start your journey', icon: User },
  { id: 'background', title: 'Golf Background', subtitle: 'Your experience and level', icon: Trophy },
  { id: 'availability', title: 'Availability', subtitle: 'Time and resources', icon: Clock },
  { id: 'goals', title: 'Goals', subtitle: 'Your objectives', icon: Target },
  { id: 'weaknesses', title: 'Focus Areas', subtitle: 'What do you want to improve?', icon: Activity },
  { id: 'health', title: 'Health', subtitle: 'Important information', icon: AlertTriangle },
  { id: 'complete', title: 'Generate Plan', subtitle: 'Your annual plan', icon: Calendar },
];

interface IntakeFormData {
  // Background
  yearsPlaying: number;
  currentHandicap: number;
  averageScore: number;
  roundsPerYear: number;
  trainingHistory: string;

  // Availability
  hoursPerWeek: number;
  preferredDays: string[];
  facilityAccess: string[];
  homeEquipment: string[];

  // Goals
  primaryGoal: string;
  targetHandicap: number;
  targetScore: number;
  timeframe: string;
  tournaments: string[];

  // Weaknesses
  biggestFrustration: string;
  problemAreas: string[];
  mentalChallenges: string[];
  physicalLimitations: string[];

  // Health
  currentInjuries: string[];
  pastInjuries: string[];
  chronicConditions: string[];
  mobilityIssues: string[];
  ageGroup: string;
}

const defaultFormData: IntakeFormData = {
  yearsPlaying: 5,
  currentHandicap: 15,
  averageScore: 85,
  roundsPerYear: 30,
  trainingHistory: 'regular',

  hoursPerWeek: 10,
  preferredDays: ['monday', 'wednesday', 'friday'],
  facilityAccess: ['range', 'course'],
  homeEquipment: [],

  primaryGoal: 'lower_handicap',
  targetHandicap: 10,
  targetScore: 80,
  timeframe: '12_months',
  tournaments: [],

  biggestFrustration: '',
  problemAreas: [],
  mentalChallenges: [],
  physicalLimitations: [],

  currentInjuries: [],
  pastInjuries: [],
  chronicConditions: [],
  mobilityIssues: [],
  ageGroup: '25-35',
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IntakeFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planGenerated, setPlanGenerated] = useState(false);

  const updateFormData = (updates: Partial<IntakeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitIntakeAndGeneratePlan = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!user?.playerId) {
      setError('Could not find player ID. Please try logging in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Map day names to numbers (0=Sunday, 1=Monday, etc.)
      const dayNameToNumber: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      };
      const preferredDaysAsNumbers = formData.preferredDays
        .map(day => dayNameToNumber[day.toLowerCase()])
        .filter((n): n is number => n !== undefined);

      // Map trainingHistory to valid enum
      const trainingHistoryMap: Record<string, string> = {
        none: 'none', some: 'sporadic', sporadic: 'sporadic',
        regular: 'regular', systematic: 'systematic',
      };
      const validTrainingHistory = trainingHistoryMap[formData.trainingHistory] || 'regular';

      // Map primaryGoal to valid enum
      const goalMap: Record<string, string> = {
        handicap: 'lower_handicap', lower_handicap: 'lower_handicap',
        tournament: 'compete_tournaments', compete_tournaments: 'compete_tournaments',
        consistency: 'consistency', enjoy: 'enjoy_more', enjoy_more: 'enjoy_more',
        specific: 'specific_skill', specific_skill: 'specific_skill',
      };
      const validPrimaryGoal = goalMap[formData.primaryGoal] || 'lower_handicap';

      // Submit intake form to backend
      const intakePayload = {
        playerId: user.playerId,
        background: {
          yearsPlaying: formData.yearsPlaying,
          currentHandicap: formData.currentHandicap,
          averageScore: formData.averageScore,
          roundsPerYear: formData.roundsPerYear,
          trainingHistory: validTrainingHistory,
        },
        availability: {
          hoursPerWeek: formData.hoursPerWeek,
          preferredDays: preferredDaysAsNumbers,
          canTravelToFacility: formData.facilityAccess.length > 0,
          hasHomeEquipment: formData.homeEquipment.length > 0,
        },
        goals: {
          primaryGoal: validPrimaryGoal,
          targetHandicap: formData.targetHandicap,
          targetScore: formData.targetScore,
          timeframe: formData.timeframe,
          tournaments: formData.tournaments?.map(t => ({
            name: typeof t === 'string' ? t : (t as any).name || 'Tournament',
            date: new Date(),
            importance: 'minor' as const,
          })),
        },
        weaknesses: {
          biggestFrustration: formData.biggestFrustration || 'None specific',
          problemAreas: formData.problemAreas,
          mentalChallenges: formData.mentalChallenges,
          physicalLimitations: formData.physicalLimitations?.map(p => ({
            area: 'back' as const,
            severity: 'mild' as const,
            affectsSwing: false,
          })),
        },
        health: {
          currentInjuries: formData.currentInjuries?.map(i => ({
            type: typeof i === 'string' ? i : 'injury',
            resolved: false,
            requiresModification: false,
            affectedAreas: [],
          })) || [],
          injuryHistory: formData.pastInjuries?.map(i => ({
            type: typeof i === 'string' ? i : 'injury',
            resolved: true,
            requiresModification: false,
            affectedAreas: [],
          })) || [],
          chronicConditions: formData.chronicConditions,
          mobilityIssues: formData.mobilityIssues,
          ageGroup: formData.ageGroup,
        },
      };

      const intakeResponse = await intakeAPI.submit(intakePayload);
      const intakeId = intakeResponse.data?.data?.id;

      if (!intakeId) {
        throw new Error('Could not save intake form');
      }

      // Generate annual plan
      setIsGeneratingPlan(true);
      await intakeAPI.generatePlan(intakeId);

      setPlanGenerated(true);

      // Wait a moment then redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsGeneratingPlan(false);
    }
  };

  const renderWelcome = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ marginBottom: 32 }}>
        <AKLogo size={80} color="var(--tier-navy)" />
      </div>
      <PageTitle style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'var(--tier-navy)' }}>
        Welcome to TIER Golf, {user?.firstName}!
      </PageTitle>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px' }}>
        We will now collect some information about you to create a personalized annual plan
        tailored to your goals and availability.
      </p>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        This takes approximately 5-10 minutes
      </p>
    </div>
  );

  const renderBackground = () => (
    <div style={{ padding: '20px' }}>
      <SectionTitle style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Your Golf Background</SectionTitle>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          How many years have you played golf?
        </label>
        <input
          type="number"
          value={formData.yearsPlaying}
          onChange={(e) => updateFormData({ yearsPlaying: parseInt(e.target.value) || 0 })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Current handicap
        </label>
        <input
          type="number"
          step="0.1"
          value={formData.currentHandicap}
          onChange={(e) => updateFormData({ currentHandicap: parseFloat(e.target.value) || 0 })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Average score (18 holes)
        </label>
        <input
          type="number"
          value={formData.averageScore}
          onChange={(e) => updateFormData({ averageScore: parseInt(e.target.value) || 0 })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Number of rounds per year
        </label>
        <input
          type="number"
          value={formData.roundsPerYear}
          onChange={(e) => updateFormData({ roundsPerYear: parseInt(e.target.value) || 0 })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        />
      </div>
    </div>
  );

  const renderAvailability = () => (
    <div style={{ padding: '20px' }}>
      <SectionTitle style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Availability</SectionTitle>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Hours available per week for training
        </label>
        <input
          type="number"
          value={formData.hoursPerWeek}
          onChange={(e) => updateFormData({ hoursPerWeek: parseInt(e.target.value) || 0 })}
          min={1}
          max={40}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Recommended: 8-15 hours per week for good progress
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Preferred training days
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
            const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i];
            const isSelected = formData.preferredDays.includes(dayKey);
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const newDays = isSelected
                    ? formData.preferredDays.filter(d => d !== dayKey)
                    : [...formData.preferredDays, dayKey];
                  updateFormData({ preferredDays: newDays });
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: isSelected ? 'none' : '1px solid rgb(var(--border-color))',
                  backgroundColor: isSelected ? 'var(--tier-navy)' : 'white',
                  color: isSelected ? 'white' : 'var(--tier-navy)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div style={{ padding: '20px' }}>
      <SectionTitle style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Your Goals</SectionTitle>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Primary goal
        </label>
        <select
          value={formData.primaryGoal}
          onChange={(e) => updateFormData({ primaryGoal: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        >
          <option value="handicap">Lower handicap</option>
          <option value="tournaments">Perform in tournaments</option>
          <option value="consistency">Become more consistent</option>
          <option value="enjoyment">Have fun and stay in shape</option>
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Target handicap
        </label>
        <input
          type="number"
          step="0.1"
          value={formData.targetHandicap}
          onChange={(e) => updateFormData({ targetHandicap: parseFloat(e.target.value) || 0 })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Timeframe
        </label>
        <select
          value={formData.timeframe}
          onChange={(e) => updateFormData({ timeframe: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        >
          <option value="3_months">3 months</option>
          <option value="6_months">6 months</option>
          <option value="12_months">12 months (recommended)</option>
        </select>
      </div>
    </div>
  );

  const renderWeaknesses = () => (
    <div style={{ padding: '20px' }}>
      <SectionTitle style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Focus Areas</SectionTitle>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          What is your biggest frustration with your golf game?
        </label>
        <textarea
          value={formData.biggestFrustration}
          onChange={(e) => updateFormData({ biggestFrustration: e.target.value })}
          placeholder="E.g. inconsistency, slice, putting..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Which areas do you want to improve?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Driver', 'Irons', 'Wedges', 'Putting', 'Bunker', 'Mental', 'Physical'].map((area) => {
            const isSelected = formData.problemAreas.includes(area.toLowerCase());
            return (
              <button
                key={area}
                type="button"
                onClick={() => {
                  const key = area.toLowerCase();
                  const newAreas = isSelected
                    ? formData.problemAreas.filter(a => a !== key)
                    : [...formData.problemAreas, key];
                  updateFormData({ problemAreas: newAreas });
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: isSelected ? 'none' : '1px solid rgb(var(--border-color))',
                  backgroundColor: isSelected ? 'var(--tier-navy)' : 'white',
                  color: isSelected ? 'white' : 'var(--tier-navy)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderHealth = () => (
    <div style={{ padding: '20px' }}>
      <SectionTitle style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Health and Fitness</SectionTitle>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Age group
        </label>
        <select
          value={formData.ageGroup}
          onChange={(e) => updateFormData({ ageGroup: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
          }}
        >
          <option value="under_18">Under 18</option>
          <option value="18-25">18-25</option>
          <option value="25-35">25-35</option>
          <option value="35-45">35-45</option>
          <option value="45-55">45-55</option>
          <option value="55-65">55-65</option>
          <option value="65+">65+</option>
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Do you have any injuries or physical limitations?
        </label>
        <textarea
          value={formData.currentInjuries.join(', ')}
          onChange={(e) => updateFormData({
            currentInjuries: e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
          })}
          placeholder="E.g. back problems, shoulder pain (leave empty if none)"
          rows={2}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgb(var(--border-color))',
            fontSize: 16,
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  );

  const renderComplete = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      {planGenerated ? (
        <>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgb(var(--status-success))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Check size={40} color="white" />
          </div>
          <SectionTitle style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
            Your annual plan is ready!
          </SectionTitle>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            We have created a personalized training plan based on your goals and availability.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Redirecting you to the dashboard...
          </p>
        </>
      ) : (
        <>
          <SectionTitle style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
            All set!
          </SectionTitle>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            We now have all the information we need to create your personalized annual plan.
          </p>

          {error && (
            <div style={{
              padding: 16,
              backgroundColor: 'var(--tier-error/10)',
              borderRadius: 8,
              color: 'rgb(var(--status-error))',
              marginBottom: 24,
            }}>
              {error}
            </div>
          )}

          <button
            onClick={submitIntakeAndGeneratePlan}
            disabled={isSubmitting || isGeneratingPlan}
            style={{
              padding: '16px 32px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'var(--tier-navy)',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              margin: '0 auto',
            }}
          >
            {isGeneratingPlan ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating annual plan...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Calendar size={20} />
                Generate my annual plan
              </>
            )}
          </button>
        </>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (sections[currentStep].id) {
      case 'welcome': return renderWelcome();
      case 'background': return renderBackground();
      case 'availability': return renderAvailability();
      case 'goals': return renderGoals();
      case 'weaknesses': return renderWeaknesses();
      case 'health': return renderHealth();
      case 'complete': return renderComplete();
      default: return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--tier-surface-base)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Progress bar */}
      <div style={{
        height: 4,
        backgroundColor: 'rgb(var(--border-color))',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div
          style={{
            height: '100%',
            backgroundColor: 'var(--tier-navy)',
            width: `${((currentStep + 1) / sections.length) * 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgb(var(--border-color))',
        backgroundColor: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AKLogo size={32} color="var(--tier-navy)" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {sections[currentStep].title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Step {currentStep + 1} of {sections.length}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%' }}>
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      {currentStep < sections.length - 1 && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgb(var(--border-color))',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: '1px solid rgb(var(--border-color))',
              backgroundColor: 'white',
              color: currentStep === 0 ? 'var(--text-muted)' : 'var(--tier-navy)',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <button
            onClick={nextStep}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'var(--tier-navy)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
