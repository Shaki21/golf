/**
 * Årsplan Eksempel
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { PageTitle, SectionTitle, SubSectionTitle } from '../typography';

// Design token values (hex for inline styles)
const tokenColors = {
  gray600: '#4B5563',
  gray400: '#9CA3AF',
  gray300: '#D1D5DB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
  info: '#2C5F7F',
  primaryLight: '#5B9A6F',
  success: '#4A7C59',
  warning: '#D4A84B',
  error: '#C45B4E',
};

const AarsplanGolf = () => {
  const [activeMonth, setActiveMonth] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  
  // Player profile example
  const playerProfile = {
    name: "Spillereksempel",
    level: "B-nivÃ¥",
    age: 16,
    hcp: 4.2,
    targetScore: 74,
    club: "Miklagard GK"
  };
  
  // Annual plan data structure
  const yearPlan = [
    // Evaluering/Plan period (Oct - early Nov)
    { 
      month: "Oktober", 
      weeks: [40, 41, 42, 43],
      period: "E",
      periodName: "Evaluering",
      focus: {
        konkurranse: 0,
        spill: 1,
        golfslag: 2,
        teknikk: 3,
        fysisk: 2
      },
      location: "H",
      activities: ["Sesongevaluering", "Fysiske tester", "TrackMan-analyse", "IUP-planlegging"],
      learningPhase: "L3-L4",
      clubSpeed: "CS60-80",
      setting: "S2-S4",
      color: tokenColors.gray600
    },
    { 
      month: "November", 
      weeks: [44, 45, 46, 47, 48],
      period: "G",
      periodName: "Grunnperiode",
      focus: {
        konkurranse: 0,
        spill: 1,
        golfslag: 2,
        teknikk: 3,
        fysisk: 3
      },
      location: "H",
      activities: ["Teknikk-bygging", "Styrketrening", "Simulator-trening", "Indre dialog"],
      learningPhase: "L1-L3",
      clubSpeed: "CS40-70",
      setting: "S1-S3",
      color: tokenColors.info
    },
    { 
      month: "Desember", 
      weeks: [49, 50, 51, 52],
      period: "G",
      periodName: "Grunnperiode",
      focus: {
        konkurranse: 0,
        spill: 1,
        golfslag: 2,
        teknikk: 3,
        fysisk: 3
      },
      location: "H/SI",
      activities: ["Teknikk-fokus", "Fysisk base", "Mental trening", "Vintersamling utland"],
      learningPhase: "L1-L3",
      clubSpeed: "CS50-80",
      setting: "S1-S4",
      color: tokenColors.info
    },
    { 
      month: "Januar", 
      weeks: [1, 2, 3, 4],
      period: "G",
      periodName: "Grunnperiode",
      focus: {
        konkurranse: 0,
        spill: 1,
        golfslag: 3,
        teknikk: 3,
        fysisk: 3
      },
      location: "H",
      activities: ["Teknikk-integrasjon", "Styrke-utholdenhet", "Putting-drill", "Visualisering"],
      learningPhase: "L2-L4",
      clubSpeed: "CS60-90",
      setting: "S2-S5",
      color: tokenColors.info
    },
    { 
      month: "Februar", 
      weeks: [5, 6, 7, 8],
      period: "S",
      periodName: "Spesialperiode",
      focus: {
        konkurranse: 1,
        spill: 2,
        golfslag: 3,
        teknikk: 2,
        fysisk: 2
      },
      location: "H/SI",
      activities: ["Spesifikk trening", "ScoringsmÃ¥l", "Treningssamling", "Spenningsregulering"],
      learningPhase: "L3-L5",
      clubSpeed: "CS70-100",
      setting: "S4-S7",
      color: tokenColors.primaryLight
    },
    { 
      month: "Mars", 
      weeks: [9, 10, 11, 12, 13],
      period: "S",
      periodName: "Spesialperiode",
      focus: {
        konkurranse: 1,
        spill: 3,
        golfslag: 3,
        teknikk: 2,
        fysisk: 2
      },
      location: "H/SI",
      activities: ["Konkurranseforberedelse", "Banespill utland", "Strategitrening", "Rutinebygging"],
      learningPhase: "L4-L5",
      clubSpeed: "CS80-100",
      setting: "S5-S8",
      color: tokenColors.primaryLight
    },
    { 
      month: "April", 
      weeks: [14, 15, 16, 17],
      period: "S",
      periodName: "Spesialperiode",
      focus: {
        konkurranse: 2,
        spill: 3,
        golfslag: 2,
        teknikk: 2,
        fysisk: 1
      },
      location: "H/TN",
      activities: ["Sesongoppstart", "FÃ¸rste turneringer", "Banestrategi", "Fokus-trening"],
      learningPhase: "L4-L5",
      clubSpeed: "CS90-100",
      setting: "S6-S9",
      color: tokenColors.primaryLight
    },
    { 
      month: "Mai", 
      weeks: [18, 19, 20, 21, 22],
      period: "T",
      periodName: "Turneringsperiode",
      focus: {
        konkurranse: 3,
        spill: 3,
        golfslag: 2,
        teknikk: 1,
        fysisk: 1
      },
      location: "TN/H",
      activities: ["Olyo Tour start", "Klubbmesterskap", "Vedlikeholdstrening", "Resultatfokus"],
      learningPhase: "L5",
      clubSpeed: "CS100",
      setting: "S8-S10",
      color: tokenColors.success
    },
    { 
      month: "Juni", 
      weeks: [23, 24, 25, 26],
      period: "T",
      periodName: "Turneringsperiode",
      focus: {
        konkurranse: 3,
        spill: 3,
        golfslag: 2,
        teknikk: 1,
        fysisk: 1
      },
      location: "TN/TI",
      activities: ["Hovedturneringer", "Regionsmesterskap", "Kortspill-vedlikehold", "Mental styrke"],
      learningPhase: "L5",
      clubSpeed: "CS100",
      setting: "S9-S10",
      color: tokenColors.success
    },
    { 
      month: "Juli", 
      weeks: [27, 28, 29, 30, 31],
      period: "T",
      periodName: "Turneringsperiode",
      focus: {
        konkurranse: 3,
        spill: 3,
        golfslag: 2,
        teknikk: 1,
        fysisk: 1
      },
      location: "TN/TI",
      activities: ["NM", "Skandinavisk turnering", "Toppform", "Prestasjonsfokus"],
      learningPhase: "L5",
      clubSpeed: "CS100",
      setting: "S10",
      color: tokenColors.success
    },
    { 
      month: "August", 
      weeks: [32, 33, 34, 35],
      period: "T",
      periodName: "Turneringsperiode",
      focus: {
        konkurranse: 3,
        spill: 3,
        golfslag: 2,
        teknikk: 1,
        fysisk: 1
      },
      location: "TN/TI",
      activities: ["Avsluttende turneringer", "Junior Tour finale", "Sesongavslutning", "Evaluering"],
      learningPhase: "L5",
      clubSpeed: "CS100",
      setting: "S9-S10",
      color: tokenColors.success
    },
    { 
      month: "September", 
      weeks: [36, 37, 38, 39],
      period: "E",
      periodName: "Evaluering",
      focus: {
        konkurranse: 1,
        spill: 2,
        golfslag: 2,
        teknikk: 2,
        fysisk: 2
      },
      location: "H",
      activities: ["Sesongevaluering", "Avsluttende turneringer", "Restitusjon", "Planlegging neste Ã¥r"],
      learningPhase: "L4-L5",
      clubSpeed: "CS80-100",
      setting: "S5-S8",
      color: tokenColors.gray600
    }
  ];
  
  const priorityLabels = {
    3: { label: "Utvikle", color: tokenColors.success, bg: 'rgba(5, 150, 105, 0.12)' },
    2: { label: "Beholde", color: tokenColors.warning, bg: 'rgba(217, 119, 6, 0.12)' },
    1: { label: "Vedlikehold", color: tokenColors.gray600, bg: tokenColors.gray100 },
    0: { label: "Pause", color: tokenColors.gray400, bg: tokenColors.gray50 }
  };
  
  const periodColors = {
    E: { name: "Evaluering/Plan", color: tokenColors.gray600, bg: tokenColors.gray100 },
    G: { name: "Grunnperiode", color: tokenColors.info, bg: 'rgba(2, 132, 199, 0.12)' },
    S: { name: "Spesialperiode", color: tokenColors.primaryLight, bg: 'rgba(42, 107, 85, 0.12)' },
    T: { name: "Turneringsperiode", color: tokenColors.success, bg: 'rgba(5, 150, 105, 0.12)' }
  };
  
  const locationLabels = {
    H: "Hjemme (VGS/klubb)",
    TN: "Turnering Norge",
    SN: "Samling Norge",
    TI: "Turnering Internasjonalt",
    SI: "Samling Internasjonalt"
  };

  const FocusBar = ({ value, maxValue = 3 }) => (
    <div className="flex gap-0.5">
      {[...Array(maxValue)].map((_, i) => (
        <div
          key={i}
          className="h-3 w-3 rounded-sm transition-all duration-300"
          style={{
            backgroundColor: i < value ? priorityLabels[value]?.color || tokenColors.gray400 : tokenColors.gray300
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 p-6 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }
        
        .period-badge {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .timeline-connector {
          background: linear-gradient(90deg, transparent, ${tokenColors.success}, transparent);
        }
      `}</style>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">â›³</span>
                </div>
                <div>
                  <PageTitle className="font-display text-3xl font-bold text-slate-800">Ã…rsplan Golf</PageTitle>
                  <p className="font-body text-slate-500 text-sm">Individuell Utviklingsplan 2026</p>
                </div>
              </div>
            </div>
            
            {/* Player Profile Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                  <span className="text-2xl">ðŸ‘¤</span>
                </div>
                <div>
                  <SubSectionTitle className="font-body font-semibold text-lg">{playerProfile.name}</SubSectionTitle>
                  <div className="flex gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {playerProfile.level}
                    </span>
                    <span>{playerProfile.age} Ã¥r</span>
                    <span>HCP {playerProfile.hcp}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-sm">
                <span className="text-slate-400">MÃ¥lscore</span>
                <span className="font-semibold text-emerald-400">{playerProfile.targetScore}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-4">
              <span className="font-body text-xs text-slate-500 uppercase tracking-wide">Perioder:</span>
              {Object.entries(periodColors).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: val.color }}></div>
                  <span className="font-body text-sm text-slate-600">{val.name}</span>
                </div>
              ))}
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-4">
              <span className="font-body text-xs text-slate-500 uppercase tracking-wide">Prioritet:</span>
              {[3, 2, 1].map(p => (
                <div key={p} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: priorityLabels[p].color }}></div>
                  <span className="font-body text-sm text-slate-600">{priorityLabels[p].label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Annual Timeline */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {yearPlan.map((month, idx) => (
            <div
              key={month.month}
              className="card-hover bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden cursor-pointer"
              onClick={() => setSelectedPeriod(selectedPeriod === idx ? null : idx)}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Month Header */}
              <div 
                className="p-4 border-b"
                style={{ 
                  background: `linear-gradient(135deg, ${month.color}15, ${month.color}05)`,
                  borderColor: `${month.color}20`
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <SubSectionTitle className="font-display text-xl font-semibold text-slate-800">{month.month}</SubSectionTitle>
                    <p className="font-body text-xs text-slate-500">Uke {month.weeks[0]}-{month.weeks[month.weeks.length-1]}</p>
                  </div>
                  <div 
                    className="px-3 py-1.5 rounded-lg font-body text-sm font-medium"
                    style={{ 
                      backgroundColor: periodColors[month.period].bg,
                      color: periodColors[month.period].color
                    }}
                  >
                    {month.periodName}
                  </div>
                </div>
              </div>
              
              {/* Focus Areas */}
              <div className="p-4">
                <div className="space-y-2">
                  {[
                    { key: 'konkurranse', label: 'Konkurranse', icon: 'ðŸ†' },
                    { key: 'spill', label: 'Spill', icon: 'â›³' },
                    { key: 'golfslag', label: 'Golfslag', icon: 'ðŸŽ¯' },
                    { key: 'teknikk', label: 'Teknikk', icon: 'âš™ï¸' },
                    { key: 'fysisk', label: 'Fysisk', icon: 'ðŸ’ª' }
                  ].map(area => (
                    <div key={area.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{area.icon}</span>
                        <span className="font-body text-sm text-slate-600">{area.label}</span>
                      </div>
                      <FocusBar value={month.focus[area.key]} />
                    </div>
                  ))}
                </div>
                
                {/* TIER Golf Parameters */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="font-body text-xs text-slate-400">LÃ¦ringsfase</p>
                      <p className="font-body text-sm font-semibold text-slate-700">{month.learningPhase}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="font-body text-xs text-slate-400">Clubspeed</p>
                      <p className="font-body text-sm font-semibold text-slate-700">{month.clubSpeed}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="font-body text-xs text-slate-400">Setting</p>
                      <p className="font-body text-sm font-semibold text-slate-700">{month.setting}</p>
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-slate-400">ðŸ“</span>
                  <span className="font-body text-xs text-slate-500">
                    {month.location.split('/').map(loc => locationLabels[loc] || loc).join(' / ')}
                  </span>
                </div>
                
                {/* Expanded Activities */}
                {selectedPeriod === idx && (
                  <div className="mt-4 pt-3 border-t border-slate-100 period-badge">
                    <p className="font-body text-xs text-slate-500 uppercase tracking-wide mb-2">Aktiviteter</p>
                    <div className="space-y-1">
                      {month.activities.map((activity, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: month.color }}></div>
                          <span className="font-body text-sm text-slate-600">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Five Process Summary */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6">
          <SectionTitle className="font-display text-2xl font-bold text-slate-800 mb-6 text-center">
            Fem-prosess Ã…rsoversikt
          </SectionTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { name: 'Teknisk', icon: 'âš™ï¸', color: tokenColors.info, desc: 'Sving, slag, teknikk' },
              { name: 'Fysisk', icon: 'ðŸ’ª', color: tokenColors.success, desc: 'Styrke, utholdenhet, mobilitet' },
              { name: 'Mental', icon: 'ðŸ§ ', color: tokenColors.primaryLight, desc: 'Fokus, visualisering, rutiner' },
              { name: 'Strategisk', icon: 'ðŸŽ¯', color: tokenColors.warning, desc: 'Banestrategi, beslutninger' },
              { name: 'Sosial', icon: 'ðŸ‘¥', color: tokenColors.error, desc: 'Team, kommunikasjon, nettverk' }
            ].map(process => (
              <div 
                key={process.name}
                className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 text-center"
              >
                <div 
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${process.color}15` }}
                >
                  {process.icon}
                </div>
                <SubSectionTitle className="font-body font-semibold text-slate-800">{process.name}</SubSectionTitle>
                <p className="font-body text-xs text-slate-500 mt-1">{process.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-6 text-center">
        <p className="font-body text-sm text-slate-400">
          TIER Golf Ã— Team Norway Golf â€” Individuell Utviklingsplan
        </p>
      </div>
    </div>
  );
};

export default AarsplanGolf;
