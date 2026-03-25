/**
 * TIERGolfBrukerprofilOnboarding Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useEffect } from 'react';
import {
  User, Calendar, MapPin, School, Target, Award, Activity,
  Phone, Mail, Users, Shield, ChevronRight, ChevronLeft,
  Check, AlertCircle, Info, Heart, Ruler, Scale, Clock,
  Trophy, Flag, Home, FileText, Lock
} from 'lucide-react';
import { playersAPI } from '../../services/api';
import Button from '../../ui/primitives/Button';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';

// ============================================================
// DESIGN SYSTEM CONSTANTS - CSS Variables
// ============================================================
const colors = {
  // Primary colors
  primary: 'var(--tier-navy)',
  primaryLight: 'var(--tier-navy-light)',
  snow: 'rgb(var(--gray-100))',
  surface: 'var(--surface-card)',
  white: 'var(--surface-card)',

  // Legacy aliases (kept for backwards compatibility)
  forest: 'var(--tier-navy)',
  forestLight: 'var(--tier-navy-light)',
  forestDark: 'var(--tier-navy)',
  foam: 'rgb(var(--gray-100))',
  ivory: 'var(--surface-card)',

  // Text colors
  textPrimary: 'var(--tier-navy)',
  textSecondary: 'var(--tier-navy)',
  textMuted: 'var(--text-secondary)',

  // Accent and semantic colors
  gold: 'rgb(var(--status-warning))',
  success: 'rgb(var(--status-success))',
  warning: 'rgb(var(--status-warning))',
  error: 'rgb(var(--status-error))',
  info: 'var(--tier-navy-light)',

  // Border colors
  borderLight: 'rgb(var(--border-color))',
  borderMedium: 'rgb(var(--border-color))'
};

const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

// ============================================================
// SCHOOL OPTIONS
// ============================================================
const schoolOptions = {
  'WANG Ung': ['Fredrikstad', 'Follo', 'Oslo', 'Romerike', 'Sandefjord'],
  'WANG Toppidrett': ['Fredrikstad', 'Oslo', 'Romerike', 'Tønsberg', 'Stavanger'],
  'NTG U': [],
  'NTG': ['Bærum', 'Bergen'],
  'Annen Toppidrettsskole': [],
  'Annen Idrettsungdomsskole': [],
  'Vanlig skole': [],
  'Annet': []
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const TIERGolfBrukerprofilOnboarding = ({ profile: apiProfile = null }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Default form data
  const defaultFormData = {
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    guardian1Name: '',
    guardian1Email: '',
    guardian1Phone: '',
    guardian1Relation: '',
    guardian2Name: '',
    guardian2Email: '',
    guardian2Phone: '',
    guardian2Relation: '',
    homeClub: '',
    memberSince: '',
    currentHandicap: '',
    lastSeasonAvgScore: '',
    yearsPlaying: '',
    yearsStructuredTraining: '',
    currentCoach: '',
    teamNorwayStatus: '',
    schoolType: '',
    schoolLocation: '',
    schoolYear: '',
    otherActivities: [],
    weeklyTrainingHours: '',
    distanceToTraining: '',
    height: '',
    weight: '',
    injuryHistory: '',
    currentInjuries: '',
    hasIndoorAccess: false,
    hasOutdoorAccess: false,
    hasTrackman: false,
    hasSimulator: false,
    clubSpeedDriver: '',
    shortTermGoal: '',
    mediumTermGoal: '',
    longTermGoal: '',
    plannedTournaments: '',
    consentBasic: false,
    consentAnalysis: false,
    consentSharing: false,
    guardianConsent: false,
    consentDate: '',
    consentSignature: ''
  };

  // Merge API profile data with defaults
  const getInitialFormData = () => {
    if (apiProfile) {
      return { ...defaultFormData, ...apiProfile };
    }
    return defaultFormData;
  };

  const [formData, setFormData] = useState(getInitialFormData);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // ============================================================
  // AUTO-SAVE FUNCTIONALITY
  // ============================================================

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('tier_golf_profile_draft');
    const savedStep = localStorage.getItem('tier_golf_profile_step');

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to load saved profile data:', e);
      }
    }

    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (formData && Object.keys(formData).some(key => formData[key] !== '')) {
      localStorage.setItem('tier_golf_profile_draft', JSON.stringify(formData));
    }
  }, [formData]);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('tier_golf_profile_step', currentStep.toString());
  }, [currentStep]);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^(\+47)?[0-9\s]{8,}$/.test(phone.replace(/\s/g, ''));

  const calculateAge = (birthDate) => {
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

  const needsGuardianConsent = () => {
    const age = calculateAge(formData.birthDate);
    return age !== null && age < 16;
  };

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'Fornavn er påkrevd';
        if (!formData.lastName.trim()) newErrors.lastName = 'Etternavn er påkrevd';
        if (!formData.birthDate) newErrors.birthDate = 'Fødselsdato er påkrevd';
        if (!formData.gender) newErrors.gender = 'Velg kjønn';
        break;
      case 2:
        if (!formData.email.trim()) newErrors.email = 'E-post er påkrevd';
        else if (!validateEmail(formData.email)) newErrors.email = 'Ugyldig e-postadresse';
        if (!formData.phone.trim()) newErrors.phone = 'Telefon er påkrevd';
        else if (!validatePhone(formData.phone)) newErrors.phone = 'Ugyldig telefonnummer';
        if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Nødkontakt navn er påkrevd';
        if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Nødkontakt telefon er påkrevd';
        if (!formData.emergencyContactRelation) newErrors.emergencyContactRelation = 'Velg relasjon';
        break;
      case 3:
        if (needsGuardianConsent()) {
          if (!formData.guardian1Name.trim()) newErrors.guardian1Name = 'Foresatt 1 navn er påkrevd';
          if (!formData.guardian1Email.trim()) newErrors.guardian1Email = 'Foresatt 1 e-post er påkrevd';
          else if (!validateEmail(formData.guardian1Email)) newErrors.guardian1Email = 'Ugyldig e-postadresse';
          if (!formData.guardian1Phone.trim()) newErrors.guardian1Phone = 'Foresatt 1 telefon er påkrevd';
        }
        break;
      case 4:
        if (!formData.homeClub.trim()) newErrors.homeClub = 'Hjemmeklubb er påkrevd';
        if (!formData.currentHandicap) newErrors.currentHandicap = 'Handicap er påkrevd';
        if (!formData.lastSeasonAvgScore) newErrors.lastSeasonAvgScore = 'Snittscore er påkrevd';
        break;
      case 5:
        if (!formData.schoolType) newErrors.schoolType = 'Velg skoletype';
        break;
      case 9:
        if (!formData.consentBasic) newErrors.consentBasic = 'Du må godkjenne grunnleggende bruk';
        if (needsGuardianConsent() && !formData.guardianConsent) {
          newErrors.guardianConsent = 'Foresattes samtykke er påkrevd for spillere under 16 år';
        }
        if (!formData.consentSignature.trim()) newErrors.consentSignature = 'Digital signatur er påkrevd';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(9)) return;

    setIsSubmitting(true);

    try {
      const outputData = generateOutputJSON();

      // Submit player profile data to backend API
      await playersAPI.updateProfile(outputData);

      // Clear auto-saved data after successful submission
      localStorage.removeItem('tier_golf_profile_draft');
      localStorage.removeItem('tier_golf_profile_step');

      setIsComplete(true);
    } catch (error) {
      console.error('Failed to submit profile:', error);
      setErrors({ submit: error.response?.data?.message || 'Kunne ikke lagre profilen. Prøv igjen.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActivity = (activity) => {
    const current = formData.otherActivities || [];
    if (current.includes(activity)) {
      handleChange('otherActivities', current.filter(a => a !== activity));
    } else {
      handleChange('otherActivities', [...current, activity]);
    }
  };

  // ============================================================
  // OUTPUT JSON GENERATOR
  // ============================================================
  const generateOutputJSON = () => {
    const age = calculateAge(formData.birthDate);
    
    return {
      meta: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        system: 'TIER Golf IUP System'
      },
      personalInfo: {
        fullName: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim(),
        firstName: formData.firstName,
        middleName: formData.middleName || null,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        age: age,
        gender: formData.gender
      },
      contactInfo: {
        email: formData.email,
        phone: formData.phone,
        address: formData.address || null,
        postalCode: formData.postalCode || null,
        city: formData.city || null
      },
      emergencyContact: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relation: formData.emergencyContactRelation
      },
      guardians: needsGuardianConsent() ? {
        guardian1: {
          name: formData.guardian1Name,
          email: formData.guardian1Email,
          phone: formData.guardian1Phone,
          relation: formData.guardian1Relation
        },
        guardian2: formData.guardian2Name ? {
          name: formData.guardian2Name,
          email: formData.guardian2Email,
          phone: formData.guardian2Phone,
          relation: formData.guardian2Relation
        } : null
      } : null,
      golfProfile: {
        homeClub: formData.homeClub,
        memberSince: formData.memberSince || null,
        currentHandicap: parseFloat(formData.currentHandicap),
        lastSeasonAvgScore: parseFloat(formData.lastSeasonAvgScore),
        yearsPlaying: parseInt(formData.yearsPlaying) || null,
        yearsStructuredTraining: parseInt(formData.yearsStructuredTraining) || null,
        currentCoach: formData.currentCoach || null,
        teamNorwayStatus: formData.teamNorwayStatus || 'none'
      },
      education: {
        schoolType: formData.schoolType,
        schoolLocation: formData.schoolLocation || null,
        schoolYear: formData.schoolYear || null
      },
      consent: {
        basicUsage: formData.consentBasic,
        anonymizedAnalysis: formData.consentAnalysis,
        sharingWithCoaches: formData.consentSharing,
        guardianConsent: needsGuardianConsent() ? formData.guardianConsent : null,
        signedAt: new Date().toISOString(),
        digitalSignature: formData.consentSignature
      }
    };
  };

  // ============================================================
  // STYLE HELPERS
  // ============================================================
  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: '14px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: `1px solid ${hasError ? colors.error : colors.borderLight}`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box'
  });

  const selectStyle = (hasValue, hasError) => ({
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: `1px solid ${hasError ? colors.error : colors.borderLight}`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    color: hasValue ? colors.textPrimary : colors.textMuted,
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box'
  });

  const textareaStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const errorStyle = {
    fontSize: '12px',
    color: colors.error,
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const hintStyle = {
    fontSize: '12px',
    color: colors.textMuted,
    marginTop: '4px'
  };

  // ============================================================
  // RENDER STEPS
  // ============================================================
  const renderStep = () => {
    switch(currentStep) {
      // ========== STEP 1: PERSONLIG INFO ==========
      case 1:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <User size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Personlig informasjon
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginLeft: '32px', margin: 0 }}>
                Grunnleggende informasjon om deg som spiller
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <User size={16} color={colors.forest} strokeWidth={1.5} />
                  Fornavn <span style={{ color: colors.error }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Ola"
                  style={inputStyle(errors.firstName)}
                />
                {errors.firstName && <p style={errorStyle}><AlertCircle size={12} /> {errors.firstName}</p>}
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Mellomnavn</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                  placeholder="(Valgfritt)"
                  style={inputStyle(false)}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>Etternavn <span style={{ color: colors.error }}>*</span></label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Nordmann"
                style={inputStyle(errors.lastName)}
              />
              {errors.lastName && <p style={errorStyle}><AlertCircle size={12} /> {errors.lastName}</p>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Calendar size={16} color={colors.forest} strokeWidth={1.5} />
                  Fødselsdato <span style={{ color: colors.error }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  style={inputStyle(errors.birthDate)}
                />
                {errors.birthDate && <p style={errorStyle}><AlertCircle size={12} /> {errors.birthDate}</p>}
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Kjønn <span style={{ color: colors.error }}>*</span></label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  style={selectStyle(formData.gender, errors.gender)}
                >
                  <option value="">Velg...</option>
                  <option value="male">Mann</option>
                  <option value="female">Kvinne</option>
                  <option value="other">Annet</option>
                </select>
                {errors.gender && <p style={errorStyle}><AlertCircle size={12} /> {errors.gender}</p>}
              </div>
            </div>
            
            {formData.birthDate && (
              <div style={{
                padding: spacing.md,
                backgroundColor: colors.ivory,
                borderRadius: '8px',
                marginTop: spacing.md
              }}>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                  <strong>Alder:</strong> {calculateAge(formData.birthDate)} år
                  {needsGuardianConsent() && (
                    <span style={{ color: colors.info, marginLeft: spacing.sm }}>
                      — Foresattes samtykke kreves
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        );

      // ========== STEP 2: KONTAKTINFO ==========
      case 2:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <Mail size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Kontaktinformasjon
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                Hvordan vi kan nå deg
              </p>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Mail size={16} color={colors.forest} strokeWidth={1.5} />
                E-post <span style={{ color: colors.error }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="ola@eksempel.no"
                style={inputStyle(errors.email)}
              />
              {errors.email && <p style={errorStyle}><AlertCircle size={12} /> {errors.email}</p>}
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Phone size={16} color={colors.forest} strokeWidth={1.5} />
                Telefon <span style={{ color: colors.error }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+47 123 45 678"
                style={inputStyle(errors.phone)}
              />
              {!errors.phone && <p style={hintStyle}>Norsk mobilnummer med landskode</p>}
              {errors.phone && <p style={errorStyle}><AlertCircle size={12} /> {errors.phone}</p>}
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Home size={16} color={colors.forest} strokeWidth={1.5} />
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Gateadresse 123"
                style={inputStyle(false)}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: spacing.md }}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Postnr.</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="0123"
                  style={inputStyle(false)}
                />
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <MapPin size={16} color={colors.forest} strokeWidth={1.5} />
                  Poststed
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Oslo"
                  style={inputStyle(false)}
                />
              </div>
            </div>

            <div style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTop: `1px solid rgb(var(--border-color))` }}>
              <SubSectionTitle style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md, display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <AlertCircle size={20} color={colors.forest} strokeWidth={1.5} />
                Nødkontakt
              </SubSectionTitle>

              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Users size={16} color={colors.forest} strokeWidth={1.5} />
                  Navn <span style={{ color: colors.error }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  placeholder="Navn på nødkontakt"
                  style={inputStyle(errors.emergencyContactName)}
                />
                {errors.emergencyContactName && <p style={errorStyle}><AlertCircle size={12} /> {errors.emergencyContactName}</p>}
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Phone size={16} color={colors.forest} strokeWidth={1.5} />
                  Telefon <span style={{ color: colors.error }}>*</span>
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                  placeholder="+47 123 45 678"
                  style={inputStyle(errors.emergencyContactPhone)}
                />
                {errors.emergencyContactPhone && <p style={errorStyle}><AlertCircle size={12} /> {errors.emergencyContactPhone}</p>}
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Heart size={16} color={colors.forest} strokeWidth={1.5} />
                  Relasjon <span style={{ color: colors.error }}>*</span>
                </label>
                <select
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                  style={inputStyle(errors.emergencyContactRelation)}
                >
                  <option value="">Velg relasjon</option>
                  <option value="Mor">Mor</option>
                  <option value="Far">Far</option>
                  <option value="Søsken">Søsken</option>
                  <option value="Ektefelle/Partner">Ektefelle/Partner</option>
                  <option value="Venn">Venn</option>
                  <option value="Annen">Annen</option>
                </select>
                {errors.emergencyContactRelation && <p style={errorStyle}><AlertCircle size={12} /> {errors.emergencyContactRelation}</p>}
              </div>
            </div>
          </div>
        );

      // ========== STEP 3: FORESATTE ==========
      case 3:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <Users size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Foresatte
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                {needsGuardianConsent() 
                  ? "Obligatorisk for spillere under 16 år" 
                  : "Valgfritt, men anbefalt for kommunikasjon"}
              </p>
            </div>
            
            {needsGuardianConsent() && (
              <div style={{
                padding: spacing.md,
                backgroundColor: `${colors.warning}15`,
                border: `1px solid ${colors.warning}`,
                borderRadius: '8px',
                marginBottom: spacing.lg,
                display: 'flex',
                alignItems: 'flex-start',
                gap: spacing.sm
              }}>
                <AlertCircle size={20} color={colors.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: colors.textPrimary }}>
                  Som spiller under 16 år må du ha minst én foresatt registrert.
                </p>
              </div>
            )}
            
            <div style={{
              padding: spacing.lg,
              backgroundColor: colors.foam,
              borderRadius: '12px',
              marginBottom: spacing.lg
            }}>
              <SubSectionTitle style={{ fontSize: '16px', fontWeight: '600', color: colors.forest, marginTop: 0, marginBottom: spacing.md }}>
                Foresatt 1 {needsGuardianConsent() && <span style={{ color: colors.error }}>*</span>}
              </SubSectionTitle>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Fullt navn {needsGuardianConsent() && <span style={{ color: colors.error }}>*</span>}</label>
                <input
                  type="text"
                  value={formData.guardian1Name}
                  onChange={(e) => handleChange('guardian1Name', e.target.value)}
                  placeholder="Navn Navnesen"
                  style={inputStyle(errors.guardian1Name)}
                />
                {errors.guardian1Name && <p style={errorStyle}><AlertCircle size={12} /> {errors.guardian1Name}</p>}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                <div style={{ marginBottom: spacing.md }}>
                  <label style={labelStyle}>E-post {needsGuardianConsent() && <span style={{ color: colors.error }}>*</span>}</label>
                  <input
                    type="email"
                    value={formData.guardian1Email}
                    onChange={(e) => handleChange('guardian1Email', e.target.value)}
                    placeholder="foresatt@eksempel.no"
                    style={inputStyle(errors.guardian1Email)}
                  />
                  {errors.guardian1Email && <p style={errorStyle}><AlertCircle size={12} /> {errors.guardian1Email}</p>}
                </div>
                
                <div style={{ marginBottom: spacing.md }}>
                  <label style={labelStyle}>Telefon {needsGuardianConsent() && <span style={{ color: colors.error }}>*</span>}</label>
                  <input
                    type="tel"
                    value={formData.guardian1Phone}
                    onChange={(e) => handleChange('guardian1Phone', e.target.value)}
                    placeholder="+47 123 45 678"
                    style={inputStyle(errors.guardian1Phone)}
                  />
                  {errors.guardian1Phone && <p style={errorStyle}><AlertCircle size={12} /> {errors.guardian1Phone}</p>}
                </div>
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Relasjon</label>
                <select
                  value={formData.guardian1Relation}
                  onChange={(e) => handleChange('guardian1Relation', e.target.value)}
                  style={selectStyle(formData.guardian1Relation, false)}
                >
                  <option value="">Velg relasjon</option>
                  <option value="Mor">Mor</option>
                  <option value="Far">Far</option>
                  <option value="Fosterforelder">Fosterforelder</option>
                  <option value="Fullmakt">Fullmakt</option>
                  <option value="Annen">Annen</option>
                </select>
              </div>
            </div>
            
            <div style={{
              padding: spacing.lg,
              backgroundColor: colors.white,
              border: `1px dashed ${colors.borderMedium}`,
              borderRadius: '12px'
            }}>
              <SubSectionTitle style={{ fontSize: '16px', fontWeight: '600', color: colors.textSecondary, marginTop: 0, marginBottom: spacing.md }}>
                Foresatt 2 (valgfritt)
              </SubSectionTitle>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Fullt navn</label>
                <input
                  type="text"
                  value={formData.guardian2Name}
                  onChange={(e) => handleChange('guardian2Name', e.target.value)}
                  placeholder="Navn Navnesen"
                  style={inputStyle(false)}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                <div style={{ marginBottom: spacing.md }}>
                  <label style={labelStyle}>E-post</label>
                  <input
                    type="email"
                    value={formData.guardian2Email}
                    onChange={(e) => handleChange('guardian2Email', e.target.value)}
                    placeholder="foresatt2@eksempel.no"
                    style={inputStyle(false)}
                  />
                </div>
                
                <div style={{ marginBottom: spacing.md }}>
                  <label style={labelStyle}>Telefon</label>
                  <input
                    type="tel"
                    value={formData.guardian2Phone}
                    onChange={(e) => handleChange('guardian2Phone', e.target.value)}
                    placeholder="+47 123 45 678"
                    style={inputStyle(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      // ========== STEP 4: GOLFPROFIL ==========
      case 4:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <Flag size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Golfprofil
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                Din golfhistorikk og nåværende nivå
              </p>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <MapPin size={16} color={colors.forest} strokeWidth={1.5} />
                Hjemmeklubb <span style={{ color: colors.error }}>*</span>
              </label>
              <input
                type="text"
                value={formData.homeClub}
                onChange={(e) => handleChange('homeClub', e.target.value)}
                placeholder="F.eks. Gamle Fredrikstad GK"
                style={inputStyle(errors.homeClub)}
              />
              {errors.homeClub && <p style={errorStyle}><AlertCircle size={12} /> {errors.homeClub}</p>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Medlem siden (år)</label>
                <input
                  type="number"
                  value={formData.memberSince}
                  onChange={(e) => handleChange('memberSince', e.target.value)}
                  placeholder="2018"
                  style={inputStyle(false)}
                />
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Target size={16} color={colors.forest} strokeWidth={1.5} />
                  Nåværende HCP <span style={{ color: colors.error }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.currentHandicap}
                  onChange={(e) => handleChange('currentHandicap', e.target.value)}
                  placeholder="F.eks. 5.4"
                  style={inputStyle(errors.currentHandicap)}
                />
                {!errors.currentHandicap && <p style={hintStyle}>Bruk minus for pluss-handicap</p>}
                {errors.currentHandicap && <p style={errorStyle}><AlertCircle size={12} /> {errors.currentHandicap}</p>}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Award size={16} color={colors.forest} strokeWidth={1.5} />
                  Fjorårets snittscore <span style={{ color: colors.error }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.lastSeasonAvgScore}
                  onChange={(e) => handleChange('lastSeasonAvgScore', e.target.value)}
                  placeholder="F.eks. 75.3"
                  style={inputStyle(errors.lastSeasonAvgScore)}
                />
                {!errors.lastSeasonAvgScore && <p style={hintStyle}>Snitt fra turneringer</p>}
                {errors.lastSeasonAvgScore && <p style={errorStyle}><AlertCircle size={12} /> {errors.lastSeasonAvgScore}</p>}
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>År med golf</label>
                <input
                  type="number"
                  value={formData.yearsPlaying}
                  onChange={(e) => handleChange('yearsPlaying', e.target.value)}
                  placeholder="F.eks. 6"
                  style={inputStyle(false)}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>År med strukturert trening</label>
                <input
                  type="number"
                  value={formData.yearsStructuredTraining}
                  onChange={(e) => handleChange('yearsStructuredTraining', e.target.value)}
                  placeholder="F.eks. 3"
                  style={inputStyle(false)}
                />
                <p style={hintStyle}>Med trener og plan</p>
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Nåværende trener</label>
                <input
                  type="text"
                  value={formData.currentCoach}
                  onChange={(e) => handleChange('currentCoach', e.target.value)}
                  placeholder="F.eks. Anders Kristoffersen"
                  style={inputStyle(false)}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Trophy size={16} color={colors.forest} strokeWidth={1.5} />
                Team Norway-status
              </label>
              <select
                value={formData.teamNorwayStatus}
                onChange={(e) => handleChange('teamNorwayStatus', e.target.value)}
                style={selectStyle(formData.teamNorwayStatus, false)}
              >
                <option value="">Velg status</option>
                <option value="none">Ikke tilknyttet</option>
                <option value="candidate">Kandidat</option>
                <option value="development">Utviklingsgruppe</option>
                <option value="junior">Junior landslag</option>
                <option value="senior">Senior landslag</option>
              </select>
            </div>
          </div>
        );

      // ========== STEP 5: SKOLE ==========
      case 5:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <School size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Skole og livssituasjon
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                For å tilpasse trening til din hverdag
              </p>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <School size={16} color={colors.forest} strokeWidth={1.5} />
                Skoletype <span style={{ color: colors.error }}>*</span>
              </label>
              <select
                value={formData.schoolType}
                onChange={(e) => {
                  handleChange('schoolType', e.target.value);
                  handleChange('schoolLocation', '');
                }}
                style={selectStyle(formData.schoolType, errors.schoolType)}
              >
                <option value="">Velg skole</option>
                {Object.keys(schoolOptions).map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
              {errors.schoolType && <p style={errorStyle}><AlertCircle size={12} /> {errors.schoolType}</p>}
            </div>
            
            {formData.schoolType && schoolOptions[formData.schoolType]?.length > 0 && (
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Skolested</label>
                <select
                  value={formData.schoolLocation}
                  onChange={(e) => handleChange('schoolLocation', e.target.value)}
                  style={selectStyle(formData.schoolLocation, false)}
                >
                  <option value="">Velg sted</option>
                  {schoolOptions[formData.schoolType].map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>Klassetrinn / År</label>
              <select
                value={formData.schoolYear}
                onChange={(e) => handleChange('schoolYear', e.target.value)}
                style={selectStyle(formData.schoolYear, false)}
              >
                <option value="">Velg klassetrinn</option>
                <option value="8">8. klasse</option>
                <option value="9">9. klasse</option>
                <option value="10">10. klasse</option>
                <option value="vg1">VG1</option>
                <option value="vg2">VG2</option>
                <option value="vg3">VG3</option>
                <option value="høyere">Høyere utdanning</option>
                <option value="fulltid">Fulltidsspiller</option>
                <option value="annet">Annet</option>
              </select>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Activity size={16} color={colors.forest} strokeWidth={1.5} />
                Andre idretter / aktiviteter
              </label>
              <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: spacing.sm }}>
                Velg alle som gjelder (anbefalt for spillere under 15)
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                {['Fotball', 'Håndball', 'Langrenn', 'Alpint', 'Svømming', 'Tennis', 'Styrketrening', 'Annet'].map(activity => (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => toggleActivity(activity)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      border: `1px solid ${formData.otherActivities?.includes(activity) ? colors.forest : colors.borderMedium}`,
                      borderRadius: '20px',
                      backgroundColor: formData.otherActivities?.includes(activity) ? colors.forest : colors.white,
                      color: formData.otherActivities?.includes(activity) ? colors.white : colors.textSecondary,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Clock size={16} color={colors.forest} strokeWidth={1.5} />
                  Ukentlig treningstid golf (timer)
                </label>
                <input
                  type="number"
                  value={formData.weeklyTrainingHours}
                  onChange={(e) => handleChange('weeklyTrainingHours', e.target.value)}
                  placeholder="F.eks. 15"
                  style={inputStyle(false)}
                />
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>Reisetid til trening (min)</label>
                <input
                  type="number"
                  value={formData.distanceToTraining}
                  onChange={(e) => handleChange('distanceToTraining', e.target.value)}
                  placeholder="F.eks. 20"
                  style={inputStyle(false)}
                />
              </div>
            </div>
          </div>
        );

      // ========== STEP 6: FYSISK PROFIL ==========
      case 6:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <Heart size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Fysisk profil
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                For fysisk tilpassing og belastningsstyring
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Ruler size={16} color={colors.forest} strokeWidth={1.5} />
                  Høyde (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  placeholder="175"
                  style={inputStyle(false)}
                />
              </div>
              
              <div style={{ marginBottom: spacing.md }}>
                <label style={labelStyle}>
                  <Scale size={16} color={colors.forest} strokeWidth={1.5} />
                  Vekt (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="70"
                  style={inputStyle(false)}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <AlertCircle size={16} color={colors.forest} strokeWidth={1.5} />
                Tidligere skader
              </label>
              <textarea
                value={formData.injuryHistory}
                onChange={(e) => handleChange('injuryHistory', e.target.value)}
                placeholder="Beskriv eventuelle tidligere skader som kan påvirke trening"
                rows={3}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Heart size={16} color={colors.error} strokeWidth={1.5} />
                Nåværende skader / begrensninger
              </label>
              <textarea
                value={formData.currentInjuries}
                onChange={(e) => handleChange('currentInjuries', e.target.value)}
                placeholder="Har du noen pågående skader eller begrensninger?"
                rows={2}
                style={textareaStyle}
              />
            </div>
            
            <div style={{
              padding: spacing.md,
              backgroundColor: `${colors.info}10`,
              border: `1px solid ${colors.info}30`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing.sm
            }}>
              <Info size={18} color={colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: colors.textSecondary, lineHeight: '1.5' }}>
                Helseinformasjon behandles med ekstra varsomhet og brukes kun for å 
                tilpasse treningsbelastning.
              </p>
            </div>
          </div>
        );

      // ========== STEP 7: UTSTYR ==========
      case 7:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <Target size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Utstyr og treningstilgang
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                For å planlegge riktig type økter
              </p>
            </div>
            
            <div style={{ marginBottom: spacing.lg }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: spacing.sm }}>
                Hvilke fasiliteter har du tilgang til?
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm }}>
                {[
                  { name: 'hasIndoorAccess', label: 'Innendørs treningsanlegg', desc: 'Simulator, innendørs range e.l.' },
                  { name: 'hasOutdoorAccess', label: 'Utendørs treningsanlegg', desc: 'Range, shortgame-område, bane' },
                  { name: 'hasTrackman', label: 'TrackMan / Flightscope', desc: 'Tilgang til launch monitor' },
                  { name: 'hasSimulator', label: 'Golfsimulator', desc: 'For vintertrening' }
                ].map(item => (
                  <div 
                    key={item.name}
                    onClick={() => handleChange(item.name, !formData[item.name])}
                    style={{ 
                      padding: spacing.md,
                      backgroundColor: formData[item.name] ? `${colors.forest}08` : colors.white,
                      border: `1px solid ${formData[item.name] ? colors.forest : colors.borderLight}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.sm }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${formData[item.name] ? colors.forest : colors.borderMedium}`,
                        backgroundColor: formData[item.name] ? colors.forest : colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        {formData[item.name] && <Check size={14} color={colors.white} strokeWidth={3} />}
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary }}>
                          {item.label}
                        </span>
                        <p style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px', marginBottom: 0 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Activity size={16} color={colors.forest} strokeWidth={1.5} />
                Klubbhastighet driver (mph)
              </label>
              <input
                type="number"
                value={formData.clubSpeedDriver}
                onChange={(e) => handleChange('clubSpeedDriver', e.target.value)}
                placeholder="F.eks. 105"
                style={inputStyle(false)}
              />
              <p style={hintStyle}>Om du kjenner denne fra TrackMan eller lignende</p>
            </div>
          </div>
        );

      // ========== STEP 8: MÅL ==========
      case 8:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <Trophy size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Mål og ambisjoner
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                Hva ønsker du å oppnå?
              </p>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Target size={16} color={colors.forest} strokeWidth={1.5} />
                Kortsiktig mål (2025/2026-sesongen)
              </label>
              <textarea
                value={formData.shortTermGoal}
                onChange={(e) => handleChange('shortTermGoal', e.target.value)}
                placeholder="F.eks. Senke snittscore til 74, vinne klubbmesterskapet"
                rows={2}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Flag size={16} color={colors.forest} strokeWidth={1.5} />
                Mellomlang sikt (2-3 år)
              </label>
              <textarea
                value={formData.mediumTermGoal}
                onChange={(e) => handleChange('mediumTermGoal', e.target.value)}
                placeholder="F.eks. Plass på Junior landslag, spille Nordic League"
                rows={2}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Award size={16} color={colors.gold} strokeWidth={1.5} />
                Langsiktig ambisjon (5+ år)
              </label>
              <textarea
                value={formData.longTermGoal}
                onChange={(e) => handleChange('longTermGoal', e.target.value)}
                placeholder="F.eks. Spille college-golf i USA, bli profesjonell"
                rows={2}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <Calendar size={16} color={colors.forest} strokeWidth={1.5} />
                Planlagte turneringer 2025/2026
              </label>
              <textarea
                value={formData.plannedTournaments}
                onChange={(e) => handleChange('plannedTournaments', e.target.value)}
                placeholder="List opp turneringer du planlegger å spille"
                rows={4}
                style={textareaStyle}
              />
            </div>
          </div>
        );

      // ========== STEP 9: SAMTYKKE ==========
      case 9:
        return (
          <div>
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <Shield size={24} color={colors.forest} strokeWidth={1.5} />
                <SectionTitle style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  Samtykke og personvern
                </SectionTitle>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                Les nøye og bekreft hva vi kan bruke dataene til
              </p>
            </div>
            
            <div style={{
              padding: spacing.lg,
              backgroundColor: colors.ivory,
              borderRadius: '12px',
              marginBottom: spacing.lg
            }}>
              <SubSectionTitle style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.forest,
                marginTop: 0,
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm
              }}>
                <Lock size={18} strokeWidth={1.5} />
                Om dine rettigheter (GDPR)
              </SubSectionTitle>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '20px', 
                fontSize: '13px', 
                color: colors.textSecondary,
                lineHeight: '1.8'
              }}>
                <li>Du kan når som helst be om innsyn i, retting av, eller sletting av dine data</li>
                <li>Du kan trekke samtykke når som helst uten å oppgi grunn</li>
                <li>Data lagres sikkert og deles kun med de du godkjenner</li>
              </ul>
            </div>
            
            {/* Consent checkboxes */}
            {[
              { name: 'consentBasic', label: 'Samtykke 1: Grunnleggende bruk', required: true, 
                desc: 'Jeg samtykker til at TIER Golf lagrer og behandler mine personopplysninger for å lage og følge opp min individuelle utviklingsplan.' },
              { name: 'consentAnalysis', label: 'Samtykke 2: Anonymisert analyse', required: false,
                desc: 'Jeg samtykker til at mine prestasjonsdata (uten navn) kan brukes til statistisk analyse.' },
              { name: 'consentSharing', label: 'Samtykke 3: Deling med trenere', required: false,
                desc: 'Jeg samtykker til at relevante deler av min utviklingsplan kan deles med mine trenere.' }
            ].map(item => (
              <div 
                key={item.name}
                onClick={() => handleChange(item.name, !formData[item.name])}
                style={{ 
                  marginBottom: spacing.md,
                  padding: spacing.md,
                  backgroundColor: formData[item.name] ? `${colors.forest}08` : colors.white,
                  border: `1px solid ${errors[item.name] ? colors.error : formData[item.name] ? colors.forest : colors.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.sm }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: `2px solid ${formData[item.name] ? colors.forest : colors.borderMedium}`,
                    backgroundColor: formData[item.name] ? colors.forest : colors.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {formData[item.name] && <Check size={14} color={colors.white} strokeWidth={3} />}
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary }}>
                      {item.label}
                      {item.required && <span style={{ color: colors.error }}> *</span>}
                    </span>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px', lineHeight: '1.5', marginBottom: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
                {errors[item.name] && (
                  <p style={{ fontSize: '12px', color: colors.error, marginTop: spacing.sm, marginLeft: '28px' }}>
                    {errors[item.name]}
                  </p>
                )}
              </div>
            ))}
            
            {needsGuardianConsent() && (
              <div style={{
                padding: spacing.lg,
                backgroundColor: `${colors.warning}10`,
                border: `1px solid ${colors.warning}`,
                borderRadius: '12px',
                marginTop: spacing.lg
              }}>
                <SubSectionTitle style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, marginTop: 0, marginBottom: spacing.md }}>
                  Foresattes samtykke (påkrevd under 16)
                </SubSectionTitle>
                
                <div 
                  onClick={() => handleChange('guardianConsent', !formData.guardianConsent)}
                  style={{ 
                    padding: spacing.md,
                    backgroundColor: formData.guardianConsent ? `${colors.forest}08` : colors.white,
                    border: `1px solid ${errors.guardianConsent ? colors.error : formData.guardianConsent ? colors.forest : colors.borderLight}`,
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.sm }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: `2px solid ${formData.guardianConsent ? colors.forest : colors.borderMedium}`,
                      backgroundColor: formData.guardianConsent ? colors.forest : colors.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {formData.guardianConsent && <Check size={14} color={colors.white} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '14px', color: colors.textPrimary }}>
                      Som foresatt bekrefter jeg at jeg godkjenner alle samtykker ovenfor.
                      <span style={{ color: colors.error }}> *</span>
                    </span>
                  </div>
                </div>
                {errors.guardianConsent && (
                  <p style={{ fontSize: '12px', color: colors.error, marginTop: spacing.sm }}>
                    {errors.guardianConsent}
                  </p>
                )}
              </div>
            )}
            
            <div style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
              <label style={labelStyle}>
                <FileText size={16} color={colors.forest} strokeWidth={1.5} />
                Digital signatur <span style={{ color: colors.error }}>*</span>
              </label>
              <input
                type="text"
                value={formData.consentSignature}
                onChange={(e) => handleChange('consentSignature', e.target.value)}
                placeholder={`Skriv fullt navn: ${formData.firstName} ${formData.lastName}`}
                style={inputStyle(errors.consentSignature)}
              />
              {!errors.consentSignature && <p style={hintStyle}>Ved å skrive navnet bekrefter du samtykket digitalt</p>}
              {errors.consentSignature && <p style={errorStyle}><AlertCircle size={12} /> {errors.consentSignature}</p>}
            </div>
            
            <div style={{
              padding: spacing.md,
              backgroundColor: colors.foam,
              borderRadius: '8px',
              fontSize: '12px',
              color: colors.textMuted
            }}>
              <strong>Dato:</strong> {new Date().toLocaleDateString('nb-NO', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  const steps = [
    { num: 1, title: 'Personlig' },
    { num: 2, title: 'Kontakt' },
    { num: 3, title: 'Foresatte' },
    { num: 4, title: 'Golf' },
    { num: 5, title: 'Skole' },
    { num: 6, title: 'Fysisk' },
    { num: 7, title: 'Utstyr' },
    { num: 8, title: 'Mål' },
    { num: 9, title: 'Samtykke' }
  ];

  if (isComplete) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.foam,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: spacing.lg
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: colors.white,
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          textAlign: 'center',
          padding: spacing.xxl
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: colors.success,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing.lg
          }}>
            <Check size={40} color={colors.white} strokeWidth={2.5} />
          </div>
          
          <SectionTitle style={{ fontSize: '24px', fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Registrering fullført!
          </SectionTitle>
          
          <p style={{ fontSize: '16px', color: colors.textSecondary, maxWidth: '400px', margin: '0 auto' }}>
            Din spillerprofil er nå opprettet. Du vil snart motta en e-post med bekreftelse.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.foam,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: spacing.lg
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: colors.white,
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.forest} 0%, ${colors.forestLight} 100%)`,
          padding: spacing.lg
        }}>
          <div style={{ textAlign: 'center', marginBottom: spacing.md }}>
            <PageTitle style={{ color: colors.white, fontSize: '20px', fontWeight: '600', margin: 0 }}>
              TIER GOLF
            </PageTitle>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0, marginTop: spacing.xs }}>
              Spillerregistrering
            </p>
          </div>
          
          {/* Progress Steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.md, position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '20px',
              right: '20px',
              height: '2px',
              backgroundColor: 'rgba(255,255,255,0.2)'
            }} />
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '20px',
              width: `${((currentStep - 1) / 8) * 100}%`,
              maxWidth: 'calc(100% - 40px)',
              height: '2px',
              backgroundColor: colors.gold,
              transition: 'width 0.3s ease'
            }} />
            
            {steps.map((step) => (
              <div key={step.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= step.num ? colors.gold : 'rgba(255,255,255,0.2)',
                  color: currentStep >= step.num ? colors.forest : 'rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                  {currentStep > step.num ? <Check size={14} strokeWidth={3} /> : step.num}
                </div>
                <span style={{ 
                  fontSize: '9px', 
                  color: currentStep >= step.num ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                  marginTop: '4px',
                  fontWeight: currentStep === step.num ? '600' : '400'
                }}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: spacing.lg }}>
          {renderStep()}
        </div>
        
        {/* Navigation */}
        <div style={{
          padding: spacing.lg,
          borderTop: `1px solid ${colors.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.foam
        }}>
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={currentStep === 1}
            leftIcon={<ChevronLeft size={18} />}
          >
            Tilbake
          </Button>

          <span style={{ fontSize: '13px', color: colors.textMuted, fontWeight: '500' }}>
            Steg {currentStep} av 9
          </span>

          {currentStep < 9 ? (
            <Button
              variant="primary"
              onClick={handleNext}
            >
              Neste
              <ChevronRight size={18} style={{ marginLeft: '4px' }} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
              leftIcon={!isSubmitting ? <Check size={18} /> : undefined}
              style={{ backgroundColor: colors.success }}
            >
              {isSubmitting ? 'Registrerer...' : 'Fullfør'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: spacing.lg, fontSize: '12px', color: colors.textMuted }}>
        TIER Golf × Team Norway Golf | IUP System v1.2
      </div>
    </div>
  );
};

export default TIERGolfBrukerprofilOnboarding;
