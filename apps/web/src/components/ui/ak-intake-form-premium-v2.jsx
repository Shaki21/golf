/**
 * TIER Golf - Premium Intake Form V2
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Trophy, Activity, AlertTriangle, Calendar, Clock, Target, Database, Settings, Upload, Plus, Minus, X } from 'lucide-react';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../typography';

// ============================================
// TIER GOLF - PREMIUM INTAKE FORM V2
// Design System v3.0 - Premium Light
// ============================================

// Brand Colors (Design System v3.0)
const colors = {
  primary: '#10456A',           // Forest - CTA
  primaryHover: '#2C5F7F',      // Primary Light for hover
  ink: '#1C1C1E',               // Text (Charcoal)
  background: '#F5F5F7',        // Main background (Cloud)
  warmNeutral: '#EDF0F2',       // Warm accent (Foam)
  success: '#4A7C59',           // Success status
  white: 'rgb(var(--tier-white))',
  snow: '#FAF9F7',              // Ivory
  border: '#C7C7CC',            // Mist
  borderLight: '#F5F5F7',       // Cloud
  textMuted: '#8E8E93',         // Steel
  error: '#C45B4E',
};

// ============================================
// AK LOGO COMPONENT
// ============================================
const AKLogo = ({ size = 40, color = colors.primary, className = '' }) => (
  <svg 
    viewBox="0 0 196.41 204.13" 
    width={size} 
    height={size * (204.13 / 196.41)}
    className={className}
    fill={color}
  >
    <path d="M170.3,185.77c-6.31-6.32-12.14-13.2-17.5-20.66l-34.14-46.91,2.13-1.92-20.32,17.03,32.11,45.71,9.32,13.77.72,2.16c-.19,1.72-1.53,2.72-4.02,3.01l-7.17.43v5.74h64.98v-5.74c-10.61-1.34-19.32-5.55-26.11-12.62ZM129.42,66.56v5.74l8.03.72,3.59.71c1.91.86,2.82,2.06,2.73,3.59.09,1.72-1.96,4.59-6.17,8.61l-8.18,8.46-31.7,28.98V0l-46.19,14.2v5.74l6.31-.14c8.51.38,13.1,3.87,13.77,10.47l.29,6.17v120.84l25.82-21.66,2.75-2.31,20.32-17.03,22.4-20.31,13.06-10.9c7.93-6.41,16.4-10.33,25.39-11.77l9.18-1v-5.74h-61.4ZM97.72,129.39v6.23l2.75-2.31-2.75-3.92ZM71.25,178.91l-37.82,25.03c1.44-.07,2.9-.21,4.36-.44,6.84-1.28,20.73-6.23,34.37-25.19l-.91.6ZM33.43,203.94c.15.01,1.74.05,4.36-.44-1.46.23-2.92.37-4.36.44ZM71.9,113.67l-15.52,5.97c-16.26,6.6-28.74,13.1-37.44,19.51-5.93,4.3-10.6,9.2-13.99,14.7C1.56,159.35-.09,165.54,0,172.42c.1,9.38,2.99,16.96,8.68,22.74,5.69,5.79,13.36,8.73,23.02,8.82.58,0,1.14-.02,1.72-.04h.01l37.82-25.03c-21.68,14.17-34.35,4.73-34.35,4.73-1.73-1.06-3.32-2.44-4.77-4.19-3.34-4.11-4.97-9.08-4.87-14.91-.39-13.68,9.94-24.92,30.98-33.71l13.66-5.65.26-.11v-11.5l-.26.1ZM46.07,70c-2.91.53-13.6,2.32-16.37,3.22-7.17,2.39-13.15,5.98-17.93,10.76-5.83,5.83-8.75,11.96-8.75,18.36-.19,3.92.84,7.44,3.09,10.54,2.24,3.11,5.61,4.57,10.11,4.38,8.89,0,13.36-6.09,13.56-15.94l-.36-5.92c-.44-5.91-2.7-15.76,16.65-25.4Z"/>
  </svg>
);

// Logo with background container
const AKLogoContainer = ({ size = 48, bgColor = colors.primary, logoColor = colors.white, rounded = 'xl' }) => (
  <div 
    className={`flex items-center justify-center rounded-${rounded}`}
    style={{ 
      backgroundColor: bgColor, 
      width: size, 
      height: size,
      padding: size * 0.15,
    }}
  >
    <AKLogo size={size * 0.7} color={logoColor} />
  </div>
);

// Player Ranking System
const playerRankingSystem = [
  { kategori: 'A', name: 'OWGR / Rolex WORLD (Topp 150)', avgScore: null },
  { kategori: 'B', name: 'OWGR / Rolex WORLD (Topp 400)', avgScore: null },
  { kategori: 'C', name: 'OWGR / Rolex (Topp 700)', avgScore: null },
  { kategori: 'D', name: 'Amatør WORLD (Topp 100)', avgScore: null },
  { kategori: 'F', name: 'Junior WORLD (Topp 300)', avgScore: '< 72' },
  { kategori: 'G', name: 'Junior EUROPE (Topp 700)', avgScore: '72-74' },
  { kategori: 'H', name: 'Junior NATIONAL (Topp 2000)', avgScore: '74-76' },
  { kategori: 'I', name: 'Junior Region', avgScore: '76-80' },
  { kategori: 'J', name: 'Junior Klubb', avgScore: '80-85' },
  { kategori: 'K', name: 'Junior Klubb', avgScore: '85-90' },
  { kategori: 'L', name: 'Junior Klubb', avgScore: '> 90' },
];

// Form Sections
const sections = [
  { id: 'welcome', title: 'Velkommen', subtitle: 'La oss starte din reise' },
  { id: 'personal', title: 'Om deg', subtitle: 'Personlig informasjon' },
  { id: 'golf', title: 'Golf bakgrunn', subtitle: 'Din erfaring og nivå' },
  { id: 'sports', title: 'Idrettsbakgrunn', subtitle: 'Andre idretter og skader' },
  { id: 'season', title: 'Sesong 2025', subtitle: 'Tilbakeblikk på sesongen' },
  { id: 'training', title: 'Treningshistorikk', subtitle: 'Dine treningstimer' },
  { id: 'assessment', title: 'Selvvurdering', subtitle: 'Vurder dine ferdigheter' },
  { id: 'goals', title: 'Målsetninger', subtitle: 'Dine mål for 2026' },
  { id: 'availability', title: 'Tilgjengelighet', subtitle: 'Tid og ressurser' },
  { id: 'plan', title: 'Din plan', subtitle: 'Velg varighet og fokus' },
  { id: 'complete', title: 'Fullført', subtitle: 'Din plan er klar' },
];

// Pyramiden levels
const pyramidenLevels = [
  { id: 'fysisk', name: 'Fysisk', order: 1 },
  { id: 'teknikk', name: 'Teknikk', order: 2 },
  { id: 'golfslag', name: 'Golfslag', order: 3 },
  { id: 'spill', name: 'Spill', order: 4 },
  { id: 'turnering', name: 'Turnering', order: 5 },
];

// 17 Områder
const omrader = [
  { id: 'tee_total', name: 'Tee Total', category: 'Langspill' },
  { id: 'innspill_200_plus', name: 'Innspill 200+ m', category: 'Langspill' },
  { id: 'innspill_150_200', name: 'Innspill 150-200 m', category: 'Langspill' },
  { id: 'innspill_100_150', name: 'Innspill 100-150 m', category: 'Mellomspill' },
  { id: 'innspill_50_100', name: 'Innspill 50-100 m', category: 'Mellomspill' },
  { id: 'wedge', name: 'Wedge', category: 'Kortspill' },
  { id: 'chip', name: 'Chip', category: 'Kortspill' },
  { id: 'bunker', name: 'Bunker', category: 'Kortspill' },
  { id: 'pitch', name: 'Pitch', category: 'Kortspill' },
  { id: 'lob', name: 'Lob', category: 'Kortspill' },
  { id: 'putting_0_3', name: 'Putting 0-3 ft', category: 'Putting' },
  { id: 'putting_3_5', name: 'Putting 3-5 ft', category: 'Putting' },
  { id: 'putting_5_10', name: 'Putting 5-10 ft', category: 'Putting' },
  { id: 'putting_10_15', name: 'Putting 10-15 ft', category: 'Putting' },
  { id: 'putting_15_25', name: 'Putting 15-25 ft', category: 'Putting' },
  { id: 'putting_25_40', name: 'Putting 25-40 ft', category: 'Putting' },
  { id: 'putting_40_plus', name: 'Putting 40+ ft', category: 'Putting' },
];

// ============================================
// STYLED COMPONENTS
// ============================================

const InputField = ({ label, type = 'text', required, placeholder, value, onChange, options, note }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium mb-2" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
      {label}
      {required && <span style={{ color: colors.primary }}> *</span>}
    </label>
    {type === 'select' ? (
      <select
        className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 appearance-none bg-no-repeat"
        style={{ 
          borderColor: colors.border,
          backgroundColor: colors.white,
          color: value ? colors.ink : colors.textMuted,
          fontFamily: 'DM Sans, sans-serif',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px',
        }}
        value={value}
        onChange={onChange}
      >
        <option value="">Velg...</option>
        {options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
        style={{ 
          borderColor: colors.border,
          backgroundColor: colors.white,
          color: colors.ink,
          fontFamily: 'DM Sans, sans-serif',
        }}
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    ) : (
      <input
        type={type}
        className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
        style={{ 
          borderColor: colors.border,
          backgroundColor: colors.white,
          color: colors.ink,
          fontFamily: 'DM Sans, sans-serif',
        }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )}
    {note && (
      <p className="mt-2 text-xs" style={{ color: colors.textMuted, fontFamily: 'DM Sans, sans-serif' }}>
        {note}
      </p>
    )}
  </div>
);

const RatingSlider = ({ label, value = 5, onChange }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-3">
      <label className="text-sm font-medium" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
        {label}
      </label>
      <span 
        className="text-lg font-semibold w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ backgroundColor: colors.primary, color: colors.white }}
      >
        {value}
      </span>
    </div>
    <input
      type="range"
      min="1"
      max="10"
      value={value}
      onChange={onChange}
      className="w-full h-2 rounded-full appearance-none cursor-pointer"
      style={{ 
        background: `linear-gradient(to right, ${colors.primary} ${(value - 1) * 11.11}%, ${colors.borderLight} ${(value - 1) * 11.11}%)`,
      }}
    />
    <div className="flex justify-between text-xs mt-2" style={{ color: colors.textMuted }}>
      <span>Svak</span>
      <span>Sterk</span>
    </div>
  </div>
);

const OptionCard = ({ selected, onClick, children, description }) => (
  <button
    onClick={onClick}
    className="w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-sm"
    style={{ 
      borderColor: selected ? colors.primary : colors.borderLight,
      backgroundColor: selected ? `${colors.primary}08` : colors.white,
    }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          {children}
        </p>
        {description && (
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
            {description}
          </p>
        )}
      </div>
      <div 
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ml-4 flex-shrink-0"
        style={{ 
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : 'transparent',
        }}
      >
        {selected && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
    </div>
  </button>
);

const MultiSelectChip = ({ selected, onClick, children }) => (
  <button
    onClick={onClick}
    className="px-5 py-2.5 rounded-full border-2 transition-all duration-200 font-medium text-sm"
    style={{ 
      borderColor: selected ? colors.primary : colors.border,
      backgroundColor: selected ? colors.primary : colors.white,
      color: selected ? colors.white : colors.ink,
      fontFamily: 'DM Sans, sans-serif',
    }}
  >
    {children}
  </button>
);

// ============================================
// SECTION COMPONENTS
// ============================================

const WelcomeSection = ({ onNext }) => (
  <div className="text-center py-16">
    {/* Logo */}
    <div className="mb-10">
      <AKLogo size={80} color={colors.primary} className="mx-auto" />
    </div>
    
    <PageTitle
      className="text-4xl md:text-5xl mb-4 tracking-tight"
      style={{ color: colors.ink, fontFamily: 'Shippori Mincho, serif', fontWeight: 400 }}
    >
      Velkommen
    </PageTitle>
    
    <p 
      className="text-lg mb-3 max-w-md mx-auto"
      style={{ color: colors.textMuted, fontFamily: 'DM Sans, sans-serif' }}
    >
      Din personlige utviklingsplan starter her
    </p>
    
    <p 
      className="text-sm mb-12 max-w-sm mx-auto leading-relaxed"
      style={{ color: colors.textMuted, fontFamily: 'DM Sans, sans-serif' }}
    >
      Vi trenger litt informasjon for å lage en skreddersydd plan for deg. Dette tar ca. 10-15 minutter.
    </p>

    <div className="flex flex-col gap-4 max-w-xs mx-auto">
      <button
        onClick={onNext}
        className="w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
        style={{ 
          backgroundColor: colors.primary,
          color: colors.white,
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        Start registrering
        <ChevronRight className="w-5 h-5" />
      </button>
      
      <p className="text-sm" style={{ color: colors.textMuted }}>
        Allerede bruker? <a href="#" className="font-medium hover:underline" style={{ color: colors.primary }}>Logg inn her</a>
      </p>
    </div>

    {/* Trust indicators */}
    <div className="mt-16 pt-8 border-t" style={{ borderColor: colors.borderLight }}>
      <p className="text-xs mb-4" style={{ color: colors.textMuted }}>Brukt av spillere fra</p>
      <div className="flex items-center justify-center gap-8 opacity-50">
        <span className="text-sm font-medium" style={{ color: colors.ink }}>Team Norway</span>
        <span className="text-sm font-medium" style={{ color: colors.ink }}>Wang Toppidrett</span>
        <span className="text-sm font-medium" style={{ color: colors.ink }}>NGF</span>
      </div>
    </div>
  </div>
);

const PersonalSection = ({ data, setData }) => {
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-x-6">
        <InputField 
          label="Fullt navn" 
          required 
          placeholder="Ola Nordmann"
          value={data.fullName || ''}
          onChange={(e) => updateField('fullName', e.target.value)}
        />
        <InputField 
          label="Fødselsdato" 
          type="date" 
          required
          value={data.birthDate || ''}
          onChange={(e) => updateField('birthDate', e.target.value)}
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-x-6">
        <InputField 
          label="E-post" 
          type="email" 
          required
          placeholder="din@epost.no"
          value={data.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
        />
        <InputField 
          label="Telefon" 
          type="tel" 
          required
          placeholder="+47 000 00 000"
          value={data.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
        />
      </div>

      <InputField 
        label="Hjemmeklubb" 
        placeholder="F.eks. Fredrikstad Golfklubb"
        value={data.homeClub || ''}
        onChange={(e) => updateField('homeClub', e.target.value)}
      />

      <InputField 
        label="Skole / VGS" 
        type="select"
        options={['Wang Toppidrett', 'Annen VGS med golf', 'Annen VGS', 'Ikke VGS-elev', 'Ferdig VGS']}
        value={data.school || ''}
        onChange={(e) => updateField('school', e.target.value)}
      />

      <div className="mb-6">
        <label className="block text-sm font-medium mb-3" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Spillertype <span style={{ color: colors.primary }}>*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <OptionCard 
            selected={data.handedness === 'right'} 
            onClick={() => updateField('handedness', 'right')}
          >
            Høyrehendt
          </OptionCard>
          <OptionCard 
            selected={data.handedness === 'left'} 
            onClick={() => updateField('handedness', 'left')}
          >
            Venstrehendt
          </OptionCard>
        </div>
      </div>

      {/* Profile photo upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Profilbilde <span style={{ color: colors.textMuted, fontWeight: 400 }}>(valgfritt)</span>
        </label>
        <div 
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all hover:border-opacity-70 hover:bg-gray-50"
          style={{ borderColor: colors.border }}
        >
          <div 
            className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: colors.warmNeutral }}
          >
            <Upload className="w-6 h-6" style={{ color: colors.textMuted }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: colors.ink }}>
            Klikk for å laste opp
          </p>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            eller dra og slipp her
          </p>
        </div>
      </div>
    </div>
  );
};

const GolfBackgroundSection = ({ data, setData }) => {
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-x-6">
        <InputField 
          label="Nåværende HCP" 
          type="number" 
          required
          placeholder="F.eks. 4.2"
          note="Offisielt handicap"
          value={data.currentHcp || ''}
          onChange={(e) => updateField('currentHcp', e.target.value)}
        />
        <InputField 
          label="Laveste HCP noensinne" 
          type="number"
          placeholder="F.eks. 2.8"
          value={data.lowestHcp || ''}
          onChange={(e) => updateField('lowestHcp', e.target.value)}
        />
      </div>

      <InputField 
        label="År spilt golf" 
        type="number" 
        required
        placeholder="F.eks. 8"
        value={data.yearsPlaying || ''}
        onChange={(e) => updateField('yearsPlaying', e.target.value)}
      />

      {/* Player Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Spillernivå (Kategori) <span style={{ color: colors.primary }}>*</span>
        </label>
        <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
          Velg din nåværende kategori basert på turneringsnivå og gjennomsnittsscore
        </p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2 -mr-2">
          {playerRankingSystem.map(rank => (
            <OptionCard
              key={rank.kategori}
              selected={data.playerCategory === rank.kategori}
              onClick={() => updateField('playerCategory', rank.kategori)}
              description={rank.avgScore ? `Gjennomsnitt: ${rank.avgScore}` : null}
            >
              <span className="font-bold mr-2" style={{ color: colors.primary }}>{rank.kategori}</span>
              {rank.name}
            </OptionCard>
          ))}
        </div>
      </div>

      {/* Responsible Environment */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Ansvarlig miljø <span style={{ color: colors.primary }}>*</span>
        </label>
        <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
          Hvem har ansvar for din utvikling? Velg alle som passer.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Egen', 'TN Junior', 'TN Senior', 'VGS', 'Ung', 'Klubb'].map(env => (
            <MultiSelectChip
              key={env}
              selected={data.responsibleEnv?.includes(env)}
              onClick={() => {
                const current = data.responsibleEnv || [];
                const updated = current.includes(env) 
                  ? current.filter(e => e !== env)
                  : [...current, env];
                updateField('responsibleEnv', updated);
              }}
            >
              {env}
            </MultiSelectChip>
          ))}
        </div>
      </div>

      <InputField 
        label="Treningsbakgrunn" 
        type="select"
        required
        options={['Selvtrent', 'Sporadisk treneroppfølging', 'Fast trener < 1 år', 'Fast trener 1-3 år', 'Fast trener 3+ år']}
        value={data.trainingBackground || ''}
        onChange={(e) => updateField('trainingBackground', e.target.value)}
      />
    </div>
  );
};

