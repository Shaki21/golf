/**
 * StatsGuidePage.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import {
  Target, TrendingUp, Trophy, Dumbbell, Zap, Ruler, Circle,
  ChevronRight, ChevronDown, Info, CheckCircle, ArrowRight,
  BookOpen, HelpCircle, Award, BarChart2, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';
import { PageHeader } from '../../ui/raw-blocks';

// ============================================================================
// DATA - De 20 Offisielle Testene
// ============================================================================

// Color class mapping for categories
const COLOR_CLASSES = {
  brand: { text: 'text-tier-navy', bg: 'bg-tier-navy/15' },
  success: { text: 'text-tier-success', bg: 'bg-tier-success/15' },
  warning: { text: 'text-tier-warning', bg: 'bg-tier-warning/15' },
  error: { text: 'text-tier-error', bg: 'bg-tier-error/15' },
  secondary: { text: 'text-tier-text-secondary', bg: 'bg-tier-surface-base' },
};

const TEST_CATEGORIES = [
  {
    id: 'distance',
    name: 'Distanse',
    icon: Ruler,
    colorKey: 'brand',
    description: 'Måler lengden på slagene dine',
    tests: [
      { id: 1, name: 'Driver distanse', description: 'Gjennomsnitt av 3 beste av 6 slag', unit: 'meter' },
      { id: 2, name: '3-tre distanse', description: 'Gjennomsnitt av 3 beste av 6 slag', unit: 'meter' },
      { id: 3, name: '5-jern distanse', description: 'Gjennomsnitt av 3 beste av 6 slag', unit: 'meter' },
      { id: 4, name: 'PW distanse', description: 'Gjennomsnitt av 3 beste av 6 slag', unit: 'meter' },
    ],
  },
  {
    id: 'speed',
    name: 'Hastighet',
    icon: Zap,
    colorKey: 'warning',
    description: 'Måler svinghastighet og ballhastighet',
    tests: [
      { id: 5, name: 'Klubbhastighet', description: 'Maksimal svinghastighet med driver', unit: 'km/t' },
      { id: 6, name: 'Ballhastighet', description: 'Maksimal ballhastighet etter treff', unit: 'km/t' },
      { id: 7, name: 'Smash Factor', description: 'Forholdet mellom ball- og klubbhastighet', unit: 'ratio' },
    ],
  },
  {
    id: 'approach',
    name: 'Approach',
    icon: Target,
    colorKey: 'success',
    description: 'Presisjon på innspill',
    tests: [
      { id: 8, name: '25m presisjon', description: 'Avstand fra hull på 10 slag', unit: 'cm' },
      { id: 9, name: '50m presisjon', description: 'Avstand fra hull på 10 slag', unit: 'cm' },
      { id: 10, name: '75m presisjon', description: 'Avstand fra hull på 10 slag', unit: 'meter' },
      { id: 11, name: '100m presisjon', description: 'Avstand fra hull på 10 slag', unit: 'meter' },
    ],
  },
  {
    id: 'physical',
    name: 'Fysisk',
    icon: Dumbbell,
    colorKey: 'error',
    description: 'Fysisk kapasitet og styrke',
    tests: [
      { id: 12, name: 'Benkpress', description: 'Maksimal styrke i overkropp', unit: 'kg' },
      { id: 13, name: 'Markløft', description: 'Maksimal styrke i bein og rygg', unit: 'kg' },
      { id: 14, name: '3km løp', description: 'Kondisjon og utholdenhet', unit: 'min' },
    ],
  },
  {
    id: 'shortgame',
    name: 'Kortspill',
    icon: Circle,
    colorKey: 'warning',
    description: 'Putting, chipping og bunker',
    tests: [
      { id: 15, name: 'Putting 3m', description: '10 putter fra 3 meter', unit: 'treff' },
      { id: 16, name: 'Putting 6m', description: '10 putter fra 6 meter', unit: 'treff' },
      { id: 17, name: 'Chipping', description: 'Presisjon fra 15m utenfor green', unit: 'poeng' },
      { id: 18, name: 'Bunker', description: 'Presisjon fra greenside bunker', unit: 'poeng' },
    ],
  },
  {
    id: 'oncourse',
    name: 'On-Course',
    icon: Trophy,
    colorKey: 'brand',
    description: 'Prestasjon på banen',
    tests: [
      { id: 19, name: '9-hulls simulering', description: 'Score på standardisert 9-hulls test', unit: 'slag' },
      { id: 20, name: 'On-Course vurdering', description: 'Helhetlig spillprestasjon', unit: 'poeng' },
    ],
  },
];

// ============================================================================
// DATA - Spillerkategorier (A-K)
// ============================================================================

const PLAYER_CATEGORIES = [
  { category: 'A', scoreRange: '< 70', level: 'Elite / Tour', emoji: '', colorKey: 'success' },
  { category: 'B', scoreRange: '70-72', level: 'Scratch', emoji: '', colorKey: 'success' },
  { category: 'C', scoreRange: '73-75', level: 'Lavt handicap', emoji: '', colorKey: 'success' },
  { category: 'D', scoreRange: '76-78', level: 'Singel handicap', emoji: '', colorKey: 'warning' },
  { category: 'E', scoreRange: '79-81', level: 'Middels', emoji: '', colorKey: 'warning' },
  { category: 'F', scoreRange: '82-84', level: 'Hobby+', emoji: '', colorKey: 'secondary' },
  { category: 'G', scoreRange: '85-87', level: 'Hobby', emoji: '', colorKey: 'secondary' },
  { category: 'H', scoreRange: '88-90', level: 'Nybegynner+', emoji: '', colorKey: 'secondary' },
  { category: 'I', scoreRange: '91-93', level: 'Nybegynner', emoji: '', colorKey: 'secondary' },
  { category: 'J', scoreRange: '94-96', level: 'Starter+', emoji: '', colorKey: 'secondary' },
  { category: 'K', scoreRange: '97+', level: 'Starter', emoji: '', colorKey: 'secondary' },
];

// ============================================================================
// DATA - Strokes Gained Komponenter
// ============================================================================

const SG_COMPONENTS = [
  {
    id: 'ott',
    name: 'Off The Tee (OTT)',
    description: 'Driver og utslag',
    detail: 'Måler hvor mye verdi du skaper med driveren og utslag på par 4 og 5. Inkluderer både distanse og presisjon.',
    icon: Ruler,
    colorKey: 'brand',
  },
  {
    id: 'app',
    name: 'Approach (APP)',
    description: 'Innspill til green',
    detail: 'Måler presisjonen på slag fra fairway og rough inn mot green. Hvor nær hullet treffer du?',
    icon: Target,
    colorKey: 'success',
  },
  {
    id: 'arg',
    name: 'Around Green (ARG)',
    description: 'Kortspill rundt green',
    detail: 'Chipping, pitching og bunker slag. Hvor effektiv er du når du bommer på green?',
    icon: Circle,
    colorKey: 'warning',
  },
  {
    id: 'putt',
    name: 'Putting (PUTT)',
    description: 'Putter på green',
    detail: 'Effektiviteten din på green. Antall putter per runde sammenlignet med forventet basert på avstand.',
    icon: Trophy,
    colorKey: 'error',
  },
];

// ============================================================================
// TABS FOR NAVIGATION
// ============================================================================

const TABS = [
  { id: 'intro', label: 'Hva er dette?', icon: BookOpen },
  { id: 'tests', label: 'Testene', icon: Target },
  { id: 'categories', label: 'Kategorier', icon: Trophy },
  { id: 'strokes-gained', label: 'Strokes Gained', icon: TrendingUp },
  { id: 'how-it-works', label: 'Slik fungerer det', icon: ArrowRight },
];

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-tier-white rounded-[14px] p-5 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

const IconBadge = ({ icon: Icon, colorKey, size = 40 }) => {
  const colors = COLOR_CLASSES[colorKey] || COLOR_CLASSES.brand;
  const sizeClasses = size === 44 ? 'w-11 h-11 rounded-[11px]' : 'w-10 h-10 rounded-[10px]';
  return (
    <div className={`${sizeClasses} ${colors.bg} flex items-center justify-center shrink-0`}>
      <Icon size={size * 0.5} className={colors.text} />
    </div>
  );
};

const GuideSectionTitle = ({ children, subtitle }) => (
  <div className="mb-6">
    <SectionTitle>
      {children}
    </SectionTitle>
    {subtitle && (
      <p className="text-sm text-tier-text-secondary mt-1.5 mb-0">
        {subtitle}
      </p>
    )}
  </div>
);

// ============================================================================
// SECTION 1: INTRO
// ============================================================================

const IntroSection = () => {
  const navigate = useNavigate();

  return (
    <div>
      <GuideSectionTitle subtitle="Forstå hvordan vi måler og utvikler ditt golfspill">
        Din golfutvikling - målt og analysert
      </GuideSectionTitle>

      <Card className="mb-6 bg-tier-navy/10 border border-tier-navy/20">
        <p className="text-[15px] text-tier-navy m-0 leading-relaxed">
          TIER Golf bruker <strong>Team Norway Golf Testing Protocol</strong> for å måle alle aspekter
          av golfspillet ditt. Basert på dine testresultater tilpasser vi treningsplanen automatisk til
          dine styrker og forbedringsområder.
        </p>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mb-8">
        <Card>
          <div className="flex items-start gap-3.5">
            <IconBadge icon={Target} colorKey="brand" />
            <div>
              <SubSectionTitle className="m-0 mb-1.5">
                20 Standardiserte Tester
              </SubSectionTitle>
              <p className="text-[13px] text-tier-text-secondary m-0 leading-snug">
                Dekker alt fra driving til putting - alle aspekter av spillet ditt måles objektivt.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3.5">
            <IconBadge icon={Award} colorKey="success" />
            <div>
              <SubSectionTitle className="m-0 mb-1.5">
                Personlig Kategori (A-K)
              </SubSectionTitle>
              <p className="text-[13px] text-tier-text-secondary m-0 leading-snug">
                Din spillernivå basert på 18-hulls gjennomsnitt, fra Elite (A) til Starter (K).
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3.5">
            <IconBadge icon={TrendingUp} colorKey="warning" />
            <div>
              <SubSectionTitle className="m-0 mb-1.5">
                Automatisk Tilpasning
              </SubSectionTitle>
              <p className="text-[13px] text-tier-text-secondary m-0 leading-snug">
                Treningsplanen justeres etter testresultatene - fokus på det som gir størst forbedring.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => navigate('/testresultater')}
          className="flex items-center gap-2 py-3 px-5 bg-tier-navy text-white border-none rounded-[10px] text-sm font-medium cursor-pointer"
        >
          Se mine tester
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => navigate('/statistikk')}
          className="flex items-center gap-2 py-3 px-5 bg-tier-surface-base text-tier-navy border border-tier-border-default rounded-[10px] text-sm font-medium cursor-pointer"
        >
          Gå til statistikk
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 2: TESTS OVERVIEW
// ============================================================================

const TestCategoryCard = ({ category, isExpanded, onToggle }) => {
  const Icon = category.icon;
  const colors = COLOR_CLASSES[category.colorKey] || COLOR_CLASSES.brand;

  return (
    <Card
      onClick={onToggle}
      className={`cursor-pointer border-2 ${isExpanded ? 'border-tier-navy' : 'border-transparent'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconBadge icon={Icon} colorKey={category.colorKey} size={44} />
          <div>
            <SubSectionTitle className="m-0">
              {category.name}
            </SubSectionTitle>
            <p className="text-xs text-tier-text-secondary mt-0.5 mb-0">
              {category.tests.length} tester
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown size={20} className="text-tier-text-secondary" />
        ) : (
          <ChevronRight size={20} className="text-tier-text-secondary" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-tier-border-default">
          <p className="text-[13px] text-tier-text-secondary m-0 mb-3">
            {category.description}
          </p>
          <div className="flex flex-col gap-2.5">
            {category.tests.map((test) => (
              <div
                key={test.id}
                className="flex items-center gap-2.5 py-2.5 px-3 bg-tier-surface-base rounded-lg"
              >
                <span className={`w-6 h-6 rounded-md ${colors.bg} ${colors.text} flex items-center justify-center text-[11px] font-semibold`}>
                  {test.id}
                </span>
                <div>
                  <div className="text-[13px] font-medium text-tier-navy">
                    {test.name}
                  </div>
                  <div className="text-[11px] text-tier-text-secondary">
                    {test.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

const TestsSection = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  return (
    <div>
      <GuideSectionTitle subtitle="Vi måler 20 ulike ferdigheter - fra driver-distanse til putting-presisjon">
        De 20 Offisielle Testene
      </GuideSectionTitle>

      <Card className="mb-6 bg-tier-surface-base">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-tier-navy shrink-0 mt-0.5" />
          <p className="text-sm text-tier-navy m-0 leading-snug">
            Hver test har klare krav for hver spillerkategori, så du alltid vet hva du jobber mot.
            Klikk på en kategori for å se alle testene.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
        {TEST_CATEGORIES.map((category) => (
          <TestCategoryCard
            key={category.id}
            category={category}
            isExpanded={expandedCategory === category.id}
            onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 3: CATEGORIES (A-K)
// ============================================================================

const CategoriesSection = () => {
  const navigate = useNavigate();

  return (
    <div>
      <GuideSectionTitle subtitle="Basert på ditt 18-hulls gjennomsnitt plasseres du i en kategori fra A (Elite) til K (Starter)">
        Din Spillerkategori
      </GuideSectionTitle>

      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[400px]">
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-tier-text-secondary border-b border-tier-border-default">
                  Kategori
                </th>
                <th className="p-3 text-left text-xs font-semibold text-tier-text-secondary border-b border-tier-border-default">
                  Score (18 hull)
                </th>
                <th className="p-3 text-left text-xs font-semibold text-tier-text-secondary border-b border-tier-border-default">
                  Nivå
                </th>
              </tr>
            </thead>
            <tbody>
              {PLAYER_CATEGORIES.map((cat, index) => {
                const colors = COLOR_CLASSES[cat.colorKey] || COLOR_CLASSES.secondary;
                return (
                  <tr key={cat.category} className={index % 2 === 0 ? 'bg-transparent' : 'bg-tier-surface-base'}>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-bold`}>
                          {cat.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-tier-navy font-medium">
                      {cat.scoreRange}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-tier-text-secondary">
                        {cat.emoji} {cat.level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-tier-surface-base">
        <div className="flex items-start gap-3">
          <HelpCircle size={20} className="text-tier-navy shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-tier-navy m-0 leading-snug">
              <strong>Hvordan fungerer det?</strong><br />
              Hver test har egne krav for hver kategori. For eksempel krever kategori A lengre driver-distanse
              enn kategori E. Se dine personlige krav under "Mine tester".
            </p>
            <button
              onClick={() => navigate('/testresultater')}
              className="mt-3 flex items-center gap-1.5 py-2 px-3.5 bg-tier-navy text-white border-none rounded-lg text-[13px] font-medium cursor-pointer"
            >
              Se mine kategorikrav
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// SECTION 4: STROKES GAINED
// ============================================================================

const StrokesGainedSection = () => {
  return (
    <div>
      <GuideSectionTitle subtitle="En moderne måte å analysere golfspillet på">
        Strokes Gained Forklaring
      </GuideSectionTitle>

      <Card className="mb-6 bg-tier-navy/10 border border-tier-navy/20">
        <div className="flex items-start gap-3">
          <BarChart2 size={24} className="text-tier-navy shrink-0 mt-0.5" />
          <div>
            <SubSectionTitle className="m-0 mb-2">
              Enkelt forklart
            </SubSectionTitle>
            <p className="text-sm text-tier-navy m-0 leading-relaxed">
              Strokes Gained viser hvor mange slag du <strong>sparer</strong> (eller taper) sammenlignet med
              tour-gjennomsnittet. <strong>+1.0</strong> betyr du er 1 slag bedre per runde i den kategorien.
            </p>
          </div>
        </div>
      </Card>

      <SubSectionTitle className="m-0 mb-4">
        De 4 komponentene
      </SubSectionTitle>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3 mb-6">
        {SG_COMPONENTS.map((comp) => {
          const Icon = comp.icon;
          const colors = COLOR_CLASSES[comp.colorKey] || COLOR_CLASSES.brand;
          return (
            <Card key={comp.id}>
              <div className="flex items-start gap-3.5">
                <IconBadge icon={Icon} colorKey={comp.colorKey} />
                <div>
                  <CardTitle className="m-0 mb-1">
                    {comp.name}
                  </CardTitle>
                  <p className={`text-xs ${colors.text} m-0 mb-2 font-medium`}>
                    {comp.description}
                  </p>
                  <p className="text-[13px] text-tier-text-secondary m-0 leading-snug">
                    {comp.detail}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <SubSectionTitle className="m-0 mb-4">
        Hvordan tolke tallene
      </SubSectionTitle>

      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-2.5 bg-tier-success/10 rounded-lg">
            <TrendingUp size={20} className="text-tier-success" />
            <div>
              <span className="text-sm font-semibold text-tier-success">+2.0 eller høyere</span>
              <span className="text-[13px] text-tier-text-secondary ml-3">Tour-nivå styrke</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 bg-tier-success/5 rounded-lg">
            <TrendingUp size={20} className="text-tier-success opacity-70" />
            <div>
              <span className="text-sm font-semibold text-tier-navy">+0.5 til +2.0</span>
              <span className="text-[13px] text-tier-text-secondary ml-3">Over gjennomsnittet</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 bg-tier-surface-base rounded-lg">
            <div className="w-5 h-0.5 bg-tier-text-secondary" />
            <div>
              <span className="text-sm font-semibold text-tier-navy">-0.5 til +0.5</span>
              <span className="text-[13px] text-tier-text-secondary ml-3">Gjennomsnittlig</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 bg-tier-error/5 rounded-lg">
            <TrendingUp size={20} className="text-tier-error rotate-180" />
            <div>
              <span className="text-sm font-semibold text-tier-error">-0.5 eller lavere</span>
              <span className="text-[13px] text-tier-text-secondary ml-3">Forbedringsområde</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// SECTION 5: HOW IT WORKS
// ============================================================================

const HowItWorksSection = () => {
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Du tar test', description: 'Gjennomfør en eller flere av de 20 standardiserte testene.', icon: Target, colorKey: 'brand' },
    { id: 2, title: 'Resultat lagres', description: 'Resultatet sammenlignes med kravene for din kategori.', icon: BarChart2, colorKey: 'warning' },
    { id: 3, title: 'Analyse', description: 'Vi identifiserer styrker og forbedringsområder (Breaking Points).', icon: TrendingUp, colorKey: 'success' },
    { id: 4, title: 'Plan tilpasses', description: 'Treningsplanen oppdateres automatisk basert på dine resultater.', icon: Calendar, colorKey: 'brand' },
  ];

  return (
    <div>
      <GuideSectionTitle subtitle="Slik bruker vi testene til å forbedre spillet ditt">
        Slik Fungerer Det
      </GuideSectionTitle>

      {/* Flow diagram */}
      <div className="flex flex-col gap-0 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const colors = COLOR_CLASSES[step.colorKey] || COLOR_CLASSES.brand;
          return (
            <div key={step.id}>
              <Card className="relative">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={24} className={colors.text} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className={`text-[11px] font-semibold ${colors.text} ${colors.bg} py-0.5 px-2 rounded-[10px]`}>
                        Steg {step.id}
                      </span>
                    </div>
                    <CardTitle className="text-base m-0 mb-1">
                      {step.title}
                    </CardTitle>
                    <p className="text-sm text-tier-text-secondary m-0 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight size={24} className="text-tier-border-default rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key points */}
      <SubSectionTitle className="m-0 mb-4">
        Nøkkelpunkter
      </SubSectionTitle>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          'Tester avdekker dine styrker og svakheter objektivt',
          'Svake områder blir "Breaking Points" som får ekstra fokus',
          'Treningsplanen oppdateres automatisk når du forbedrer deg',
          'Test regelmessig for å spore fremgang',
        ].map((point, index) => (
          <div key={index} className="flex items-center gap-3 py-3 px-4 bg-tier-white rounded-[10px] border border-tier-border-default">
            <CheckCircle size={18} className="text-tier-success" />
            <span className="text-sm text-tier-navy">{point}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => navigate('/testresultater')}
          className="flex items-center gap-2 py-3 px-5 bg-tier-navy text-white border-none rounded-[10px] text-sm font-medium cursor-pointer"
        >
          Se mine tester
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => navigate('/utvikling/breaking-points')}
          className="flex items-center gap-2 py-3 px-5 bg-tier-surface-base text-tier-navy border border-tier-border-default rounded-[10px] text-sm font-medium cursor-pointer"
        >
          Se Breaking Points
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const StatsGuidePage = () => {
  const [activeTab, setActiveTab] = useState('intro');

  const renderSection = () => {
    switch (activeTab) {
      case 'intro':
        return <IntroSection />;
      case 'tests':
        return <TestsSection />;
      case 'categories':
        return <CategoriesSection />;
      case 'strokes-gained':
        return <StrokesGainedSection />;
      case 'how-it-works':
        return <HowItWorksSection />;
      default:
        return <IntroSection />;
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <div className="p-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Statistikkguide"
          subtitle="Lær om testene og kategoriene i TIER Golf systemet"
          helpText="Komplett guide til TIER Golf testene, kategoriene (A-K), og Strokes Gained-analyse. Utforsk de 20 offisielle testene, lær hvordan kategorisystemet fungerer, forstå Strokes Gained-metrikker og hvordan du tolker resultatene. Bruk fanene for å navigere mellom temaer."
        />
        {/* Tab Navigation */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-2.5 px-4 border-none rounded-[10px] text-[13px] font-medium cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-tier-navy text-white shadow-md'
                    : 'bg-tier-white text-tier-navy'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        {renderSection()}
      </div>
    </div>
  );
};

export default StatsGuidePage;
