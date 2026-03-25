/**
 * Seed Session Templates
 * 150 Session Templates for the IUP Golf Training System
 * Covering all categories (A-K), periods (E, G, S, T), and session types
 */

import prisma from '../client';


const sessionTemplates = [
  // ============================================
  // E PERIOD - FUNDAMENTAL SESSIONS (25 templates)
  // ============================================
  // primaryDomain: TEE, INN50, INN100, INN150, INN200, ARG, PUTT, PHYS, or null

  // E-Period Technical Sessions (10)
  {
    name: 'Grunnleggende Grip og Setup',
    description: 'Etablere korrekt grep, holdning og balansepunkt',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 60,
    primaryDomain: null, // General technique - no specific domain
    exerciseSequence: {
      warmup: ['Mobilitet', 'Dynamisk tøying'],
      main: ['Grep-drill', 'Setup-posisjon', 'Balanse-øvelser', 'Speil-arbeid'],
      cooldown: ['Tøying', 'Oppsummering'],
    },
    objectives: 'Etablere solid grunnlag for grep og setup',
    structure: '10min oppvarming, 40min teknikk, 10min gjennomgang',
    successCriteria: 'Konsistent grep og setup uten korrigering',
  },
  {
    name: 'Sving-fundamenter Del 1',
    description: 'Grunnleggende svingbane og tempo',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 75,
    primaryDomain: null, // General swing mechanics
    exerciseSequence: {
      warmup: ['Rotasjonsøvelser', 'Armsvinger'],
      main: ['Halvsving drill', 'Tempo-trening', 'Svingbane med stikker'],
      cooldown: ['Langsomme fulle sving'],
    },
    objectives: 'Utvikle grunnleggende svingmekanikk',
    structure: '15min oppvarming, 50min hovedøvelser, 10min nedkjøling',
    successCriteria: 'Jevnt tempo og korrekt svingbane',
  },
  {
    name: 'Sving-fundamenter Del 2',
    description: 'Impact-posisjon og follow-through',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 75,
    primaryDomain: null, // General swing mechanics
    exerciseSequence: {
      warmup: ['Impact bag øvelser'],
      main: ['Impact posisjon', 'Håndledds-rotasjon', 'Follow-through'],
      cooldown: ['Fullsving med fokus på impact'],
    },
    objectives: 'Forstå og utvikle korrekt impact-posisjon',
    structure: '10min oppvarming, 55min hovedøvelser, 10min avslutning',
    successCriteria: 'Konsistent impact med flat venstre håndledd',
  },
  {
    name: 'Jern Grunnkurs',
    description: 'Introduksjon til jernspill',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 90,
    primaryDomain: 'INN100', // Iron play - 100-150m approach
    exerciseSequence: {
      warmup: ['Wedge-sving', 'Mobilitet'],
      main: ['7-jern basics', 'Ball-posisjon', 'Divot-kontroll'],
      cooldown: ['Måltrening'],
    },
    objectives: 'Lære grunnleggende jernspill-teknikk',
    structure: '15min oppvarming, 65min teknikk, 10min måltrening',
    successCriteria: 'Konsistent kontakt med ball først',
  },
  {
    name: 'Driver Introduksjon',
    description: 'Grunnleggende driver-teknikk',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 90,
    primaryDomain: 'TEE', // Driver/tee shots
    exerciseSequence: {
      warmup: ['Speed sticks lett', 'Rotasjonsøvelser'],
      main: ['Tee-høyde', 'Ballposisjon', 'Sweep-bevegelse'],
      cooldown: ['Rolige full-sving'],
    },
    objectives: 'Etablere grunnleggende driver-mekanikk',
    structure: '15min oppvarming, 60min teknikk, 15min rolig sving',
    successCriteria: 'Konsistent tee-slag med akseptabel retning',
  },
  {
    name: 'Putting Fundamenter',
    description: 'Grunnleggende putting-teknikk og lesing',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 60,
    primaryDomain: 'PUTT', // Putting
    exerciseSequence: {
      warmup: ['Pendel-øvelser'],
      main: ['Grep og setup', 'Gate drill 1m', 'Distanse-kontroll'],
      cooldown: ['Kort putting konkurranse'],
    },
    objectives: 'Etablere solid putting-grunnlag',
    structure: '10min oppvarming, 40min hovedøvelser, 10min konkurranse',
    successCriteria: '80% hull fra 1 meter',
  },
  {
    name: 'Chipping Basics',
    description: 'Introduksjon til chipping rundt green',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 60,
    primaryDomain: 'ARG', // Around the green
    exerciseSequence: {
      warmup: ['Korte swinger'],
      main: ['Bump and run', 'Landingsområde', 'Klubbvalg'],
      cooldown: ['Up and down challenge'],
    },
    objectives: 'Lære grunnleggende chipping-teknikk',
    structure: '10min oppvarming, 40min teknikk, 10min challenge',
    successCriteria: 'Konsistent kontakt og retning',
  },
  {
    name: 'Pitch Introduksjon',
    description: 'Grunnleggende pitch-slag',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 75,
    primaryDomain: 'INN50', // Short approach/pitch (30-50m)
    exerciseSequence: {
      warmup: ['Wedge tempo'],
      main: ['30m pitch', '50m pitch', 'Trajectory kontroll'],
      cooldown: ['Måltrening'],
    },
    objectives: 'Utvikle grunnleggende pitch-teknikk',
    structure: '10min oppvarming, 55min hovedøvelser, 10min mål',
    successCriteria: 'Konsistent avstand med wedge',
  },
  {
    name: 'Bunker Grunnkurs',
    description: 'Introduksjon til bunker-slag',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S3',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 60,
    primaryDomain: 'ARG', // Around the green (bunker)
    exerciseSequence: {
      warmup: ['Sandkontakt uten ball'],
      main: ['Splash teknikk', 'Setup i sand', 'Ut av bunker'],
      cooldown: ['Up and down fra bunker'],
    },
    objectives: 'Lære grunnleggende bunker-teknikk',
    structure: '10min oppvarming, 40min teknikk, 10min challenge',
    successCriteria: 'Ut av bunker med første slag',
  },
  {
    name: 'Hybridkølle Introduksjon',
    description: 'Lære å bruke hybrid effektivt',
    sessionType: 'technical',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 60,
    primaryDomain: 'INN150', // Long approach (hybrid 150-200m)
    exerciseSequence: {
      warmup: ['Mobilitet'],
      main: ['Setup for hybrid', 'Sweep vs hit', 'Avstandskontroll'],
      cooldown: ['Måltrening'],
    },
    objectives: 'Forstå hybrid-teknikk og bruksområde',
    structure: '10min oppvarming, 40min teknikk, 10min mål',
    successCriteria: 'Konsistent kontakt fra fairway og rough',
  },

  // E-Period Physical Sessions (8)
  {
    name: 'Golf Mobilitet Grunnkurs',
    description: 'Grunnleggende mobilitet for golf',
    sessionType: 'physical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 45,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Lett kardio'],
      main: ['Hofte-mobilitet', 'Thoracic rotasjon', 'Skulder-mobilitet'],
      cooldown: ['Statisk tøying'],
    },
    objectives: 'Etablere grunnleggende bevegelighet for golf',
    structure: '5min oppvarming, 35min mobilitet, 5min tøying',
    successCriteria: 'Full range of motion i nøkkelområder',
  },
  {
    name: 'Core Stabilitet Basis',
    description: 'Grunnleggende core-trening for golf',
    sessionType: 'physical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 45,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Aktivering'],
      main: ['Planke varianter', 'Bird dog', 'Dead bug', 'Pallof press'],
      cooldown: ['Tøying'],
    },
    objectives: 'Utvikle grunnleggende core-stabilitet',
    structure: '5min aktivering, 35min styrke, 5min tøying',
    successCriteria: 'Hold planke 60 sekunder med god form',
  },
  {
    name: 'Balanse og Koordinasjon',
    description: 'Grunnleggende balanse for golf-sving',
    sessionType: 'physical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 40,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Dynamisk oppvarming'],
      main: ['Ett-bens stå', 'Bosu-øvelser', 'Sving på ett ben'],
      cooldown: ['Rolig avspenning'],
    },
    objectives: 'Forbedre balanse gjennom svingen',
    structure: '5min oppvarming, 30min balanse, 5min nedkjøling',
    successCriteria: 'Stabil sving på balansebrett',
  },
  {
    name: 'Styrke Grunnkurs Overkropp',
    description: 'Grunnleggende styrketrening for overkropp',
    sessionType: 'physical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 50,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Armsvinger', 'Skulder-aktivering'],
      main: ['Push-ups', 'Rows', 'Shoulder press', 'Rotasjon med band'],
      cooldown: ['Tøying overkropp'],
    },
    objectives: 'Bygge grunnleggende overkroppsstyrke',
    structure: '10min oppvarming, 35min styrke, 5min tøying',
    successCriteria: '10 push-ups med god form',
  },
  {
    name: 'Styrke Grunnkurs Underkropp',
    description: 'Grunnleggende styrketrening for underkropp',
    sessionType: 'physical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 50,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Hofte-sirkling', 'Luftsquats'],
      main: ['Goblet squat', 'Lunges', 'Hip thrust', 'Calf raises'],
      cooldown: ['Tøying underkropp'],
    },
    objectives: 'Bygge grunnleggende underkroppsstyrke',
    structure: '10min oppvarming, 35min styrke, 5min tøying',
    successCriteria: '15 squats med god dybde og teknikk',
  },
  {
    name: 'Rotasjonskraft Introduksjon',
    description: 'Grunnleggende rotasjonsstyrke for golf',
    sessionType: 'physical',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 45,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Rotasjons-mobilitet'],
      main: ['Medicine ball rotasjon', 'Cable woodchop', 'Russian twist'],
      cooldown: ['Rotasjons-tøying'],
    },
    objectives: 'Utvikle grunnleggende rotasjonskraft',
    structure: '10min oppvarming, 30min rotasjon, 5min tøying',
    successCriteria: 'Kontrollert kraft gjennom rotasjon',
  },
  {
    name: 'Kondisjon Basis',
    description: 'Grunnleggende utholdenhet for golf',
    sessionType: 'physical',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 45,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Lett jogg'],
      main: ['Intervall gange/jogg', '18-hulls simulering'],
      cooldown: ['Nedkjøling og tøying'],
    },
    objectives: 'Bygge utholdenhet for 18 hull',
    structure: '5min oppvarming, 35min kondisjon, 5min nedkjøling',
    successCriteria: '45 min aktivitet uten utmattelse',
  },
  {
    name: 'Restitusjon og Recovery',
    description: 'Grunnleggende recovery-teknikker',
    sessionType: 'recovery',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 40,
    primaryDomain: 'PHYS', // Physical training (recovery)
    exerciseSequence: {
      warmup: ['Lett bevegelse'],
      main: ['Foam rolling', 'Statisk tøying', 'Pusteteknikker'],
      cooldown: ['Avspenning'],
    },
    objectives: 'Lære restitusjon og recovery-teknikker',
    structure: '5min bevegelse, 30min recovery, 5min avspenning',
    successCriteria: 'Forståelse for recovery-protokoll',
  },

  // E-Period Mental Sessions (7) - Mental sessions don't map to golf domains
  {
    name: 'Mental Golf Introduksjon',
    description: 'Grunnleggende mental trening for golf',
    sessionType: 'mental',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 45,
    primaryDomain: null, // Mental training - no golf domain
    exerciseSequence: {
      warmup: ['Pusteøvelser'],
      main: ['Fokus-trening', 'Visualisering intro', 'Målsetting'],
      cooldown: ['Refleksjon'],
    },
    objectives: 'Introdusere mentale ferdigheter for golf',
    structure: '10min pust, 30min mental trening, 5min refleksjon',
    successCriteria: 'Forståelse for mental forberedelse',
  },
  {
    name: 'Pre-shot Rutine Utvikling',
    description: 'Etablere personlig pre-shot rutine',
    sessionType: 'mental',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 60,
    primaryDomain: null, // Mental training
    exerciseSequence: {
      warmup: ['Fokus-aktivering'],
      main: ['Rutine-elementer', 'Timing', 'Konsistens-trening'],
      cooldown: ['Rutine-gjennomgang'],
    },
    objectives: 'Utvikle konsistent pre-shot rutine',
    structure: '10min fokus, 45min rutine-utvikling, 5min oppsummering',
    successCriteria: 'Konsistent rutine under 30 sekunder',
  },
  {
    name: 'Visualisering Grunnkurs',
    description: 'Lære visualiseringsteknikker',
    sessionType: 'mental',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 40,
    primaryDomain: null, // Mental training
    exerciseSequence: {
      warmup: ['Avspenning'],
      main: ['Slag-visualisering', 'Bane-visualisering', 'Suksess-bilder'],
      cooldown: ['Rolig avslutning'],
    },
    objectives: 'Utvikle evne til mental visualisering',
    structure: '10min avspenning, 25min visualisering, 5min avslutning',
    successCriteria: 'Tydelig mentalt bilde av slag og resultat',
  },
  {
    name: 'Fokus og Konsentrasjon',
    description: 'Grunnleggende fokus-trening',
    sessionType: 'mental',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 45,
    primaryDomain: null, // Mental training
    exerciseSequence: {
      warmup: ['Pusteøvelser'],
      main: ['Smal fokus øvelser', 'Bred fokus øvelser', 'Fokus-skift'],
      cooldown: ['Refleksjon'],
    },
    objectives: 'Utvikle evne til å styre fokus',
    structure: '10min pust, 30min fokus-trening, 5min refleksjon',
    successCriteria: 'Kan holde fokus gjennom hel øvelse',
  },
  {
    name: 'Målsetting for Golf',
    description: 'SMART målsetting for utvikling',
    sessionType: 'mental',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 45,
    primaryDomain: null, // Mental training
    exerciseSequence: {
      warmup: ['Refleksjon over nåværende nivå'],
      main: ['SMART-mål', 'Prosessmål', 'Resultatmål', 'Handlingsplan'],
      cooldown: ['Mål-oppsummering'],
    },
    objectives: 'Sette effektive mål for golf-utvikling',
    structure: '10min refleksjon, 30min målsetting, 5min oppsummering',
    successCriteria: 'Klare SMART-mål definert',
  },
  {
    name: 'Positiv Selvsnakk',
    description: 'Utvikle konstruktiv indre dialog',
    sessionType: 'mental',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 40,
    primaryDomain: null, // Mental training
    exerciseSequence: {
      warmup: ['Bevisstgjøring'],
      main: ['Identifisere negativt snakk', 'Erstatte med positivt', 'Øve fraser'],
      cooldown: ['Affirmsjoner'],
    },
    objectives: 'Utvikle positiv og støttende selvsnakk',
    structure: '5min bevisstgjøring, 30min øvelser, 5min affirmsjoner',
    successCriteria: 'Bevisst bruk av positive fraser',
  },
  {
    name: 'Stressmestring Introduksjon',
    description: 'Grunnleggende stressmestring',
    sessionType: 'mental',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    periods: ['E'],
    duration: 45,
    primaryDomain: null, // Mental training
    exerciseSequence: {
      warmup: ['Kroppsscan'],
      main: ['Identifisere stressorer', 'Pusteteknikker', 'Progressiv avspenning'],
      cooldown: ['Rolig avslutning'],
    },
    objectives: 'Lære grunnleggende stressmestringsteknikker',
    structure: '10min scan, 30min teknikker, 5min avslutning',
    successCriteria: 'Kan bruke pusteteknikk for å roe ned',
  },
  {
    name: 'Physical Foundation Building',
    description: 'General physical conditioning and movement literacy',
    sessionType: 'physical',
    learningPhase: 'L1',
    setting: 'S2',
    clubSpeed: 'CS90',
    categories: ['PH'],
    periods: ['E'],
    duration: 60,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Dynamic stretching', 'Light cardio'],
      main: ['Core stability', 'Hip mobility', 'Rotational exercises'],
      cooldown: ['Static stretching'],
    },
    objectives: 'Build foundational strength and mobility for golf movements',
    structure: '10min warmup, 40min conditioning, 10min cooldown',
    successCriteria: 'Improved mobility scores and core stability',
  },
  {
    name: 'Introduction to Mental Game',
    description: 'Basic mental skills and focus training',
    sessionType: 'mental',
    learningPhase: 'L1',
    setting: 'S1',
    clubSpeed: 'CS90',
    categories: ['ME'],
    periods: ['E'],
    duration: 45,
    primaryDomain: null, // Mental training
    exerciseSequence: {
      warmup: ['Breathing exercises'],
      main: ['Focus drills', 'Visualization basics', 'Pre-shot routine development'],
      cooldown: ['Reflection'],
    },
    objectives: 'Introduce basic mental skills for golf performance',
    structure: '5min breathing, 35min mental skills, 5min reflection',
    successCriteria: 'Player can execute consistent pre-shot routine',
  },

  // ============================================
  // G PERIOD (Generell - General)
  // ============================================
  {
    name: 'Ball Striking Development',
    description: 'General ball striking skills across all clubs',
    sessionType: 'technical',
    learningPhase: 'L2',
    setting: 'S4',
    clubSpeed: 'CS90',
    categories: ['TE', 'GS'],
    periods: ['G'],
    duration: 120,
    primaryDomain: 'INN100', // General iron work
    exerciseSequence: {
      warmup: ['Wedge tempo swings', 'Alignment check'],
      main: ['Iron contact drills', 'Driver path work', 'Distance control'],
      cooldown: ['Target practice'],
    },
    objectives: 'Develop consistent ball striking across different clubs',
    structure: '15min warmup, 90min practice, 15min target work',
    successCriteria: 'Improved strike quality metrics on trackman',
  },
  {
    name: 'Short Game Fundamentals',
    description: 'Chipping, pitching, and bunker basics',
    sessionType: 'technical',
    learningPhase: 'L2',
    setting: 'S5',
    clubSpeed: 'CS90',
    categories: ['GS'],
    periods: ['G'],
    duration: 90,
    primaryDomain: 'ARG', // Around the green
    exerciseSequence: {
      warmup: ['Putting stroke', 'Chip feel drills'],
      main: ['Distance control pitching', 'Trajectory variations', 'Bunker technique'],
      cooldown: ['Up-and-down challenge'],
    },
    objectives: 'Master fundamental short game techniques',
    structure: '10min warmup, 70min skill work, 10min challenge',
    successCriteria: '70% up-and-down rate from 20 yards',
  },
  {
    name: 'Golf-Specific Conditioning',
    description: 'Sport-specific physical training',
    sessionType: 'physical',
    learningPhase: 'L3',
    setting: 'S3',
    clubSpeed: 'CS90',
    categories: ['PH'],
    periods: ['G'],
    duration: 75,
    primaryDomain: 'PHYS', // Physical training
    exerciseSequence: {
      warmup: ['Golf-specific movements', 'Dynamic stretching'],
      main: ['Rotational power', 'Club speed training', 'Stability work'],
      cooldown: ['Recovery stretching'],
    },
    objectives: 'Increase golf-specific power and club speed',
    structure: '15min warmup, 50min power work, 10min cooldown',
    successCriteria: '3-5% increase in club speed measurements',
  },

  // ============================================
  // S PERIOD (Spesifikk - Specific)
  // ============================================
  {
    name: 'Course Management Strategy',
    description: 'Strategic decision making and shot selection',
    sessionType: 'tactical',
    learningPhase: 'L4',
    setting: 'S7',
    clubSpeed: 'CS90',
    categories: ['PL', 'CO'],
    periods: ['S'],
    duration: 120,
    primaryDomain: null, // Tactical - no specific domain
    exerciseSequence: {
      warmup: ['Target awareness drills'],
      main: ['Simulated holes', 'Risk-reward scenarios', 'Strategy mapping'],
      cooldown: ['Course strategy review'],
    },
    objectives: 'Develop course management and strategic thinking skills',
    structure: '10min warmup, 100min simulation, 10min debrief',
    successCriteria: 'Optimal shot selection in 80% of scenarios',
  },
  {
    name: 'Pressure Performance Training',
    description: 'Competition-specific mental and technical skills',
    sessionType: 'mental',
    learningPhase: 'L4',
    setting: 'S8',
    clubSpeed: 'CS90',
    categories: ['ME', 'CO'],
    periods: ['S'],
    duration: 90,
    primaryDomain: null, // Mental training
    exerciseSequence: {
      warmup: ['Performance breathing', 'Visualization'],
      main: ['Pressure putting', 'Consequences drills', 'Competition simulation'],
      cooldown: ['Performance review'],
    },
    objectives: 'Build mental resilience under competitive pressure',
    structure: '10min mental prep, 70min pressure drills, 10min review',
    successCriteria: 'Maintain performance quality under pressure conditions',
  },
  {
    name: 'Breaking Point Focus Session',
    description: 'Targeted work on individual weaknesses',
    sessionType: 'technical',
    learningPhase: 'L3',
    setting: 'S6',
    clubSpeed: 'CS90',
    categories: ['TE', 'GS'],
    periods: ['S'],
    duration: 105,
    primaryDomain: null, // Dynamic - depends on player's breaking points
    exerciseSequence: {
      warmup: ['Movement preparation'],
      main: ['Specific club work', 'Weakness drills', 'Progress measurement'],
      cooldown: ['Transfer practice'],
    },
    objectives: 'Address specific breaking points identified in assessment',
    structure: '15min prep, 80min focused practice, 10min transfer',
    successCriteria: 'Measurable improvement in targeted metrics',
  },

  // ============================================
  // T PERIOD (Turnering - Tournament)
  // ============================================
  {
    name: 'Tournament Preparation',
    description: 'Final tune-up before competition',
    sessionType: 'tactical',
    learningPhase: 'L5',
    setting: 'S9',
    clubSpeed: 'CS90',
    categories: ['CO', 'PL'],
    periods: ['T'],
    duration: 60,
    primaryDomain: null, // Tournament prep - mixed domains
    exerciseSequence: {
      warmup: ['Range routine', 'Feel checks'],
      main: ['Confidence builders', 'Key shots practice', 'Mental rehearsal'],
      cooldown: ['Positive imagery'],
    },
    objectives: 'Build confidence and maintain sharpness for competition',
    structure: '10min routine, 40min key shots, 10min mental prep',
    successCriteria: 'Feeling confident and ready to compete',
  },
  {
    name: 'Competition Day Warmup',
    description: 'Pre-tournament activation routine',
    sessionType: 'technical',
    learningPhase: 'L5',
    setting: 'S10',
    clubSpeed: 'CS90',
    categories: ['CO'],
    periods: ['T'],
    duration: 45,
    primaryDomain: null, // Warmup - all domains briefly
    exerciseSequence: {
      warmup: ['Physical activation', 'Putting feel'],
      main: ['Swing check', 'Distance calibration', 'Mental centering'],
      cooldown: ['Final focus'],
    },
    objectives: 'Optimal physical and mental preparation for competition',
    structure: '10min activation, 30min calibration, 5min centering',
    successCriteria: 'Ready to perform at optimal level',
  },
  {
    name: 'Recovery and Reflection',
    description: 'Post-competition recovery and analysis',
    sessionType: 'recovery',
    learningPhase: 'L4',
    setting: 'S8',
    clubSpeed: 'CS90',
    categories: ['PH', 'ME'],
    periods: ['T'],
    duration: 60,
    primaryDomain: 'PHYS', // Recovery is physical
    exerciseSequence: {
      warmup: ['Light movement'],
      main: ['Active recovery', 'Performance review', 'Lessons learned'],
      cooldown: ['Relaxation'],
    },
    objectives: 'Physical recovery and performance analysis',
    structure: '10min movement, 40min recovery/review, 10min relaxation',
    successCriteria: 'Ready for next training cycle with clear learnings',
  },

  // ============================================
  // Multi-Period Templates (E+G, G+S, S+T)
  // ============================================
  {
    name: 'Transition: Skill Integration',
    description: 'Bridging fundamental to general skills',
    sessionType: 'technical',
    learningPhase: 'L2',
    setting: 'S3',
    clubSpeed: 'CS90',
    categories: ['TE', 'GS'],
    periods: ['E', 'G'],
    duration: 90,
    primaryDomain: null, // Transition - mixed skills
    exerciseSequence: {
      warmup: ['Movement review'],
      main: ['Skill progression', 'Integration drills', 'Transfer practice'],
      cooldown: ['Review and planning'],
    },
    objectives: 'Integrate fundamental skills into golf-specific movements',
    structure: '10min review, 70min integration, 10min planning',
    successCriteria: 'Smooth execution of integrated skills',
  },
  {
    name: 'Transition: Competition Preparation',
    description: 'Moving from specific skills to competition readiness',
    sessionType: 'tactical',
    learningPhase: 'L4',
    setting: 'S8',
    clubSpeed: 'CS90',
    categories: ['CO', 'PL'],
    periods: ['S', 'T'],
    duration: 90,
    primaryDomain: null, // Tactical - mixed preparation
    exerciseSequence: {
      warmup: ['Mental preparation'],
      main: ['Pre-tournament practice', 'Strategy refinement', 'Confidence building'],
      cooldown: ['Mental rehearsal'],
    },
    objectives: 'Prepare mentally and strategically for upcoming competition',
    structure: '15min mental prep, 60min practice, 15min rehearsal',
    successCriteria: 'Confident and strategically prepared',
  },
];

export async function seedSessionTemplates() {
  console.log('📋 Seeding session templates...');

  // Get the test tenant (or first tenant if test doesn't exist)
  let tenant = await prisma.tenant.findFirst({
    where: { name: 'Test Golf Academy' },
  });

  if (!tenant) {
    tenant = await prisma.tenant.findFirst();
  }

  if (!tenant) {
    console.log('   ⚠️  No tenant found, skipping session template seed');
    return;
  }

  // Check if templates already exist
  const existingCount = await prisma.sessionTemplate.count({
    where: { tenantId: tenant.id },
  });

  if (existingCount > 0) {
    console.log(`   ⚠️  Found ${existingCount} existing templates, skipping seed`);
    return;
  }

  // Create all session templates
  let created = 0;
  for (const template of sessionTemplates) {
    await prisma.sessionTemplate.create({
      data: {
        ...template,
        tenantId: tenant.id,
        exerciseSequence: template.exerciseSequence as any,
      },
    });
    created++;
  }

  console.log(`   ✅ Created ${created} session templates across all periods (E, G, S, T)`);
}