const SportsInjurySection = ({ data, setData }) => {
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const [sports, setSports] = useState(data.otherSports || []);
  const [injuries, setInjuries] = useState(data.injuries || []);

  const addSport = () => setSports([...sports, { name: '', level: '', years: '' }]);
  const removeSport = (idx) => setSports(sports.filter((_, i) => i !== idx));
  
  const addInjury = () => setInjuries([...injuries, { type: '', when: '', duration: '' }]);
  const removeInjury = (idx) => setInjuries(injuries.filter((_, i) => i !== idx));

  return (
    <div>
      {/* Other Sports */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SubSectionTitle className="font-medium text-base" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
              Andre idretter
            </SubSectionTitle>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
              Tidligere eller nåværende idrettserfaring
            </p>
          </div>
          <button
            onClick={addSport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:bg-gray-50"
            style={{ borderColor: colors.primary, color: colors.primary }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Legg til</span>
          </button>
        </div>

        {sports.length === 0 ? (
          <div 
            className="p-8 rounded-xl text-center"
            style={{ backgroundColor: colors.warmNeutral }}
          >
            <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Ingen andre idretter lagt til
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sports.map((sport, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-xl border relative"
                style={{ borderColor: colors.borderLight, backgroundColor: colors.snow }}
              >
                <button
                  onClick={() => removeSport(idx)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                </button>
                <div className="grid md:grid-cols-3 gap-4 pr-8">
                  <InputField 
                    label="Idrett" 
                    placeholder="F.eks. Fotball"
                    value={sport.name}
                    onChange={(e) => {
                      const updated = [...sports];
                      updated[idx].name = e.target.value;
                      setSports(updated);
                    }}
                  />
                  <InputField 
                    label="Nivå" 
                    type="select"
                    options={['Bredde/hobby', 'Klubbnivå', 'Kretsnivå', 'Nasjonalt', 'Internasjonalt']}
                    value={sport.level}
                    onChange={(e) => {
                      const updated = [...sports];
                      updated[idx].level = e.target.value;
                      setSports(updated);
                    }}
                  />
                  <InputField 
                    label="Antall år" 
                    type="number"
                    placeholder="F.eks. 5"
                    value={sport.years}
                    onChange={(e) => {
                      const updated = [...sports];
                      updated[idx].years = e.target.value;
                      setSports(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Injury History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <SubSectionTitle className="font-medium text-base" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
              Skadehistorikk
            </SubSectionTitle>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
              Skader som kan påvirke trening
            </p>
          </div>
          <button
            onClick={addInjury}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:bg-gray-50"
            style={{ borderColor: colors.primary, color: colors.primary }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Legg til</span>
          </button>
        </div>

        {injuries.length === 0 ? (
          <div 
            className="p-8 rounded-xl text-center"
            style={{ backgroundColor: colors.warmNeutral }}
          >
            <Check className="w-8 h-8 mx-auto mb-2" style={{ color: colors.success }} />
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Ingen skader registrert
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {injuries.map((injury, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-xl border relative"
                style={{ borderColor: colors.borderLight, backgroundColor: colors.snow }}
              >
                <button
                  onClick={() => removeInjury(idx)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                </button>
                <div className="grid md:grid-cols-3 gap-4 pr-8">
                  <InputField 
                    label="Type skade" 
                    type="select"
                    options={['Rygg', 'Skulder', 'Albue', 'Håndledd', 'Hofte', 'Kne', 'Ankel', 'Annet']}
                    value={injury.type}
                    onChange={(e) => {
                      const updated = [...injuries];
                      updated[idx].type = e.target.value;
                      setInjuries(updated);
                    }}
                  />
                  <InputField 
                    label="Når?" 
                    type="date"
                    value={injury.when}
                    onChange={(e) => {
                      const updated = [...injuries];
                      updated[idx].when = e.target.value;
                      setInjuries(updated);
                    }}
                  />
                  <InputField 
                    label="Varighet" 
                    placeholder="F.eks. 3 måneder"
                    value={injury.duration}
                    onChange={(e) => {
                      const updated = [...injuries];
                      updated[idx].duration = e.target.value;
                      setInjuries(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SeasonReviewSection = ({ data, setData }) => {
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const hasSeason = data.hasSeasonData === true;

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Har du sesongdata fra 2025? <span style={{ color: colors.primary }}>*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <OptionCard 
            selected={data.hasSeasonData === true} 
            onClick={() => updateField('hasSeasonData', true)}
          >
            Ja, jeg har data
          </OptionCard>
          <OptionCard 
            selected={data.hasSeasonData === false} 
            onClick={() => updateField('hasSeasonData', false)}
          >
            Nei, hopp over
          </OptionCard>
        </div>
      </div>

      {hasSeason && (
        <>
          <div className="grid md:grid-cols-2 gap-x-6">
            <InputField 
              label="Turneringer spilt" 
              type="number"
              placeholder="F.eks. 12"
              value={data.tournamentsPlayed || ''}
              onChange={(e) => updateField('tournamentsPlayed', e.target.value)}
            />
            <InputField 
              label="Beste turneringsresultat" 
              placeholder="F.eks. 3. plass NM U18"
              value={data.bestResult || ''}
              onChange={(e) => updateField('bestResult', e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-x-6">
            <InputField 
              label="Gjennomsnittsscore (18 hull)" 
              type="number"
              placeholder="F.eks. 74"
              value={data.avgScore || ''}
              onChange={(e) => updateField('avgScore', e.target.value)}
            />
            <InputField 
              label="Beste runde" 
              type="number"
              placeholder="F.eks. 68"
              value={data.bestRound || ''}
              onChange={(e) => updateField('bestRound', e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-x-6">
            <InputField 
              label="HCP ved sesongstart" 
              type="number"
              placeholder="F.eks. 5.2"
              value={data.hcpStart || ''}
              onChange={(e) => updateField('hcpStart', e.target.value)}
            />
            <InputField 
              label="HCP ved sesongslutt" 
              type="number"
              placeholder="F.eks. 3.8"
              value={data.hcpEnd || ''}
              onChange={(e) => updateField('hcpEnd', e.target.value)}
            />
          </div>

          <InputField 
            label="Største høydepunkt" 
            type="textarea"
            placeholder="Hva er du mest stolt av i 2025?"
            value={data.highlight || ''}
            onChange={(e) => updateField('highlight', e.target.value)}
          />

          <InputField 
            label="Største utfordringer" 
            type="textarea"
            placeholder="Hva stoppet deg fra å nå målene?"
            value={data.challenges || ''}
            onChange={(e) => updateField('challenges', e.target.value)}
          />
        </>
      )}
    </div>
  );
};

const TrainingHistorySection = ({ data, setData }) => {
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const [showDetailed, setShowDetailed] = useState(false);

  return (
    <div>
      <InputField 
        label="Totalt treningstimer 2025" 
        type="number"
        required
        placeholder="F.eks. 500"
        note="Estimat er OK"
        value={data.totalHours || ''}
        onChange={(e) => updateField('totalHours', e.target.value)}
      />

      {/* Pyramiden breakdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-4" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Timer per Pyramiden-nivå
        </label>
        <div className="space-y-3">
          {pyramidenLevels.map(level => (
            <div key={level.id} className="flex items-center gap-4">
              <span 
                className="w-24 text-sm font-medium"
                style={{ color: colors.ink }}
              >
                {level.name}
              </span>
              <input
                type="number"
                className="flex-1 px-4 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.white,
                  color: colors.ink,
                  fontFamily: 'DM Sans, sans-serif',
                }}
                placeholder="Timer"
                value={data.pyramidHours?.[level.id] || ''}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  pyramidHours: { ...prev.pyramidHours, [level.id]: e.target.value }
                }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Detailed breakdown toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowDetailed(!showDetailed)}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: colors.primary }}
        >
          {showDetailed ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showDetailed ? 'Skjul detaljert fordeling' : 'Vis detaljert fordeling (17 områder)'}
        </button>
      </div>

      {showDetailed && (
        <div 
          className="p-5 rounded-xl mb-6"
          style={{ backgroundColor: colors.snow, border: `1px solid ${colors.borderLight}` }}
        >
          <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
            Valgfritt - fyll inn hvis du har detaljert oversikt
          </p>
          {['Langspill', 'Mellomspill', 'Kortspill', 'Putting'].map(category => (
            <div key={category} className="mb-4">
              <CardTitle className="text-sm font-medium mb-2" style={{ color: colors.ink }}>{category}</CardTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {omrader.filter(o => o.category === category).map(area => (
                  <div key={area.id}>
                    <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>{area.name}</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: colors.border, backgroundColor: colors.white }}
                      placeholder="Timer"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <InputField 
        label="Hovedtreningslokasjon" 
        type="select"
        required
        options={['Mulligan Indoor Golf', 'Edge Golf', 'GFGK', 'Fornebu Indoor Golf', 'Hjemmeklubb', 'Wang Toppidrett', 'Annet']}
        value={data.primaryLocation || ''}
        onChange={(e) => updateField('primaryLocation', e.target.value)}
      />
    </div>
  );
};

const AssessmentSection = ({ data, setData }) => {
  const updateRating = (field, value) => setData(prev => ({ 
    ...prev, 
    ratings: { ...prev.ratings, [field]: parseInt(value) } 
  }));

  const ratings = data.ratings || {};

  const skillGroups = [
    { title: 'Langspill', skills: [
      { id: 'teeTotal', label: 'Tee Total' },
      { id: 'innspill200', label: 'Innspill 200+ m' },
      { id: 'innspill150', label: 'Innspill 150-200 m' },
    ]},
    { title: 'Mellomspill', skills: [
      { id: 'innspill100', label: 'Innspill 100-150 m' },
      { id: 'innspill50', label: 'Innspill 50-100 m' },
    ]},
    { title: 'Kortspill', skills: [
      { id: 'wedge', label: 'Wedge' },
      { id: 'chip', label: 'Chip' },
      { id: 'pitch', label: 'Pitch' },
      { id: 'bunker', label: 'Bunker' },
    ]},
    { title: 'Putting', skills: [
      { id: 'puttingShort', label: 'Putting 0-5 ft' },
      { id: 'puttingMid', label: 'Putting 5-15 ft' },
      { id: 'puttingLong', label: 'Putting 15+ ft' },
    ]},
    { title: 'Øvrige områder', skills: [
      { id: 'courseManagement', label: 'Banespill & strategi' },
      { id: 'mental', label: 'Mental styrke' },
      { id: 'physical', label: 'Fysisk form' },
    ]},
  ];

  return (
    <div>
      <p className="text-sm mb-8" style={{ color: colors.textMuted }}>
        Vurder dine ferdigheter på en skala fra 1-10. Vær ærlig – dette hjelper oss å lage en bedre plan for deg.
      </p>

      {skillGroups.map((group, idx) => (
        <div key={group.title} className="mb-8">
          <SubSectionTitle
            className="text-lg mb-5 pb-3 border-b"
            style={{ color: colors.ink, borderColor: colors.borderLight, fontFamily: 'Shippori Mincho, serif' }}
          >
            {group.title}
          </SubSectionTitle>
          {group.skills.map(skill => (
            <RatingSlider
              key={skill.id}
              label={skill.label}
              value={ratings[skill.id] || 5}
              onChange={(e) => updateRating(skill.id, e.target.value)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const GoalsSection = ({ data, setData }) => {
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-x-6">
        <InputField 
          label="HCP-mål 2026" 
          type="number" 
          required
          placeholder="F.eks. 2.0"
          value={data.goalHcp || ''}
          onChange={(e) => updateField('goalHcp', e.target.value)}
        />
        <InputField 
          label="Målscore (18 hull snitt)" 
          type="number"
          placeholder="F.eks. 72"
          value={data.goalScore || ''}
          onChange={(e) => updateField('goalScore', e.target.value)}
        />
      </div>

      <InputField 
        label="Mål-kategori" 
        type="select"
        options={playerRankingSystem.map(r => `${r.kategori} - ${r.name}`)}
        note="Hvilken kategori ønsker du å nå?"
        value={data.goalCategory || ''}
        onChange={(e) => updateField('goalCategory', e.target.value)}
      />

      <InputField 
        label="Turneringsmål" 
        type="textarea"
        placeholder="Hvilke turneringer vil du spille? Hvilke plasseringer sikter du mot?"
        value={data.tournamentGoals || ''}
        onChange={(e) => updateField('tournamentGoals', e.target.value)}
      />

      <InputField 
        label="Viktigste utviklingsområde" 
        type="textarea"
        required
        placeholder="Hva ønsker du å bli bedre på?"
        value={data.developmentFocus || ''}
        onChange={(e) => updateField('developmentFocus', e.target.value)}
      />

      <InputField 
        label="Langsiktig drøm" 
        type="textarea"
        placeholder="Hvor vil du være om 5 år?"
        value={data.longTermDream || ''}
        onChange={(e) => updateField('longTermDream', e.target.value)}
      />
    </div>
  );
};

const AvailabilitySection = ({ data, setData }) => {
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
  const times = ['Morgen (06-09)', 'Formiddag (09-12)', 'Ettermiddag (12-16)', 'Kveld (16-20)', 'Sen kveld (20+)'];

  return (
    <div>
      <InputField 
        label="Timer tilgjengelig per uke" 
        type="number"
        required
        placeholder="F.eks. 12"
        note="Vær realistisk"
        value={data.hoursWeekly || ''}
        onChange={(e) => updateField('hoursWeekly', e.target.value)}
      />

      <div className="mb-6">
        <label className="block text-sm font-medium mb-3" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Foretrukne treningsdager <span style={{ color: colors.primary }}>*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {days.map(day => (
            <MultiSelectChip
              key={day}
              selected={data.preferredDays?.includes(day)}
              onClick={() => {
                const current = data.preferredDays || [];
                const updated = current.includes(day) 
                  ? current.filter(d => d !== day)
                  : [...current, day];
                updateField('preferredDays', updated);
              }}
            >
              {day.slice(0, 3)}
            </MultiSelectChip>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-3" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Foretrukne tidspunkt
        </label>
        <div className="flex flex-wrap gap-2">
          {times.map(time => (
            <MultiSelectChip
              key={time}
              selected={data.preferredTimes?.includes(time)}
              onClick={() => {
                const current = data.preferredTimes || [];
                const updated = current.includes(time) 
                  ? current.filter(t => t !== time)
                  : [...current, time];
                updateField('preferredTimes', updated);
              }}
            >
              {time}
            </MultiSelectChip>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-x-6">
        <InputField 
          label="Primær golftreningslokasjon" 
          type="select"
          required
          options={['Mulligan Indoor Golf', 'Edge Golf', 'GFGK', 'Fornebu Indoor Golf', 'Hjemmeklubb', 'Annet']}
          value={data.golfLocation || ''}
          onChange={(e) => updateField('golfLocation', e.target.value)}
        />
        <InputField 
          label="Gym lokasjon" 
          type="select"
          options={['SATS', 'Spenst', 'Active Trening', 'Wang Gym', 'Hjemme', 'Ingen fast', 'Annet']}
          value={data.gymLocation || ''}
          onChange={(e) => updateField('gymLocation', e.target.value)}
        />
      </div>

      <InputField 
        label="Planlagte reiser / fravær" 
        type="textarea"
        placeholder="Datoer du vet du er borte (ferie, turneringer, etc.)"
        value={data.travelPeriods || ''}
        onChange={(e) => updateField('travelPeriods', e.target.value)}
      />
    </div>
  );
};

const PlanSelectionSection = ({ data, setData }) => {
  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const durations = [
    { value: '3', label: '3 mnd', desc: 'Kortsiktig' },
    { value: '6', label: '6 mnd', desc: 'Halvår' },
    { value: '9', label: '9 mnd', desc: 'Sesong' },
    { value: '12', label: '12 mnd', desc: 'Anbefalt' },
  ];

  const intensities = [
    { value: 'light', label: 'Lett', hours: '5-8 timer/uke' },
    { value: 'moderate', label: 'Moderat', hours: '8-12 timer/uke' },
    { value: 'intensive', label: 'Intensiv', hours: '12-18 timer/uke' },
    { value: 'elite', label: 'Elite', hours: '18+ timer/uke' },
  ];

  const resources = [
    { id: 'trackmanFree', label: 'Trackman - Fri tilgang' },
    { id: 'trackmanLimited', label: 'Trackman - Begrenset tid' },
    { id: 'netMat', label: 'Nett og matte (uten Trackman)' },
    { id: 'puttingLab', label: 'Putting lab' },
    { id: 'videoAnalysis', label: 'Video analyse' },
    { id: 'gym', label: 'Gym medlemskap' },
    { id: 'coachIncluded', label: 'Trenertimer inkludert' },
  ];

  return (
    <div>
      {/* Duration Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-4" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Velg varighet <span style={{ color: colors.primary }}>*</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          {durations.map(d => (
            <button
              key={d.value}
              onClick={() => updateField('planDuration', d.value)}
              className="p-4 rounded-xl border-2 text-center transition-all hover:shadow-sm"
              style={{ 
                borderColor: data.planDuration === d.value ? colors.primary : colors.borderLight,
                backgroundColor: data.planDuration === d.value ? `${colors.primary}08` : colors.white,
              }}
            >
              <p className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>{d.value}</p>
              <p className="text-xs" style={{ color: colors.textMuted }}>{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-4" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Treningsintensitet <span style={{ color: colors.primary }}>*</span>
        </label>
        <div className="space-y-3">
          {intensities.map(i => (
            <OptionCard
              key={i.value}
              selected={data.intensity === i.value}
              onClick={() => updateField('intensity', i.value)}
              description={i.hours}
            >
              {i.label}
            </OptionCard>
          ))}
        </div>
      </div>

      {/* Focus Area */}
      <InputField 
        label="Hovedfokus" 
        type="select"
        required
        options={['Allround utvikling', 'Teknisk forbedring', 'Turneringsforberedelse', 'Fysisk grunnlag', 'Kortspill fokus', 'Langspill fokus', 'Mental styrke']}
        value={data.mainFocus || ''}
        onChange={(e) => updateField('mainFocus', e.target.value)}
      />

      {/* Resource Access */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: colors.ink, fontFamily: 'DM Sans, sans-serif' }}>
          Tilgang til ressurser
        </label>
        <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
          Kryss av for hva du har tilgang til
        </p>
        <div className="space-y-2">
          {resources.map(resource => (
            <label
              key={resource.id}
              className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border"
              style={{ 
                backgroundColor: data.resources?.[resource.id] ? `${colors.primary}08` : colors.white,
                borderColor: data.resources?.[resource.id] ? colors.primary : colors.borderLight,
              }}
            >
              <input
                type="checkbox"
                checked={data.resources?.[resource.id] || false}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  resources: { ...prev.resources, [resource.id]: e.target.checked }
                }))}
                className="w-5 h-5 rounded"
                style={{ accentColor: colors.primary }}
              />
              <span className="font-medium text-sm" style={{ color: colors.ink }}>{resource.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const CompleteSection = ({ data }) => (
  <div className="text-center py-12">
    <div 
      className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
      style={{ backgroundColor: colors.success }}
    >
      <Check className="w-10 h-10 text-white" />
    </div>
    
    <SectionTitle
      className="text-3xl md:text-4xl mb-4"
      style={{ color: colors.ink, fontFamily: 'Shippori Mincho, serif' }}
    >
      Din plan er klar!
    </SectionTitle>
    
    <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: colors.textMuted }}>
      Vi har laget en personlig utviklingsplan basert på dine svar.
    </p>

    <div 
      className="p-6 rounded-2xl mb-10 max-w-sm mx-auto text-left"
      style={{ backgroundColor: colors.warmNeutral }}
    >
      <div className="flex items-center gap-3 mb-4">
        <AKLogo size={24} color={colors.primary} />
        <SubSectionTitle className="font-medium" style={{ color: colors.ink }}>Din plan inkluderer:</SubSectionTitle>
      </div>
      <ul className="space-y-3">
        <li className="flex items-center gap-3" style={{ color: colors.ink }}>
          <Check className="w-5 h-5 flex-shrink-0" style={{ color: colors.success }} />
          <span>{data.planDuration || '12'} måneders utviklingsplan</span>
        </li>
        <li className="flex items-center gap-3" style={{ color: colors.ink }}>
          <Check className="w-5 h-5 flex-shrink-0" style={{ color: colors.success }} />
          <span>Personlige treningsøkter</span>
        </li>
        <li className="flex items-center gap-3" style={{ color: colors.ink }}>
          <Check className="w-5 h-5 flex-shrink-0" style={{ color: colors.success }} />
          <span>Ukentlige oppfølginger</span>
        </li>
        <li className="flex items-center gap-3" style={{ color: colors.ink }}>
          <Check className="w-5 h-5 flex-shrink-0" style={{ color: colors.success }} />
          <span>Tilgang til drill-bibliotek</span>
        </li>
      </ul>
    </div>

    <button
      className="px-10 py-4 rounded-xl font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      style={{ 
        backgroundColor: colors.primary,
        color: colors.white,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      Gå til min plan
    </button>
  </div>
);

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function AKIntakeFormV2() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ planDuration: '12' }); // Default 12 months
  const [isAnimating, setIsAnimating] = useState(false);

  const totalSteps = sections.length;
  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  };

  const renderSection = () => {
    const section = sections[currentStep];
    switch (section.id) {
      case 'welcome': return <WelcomeSection onNext={nextStep} />;
      case 'personal': return <PersonalSection data={formData} setData={setFormData} />;
      case 'golf': return <GolfBackgroundSection data={formData} setData={setFormData} />;
      case 'sports': return <SportsInjurySection data={formData} setData={setFormData} />;
      case 'season': return <SeasonReviewSection data={formData} setData={setFormData} />;
      case 'training': return <TrainingHistorySection data={formData} setData={setFormData} />;
      case 'assessment': return <AssessmentSection data={formData} setData={setFormData} />;
      case 'goals': return <GoalsSection data={formData} setData={setFormData} />;
      case 'availability': return <AvailabilitySection data={formData} setData={setFormData} />;
      case 'plan': return <PlanSelectionSection data={formData} setData={setFormData} />;
      case 'complete': return <CompleteSection data={formData} />;
      default: return null;
    }
  };

  const isWelcome = currentStep === 0;
  const isComplete = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: 'DM Sans, sans-serif' }}>
      {/* Load fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Shippori+Mincho&display=swap');
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${colors.primary};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${colors.primary};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        input:focus, select:focus, textarea:focus {
          border-color: ${colors.primary} !important;
          box-shadow: 0 0 0 3px ${colors.primary}15 !important;
        }

        ::selection {
          background: ${colors.primary}30;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.textMuted};
        }
      `}</style>

      {/* Header - Hidden on welcome and complete */}
      {!isWelcome && !isComplete && (
        <header 
          className=" border-b backdrop-blur-sm"
          style={{ backgroundColor: `${colors.white}F5`, borderColor: colors.borderLight }}
        >
          <div className="max-w-2xl mx-auto px-6 py-4">
            {/* Logo and Step indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AKLogo size={28} color={colors.primary} />
                <span className="text-sm font-medium" style={{ color: colors.ink }}>
                  {sections[currentStep].title}
                </span>
              </div>
              <span className="text-sm tabular-nums" style={{ color: colors.textMuted }}>
                {currentStep} av {totalSteps - 2}
              </span>
            </div>
            
            {/* Progress bar */}
            <div 
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.borderLight }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, backgroundColor: colors.primary }}
              />
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8 pb-32">
        <div 
          className={`transition-all duration-150 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
        >
          {/* Section Header - Hidden on welcome and complete */}
          {!isWelcome && !isComplete && (
            <div className="mb-8">
              <PageTitle
                className="text-2xl md:text-3xl mb-2"
                style={{ color: colors.ink, fontFamily: 'Shippori Mincho, serif', fontWeight: 400 }}
              >
                {sections[currentStep].title}
              </PageTitle>
              <p className="text-base" style={{ color: colors.textMuted }}>
                {sections[currentStep].subtitle}
              </p>
            </div>
          )}

          {/* Section Content */}
          <div 
            className={!isWelcome && !isComplete ? "bg-white rounded-2xl p-6 md:p-8 shadow-sm border" : ""}
            style={{ borderColor: colors.borderLight }}
          >
            {renderSection()}
          </div>
        </div>
      </main>

      {/* Footer Navigation - Hidden on welcome and complete */}
      {!isWelcome && !isComplete && (
        <footer 
          className="fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm"
          style={{ backgroundColor: `${colors.white}F5`, borderColor: colors.borderLight }}
        >
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep <= 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all disabled:opacity-30 hover:bg-gray-50"
              style={{ color: colors.ink }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Tilbake</span>
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.white,
              }}
            >
              <span>{currentStep === totalSteps - 2 ? 'Fullfør' : 'Neste'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
