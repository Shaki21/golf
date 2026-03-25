/**
 * OnboardingPageV2 - TIER Golf
 *
 * Single-page onboarding with all sections visible
 * Features: Scroll-based navigation, clean sections, immediate feedback
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown, TrendingDown, Trophy, Star, Target, Smile, Flag, Brain, Dumbbell } from 'lucide-react';
import { PageTitle, SectionTitle, SubSectionTitle } from '../../ui/components/typography';
import { useAuth } from '../../contexts/AuthContext';
import { intakeAPI } from '../../services/api';
import { SwingIcon } from '../../components/icons';
import { TIERGolfFullLogo } from '../../components/branding/TIERGolfFullLogo';

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingData {
  userType?: 'player' | 'coach';
  school?: string;
  goals: string[];
  currentLevel: {
    handicap: number;
    frequency: 'daily' | '2-3x-week' | 'weekly' | 'monthly';
    yearsPlaying: number;
  };
  focusAreas: string[];
  preferences: {
    trainingFrequency: number;
  };
}

const defaultData: OnboardingData = {
  school: '',
  goals: [],
  currentLevel: {
    handicap: 15,
    frequency: '2-3x-week',
    yearsPlaying: 5,
  },
  focusAreas: [],
  preferences: {
    trainingFrequency: 3,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OnboardingPageV2() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      if (user?.playerId) {
        const goalsRecord: Record<string, unknown> = {
          selected: data.goals,
          updatedAt: new Date().toISOString(),
        };

        const payload = {
          playerId: user.playerId,
          goals: {
            ...goalsRecord,
            userType: data.userType,
          },
          background: {
            school: data.school,
            currentLevel: data.currentLevel,
            focusAreas: data.focusAreas,
          },
          availability: data.preferences,
        };

        await intakeAPI.submit(payload);

        setShowConfetti(true);
        createConfetti();

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createConfetti = () => {
    const colors = ['rgb(var(--tier-navy))', 'rgb(var(--tier-gold))', 'rgb(var(--status-success))', 'rgb(var(--status-info))'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -10px;
        border-radius: 50%;
        animation: fall 3s ease-out forwards;
        animation-delay: ${Math.random() * 2}s;
        z-index: 9999;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  };

  const canSubmit = () => {
    return (
      data.userType &&
      data.school &&
      data.school.trim().length > 0 &&
      data.goals.length > 0 &&
      data.currentLevel.handicap >= 0 &&
      data.focusAreas.length > 0
    );
  };

  // Options data
  const availableGoals = [
    { id: 'handicap', label: 'Lower handicap', icon: <TrendingDown size={20} /> },
    { id: 'tournaments', label: 'Win tournaments', icon: <Trophy size={20} /> },
    { id: 'professional', label: 'Go professional', icon: <Star size={20} /> },
    { id: 'consistency', label: 'Improve consistency', icon: <Target size={20} /> },
    { id: 'fun', label: 'Have fun!', icon: <Smile size={20} /> },
  ];

  const focusOptions = [
    { id: 'putting', label: 'Putting', icon: <SwingIcon size={20} /> },
    { id: 'driver', label: 'Driver', icon: <Target size={20} /> },
    { id: 'short-game', label: 'Short game', icon: <Flag size={20} /> },
    { id: 'irons', label: 'Iron play', icon: <SwingIcon size={20} /> },
    { id: 'mental', label: 'Mental training', icon: <Brain size={20} /> },
    { id: 'fitness', label: 'Physical training', icon: <Dumbbell size={20} /> },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: '2-3x-week', label: '2-3 times/week' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const toggleGoal = (goalId: string) => {
    const newGoals = data.goals.includes(goalId)
      ? data.goals.filter(g => g !== goalId)
      : [...data.goals, goalId];
    updateData({ goals: newGoals });
  };

  const toggleFocus = (focusId: string) => {
    const newFocus = data.focusAreas.includes(focusId)
      ? data.focusAreas.filter(f => f !== focusId)
      : [...data.focusAreas, focusId];
    updateData({ focusAreas: newFocus });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-tier-navy to-tier-navy/90">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">
          <TIERGolfFullLogo height={64} variant="light" />
        </div>
        <PageTitle style={{ marginBottom: 0 }} className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to<br />TIER Golf!
        </PageTitle>
        <p className="text-xl text-white/80 mb-8 max-w-md">
          Let's build your personalized training plan together
        </p>
        <button
          onClick={scrollToForm}
          className="px-8 py-4 bg-tier-gold text-tier-navy font-semibold rounded-xl text-lg hover:bg-tier-gold/90 transition-all shadow-lg"
        >
          Get started
        </button>
        <button
          onClick={scrollToForm}
          className="mt-12 text-white/60 hover:text-white transition-colors animate-bounce"
        >
          <ChevronDown size={32} />
        </button>
      </div>

      {/* Form Section */}
      <div ref={formRef} className="bg-tier-white min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Section 1: User Type */}
          <section className="mb-12">
            <SectionTitle style={{ marginBottom: 0 }} className="text-2xl font-bold text-tier-navy mb-2">
              1. Who are you?
            </SectionTitle>
            <p className="text-tier-text-secondary mb-6">Select your role</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateData({ userType: 'player' })}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  data.userType === 'player'
                    ? 'border-tier-navy bg-tier-navy/5'
                    : 'border-tier-border-default hover:border-tier-navy/50'
                }`}
              >
                <div className="text-3xl mb-3">[User]</div>
                <SubSectionTitle style={{ marginBottom: 0 }} className="font-semibold text-tier-navy mb-1">Player</SubSectionTitle>
                <p className="text-sm text-tier-text-secondary">
                  Get a personalized training plan and track progress
                </p>
              </button>

              <button
                onClick={() => updateData({ userType: 'coach' })}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  data.userType === 'coach'
                    ? 'border-tier-navy bg-tier-navy/5'
                    : 'border-tier-border-default hover:border-tier-navy/50'
                }`}
              >
                <div className="text-3xl mb-3">graduation-cap</div>
                <SubSectionTitle style={{ marginBottom: 0 }} className="font-semibold text-tier-navy mb-1">Coach</SubSectionTitle>
                <p className="text-sm text-tier-text-secondary">
                  Manage players and create training programs
                </p>
              </button>
            </div>
          </section>

          {/* Section 2: School */}
          <section className="mb-12">
            <SectionTitle style={{ marginBottom: 0 }} className="text-2xl font-bold text-tier-navy mb-2">
              2. Which school do you attend?
            </SectionTitle>
            <p className="text-tier-text-secondary mb-6">Enter the school name</p>

            <div>
              <input
                type="text"
                value={data.school || ''}
                onChange={(e) => updateData({ school: e.target.value })}
                placeholder="E.g. Oslo Golf Academy"
                className="w-full px-4 py-3 border border-tier-border-default rounded-xl text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-navy/20 focus:border-tier-navy"
              />
            </div>
          </section>

          {/* Section 3: Goals */}
          <section className="mb-12">
            <SectionTitle style={{ marginBottom: 0 }} className="text-2xl font-bold text-tier-navy mb-2">
              3. What are your goals?
            </SectionTitle>
            <p className="text-tier-text-secondary mb-6">Select one or more</p>

            <div className="flex flex-wrap gap-3">
              {availableGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`px-4 py-2.5 rounded-full border-2 font-medium transition-all ${
                    data.goals.includes(goal.id)
                      ? 'border-tier-navy bg-tier-navy text-white'
                      : 'border-tier-border-default text-tier-navy hover:border-tier-navy/50'
                  }`}
                >
                  {goal.icon} {goal.label}
                </button>
              ))}
            </div>
          </section>

          {/* Section 4: Current Level */}
          <section className="mb-12">
            <SectionTitle style={{ marginBottom: 0 }} className="text-2xl font-bold text-tier-navy mb-2">
              4. Your current level
            </SectionTitle>
            <p className="text-tier-text-secondary mb-6">Tell us about your experience</p>

            <div className="space-y-6">
              {/* Handicap */}
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-2">
                  Handicap
                </label>
                <input
                  type="number"
                  value={data.currentLevel.handicap}
                  onChange={(e) => updateData({
                    currentLevel: { ...data.currentLevel, handicap: parseFloat(e.target.value) || 0 }
                  })}
                  min="0"
                  max="54"
                  step="0.1"
                  className="w-full px-4 py-3 border border-tier-border-default rounded-xl text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-navy/20 focus:border-tier-navy"
                />
              </div>

              {/* Years Playing */}
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-2">
                  Years playing golf
                </label>
                <input
                  type="number"
                  value={data.currentLevel.yearsPlaying}
                  onChange={(e) => updateData({
                    currentLevel: { ...data.currentLevel, yearsPlaying: parseInt(e.target.value) || 0 }
                  })}
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 border border-tier-border-default rounded-xl text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-navy/20 focus:border-tier-navy"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-2">
                  How often do you play?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {frequencyOptions.map(freq => (
                    <button
                      key={freq.value}
                      onClick={() => updateData({
                        currentLevel: { ...data.currentLevel, frequency: freq.value as any }
                      })}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        data.currentLevel.frequency === freq.value
                          ? 'border-tier-navy bg-tier-navy text-white'
                          : 'border-tier-border-default text-tier-navy hover:border-tier-navy/50'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Focus Areas */}
          <section className="mb-12">
            <SectionTitle style={{ marginBottom: 0 }} className="text-2xl font-bold text-tier-navy mb-2">
              5. Focus areas
            </SectionTitle>
            <p className="text-tier-text-secondary mb-6">What do you want to work on most?</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {focusOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleFocus(option.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    data.focusAreas.includes(option.id)
                      ? 'border-tier-navy bg-tier-navy/5'
                      : 'border-tier-border-default hover:border-tier-navy/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <span className="font-medium text-tier-navy">{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Section 6: Training Frequency */}
          <section className="mb-12">
            <SectionTitle style={{ marginBottom: 0 }} className="text-2xl font-bold text-tier-navy mb-2">
              6. Training frequency
            </SectionTitle>
            <p className="text-tier-text-secondary mb-6">How many sessions per week?</p>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="7"
                value={data.preferences.trainingFrequency}
                onChange={(e) => updateData({
                  preferences: { ...data.preferences, trainingFrequency: parseInt(e.target.value) }
                })}
                className="flex-1 h-2 bg-tier-surface-base rounded-lg appearance-none cursor-pointer accent-ak-primary"
              />
              <div className="w-16 h-16 rounded-xl bg-tier-navy flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {data.preferences.trainingFrequency}
                </span>
              </div>
            </div>
            <p className="text-sm text-tier-text-tertiary mt-2">
              We recommend 3-5 sessions per week for best progress
            </p>
          </section>

          {/* Summary */}
          <section className="mb-8 p-6 bg-tier-navy/5 rounded-2xl border border-tier-navy/20">
            <SubSectionTitle style={{ marginBottom: 0 }} className="font-semibold text-tier-navy mb-4">
              Your plan will include:
            </SubSectionTitle>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-tier-navy">
                <CheckCircle size={18} className="text-tier-success" />
                <span>12-week personalized training plan</span>
              </div>
              <div className="flex items-center gap-2 text-tier-navy">
                <CheckCircle size={18} className="text-tier-success" />
                <span>{data.preferences.trainingFrequency}x weekly sessions</span>
              </div>
              <div className="flex items-center gap-2 text-tier-navy">
                <CheckCircle size={18} className="text-tier-success" />
                <span>
                  Focus on {data.focusAreas.length > 0
                    ? data.focusAreas.map(f => focusOptions.find(o => o.id === f)?.label).join(', ')
                    : 'your selected areas'}
                </span>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <button
            onClick={handleComplete}
            disabled={!canSubmit() || isSubmitting}
            className="w-full py-4 bg-tier-navy text-white font-semibold rounded-xl text-lg hover:bg-tier-navy/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Complete registration
              </>
            )}
          </button>

          {!canSubmit() && (
            <p className="text-center text-sm text-tier-text-tertiary mt-4">
              Fill in all fields to continue
            </p>
          )}
        </div>
      </div>

      {/* Completion celebration overlay */}
      {showConfetti && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl mb-4">[Celebration]</div>
            <SectionTitle style={{ marginBottom: 0 }} className="text-3xl font-bold text-white mb-2">Congratulations!</SectionTitle>
            <p className="text-white/80 mb-4">
              Your personalized training plan is ready!
            </p>
            <p className="text-white/60 text-sm">
              Redirecting you to the dashboard...
            </p>
          </div>
        </div>
      )}

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
