/**
 * Kategori System Oversikt
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../typography';

// Design token values (hex for inline styles)
const tokenColors = {
  success: '#4A7C59',
  warning: '#D4A84B',
  error: '#C45B4E',
  forest: '#10456A',
  primaryLight: '#2C5F7F',
  gold: 'rgb(var(--tier-gold))',
};

// Session type colors (Blue Palette 01)
const sessionTypeColors = {
  teknikk: '#2C5F7F',
  golfslag: '#4A7C59',
  spill: '#10456A',
  fysisk: '#D4A84B',
  funksjonell: '#8E8E93',
};

const KategoriSystemOversikt = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [hoveredArea, setHoveredArea] = useState(null);

  const systemComponents = [
    { 
      id: 'learning', 
      name: 'LÃ¦ringsfaser', 
      ak: 'L1-L5: Kropp â†’ Automatikk', 
      tn: 'Teknisk utvikling',
      color: tokenColors.success
    },
    { 
      id: 'speed', 
      name: 'Clubspeed', 
      ak: 'CS20-CS100: Tempo kontroll', 
      tn: 'Intensitetsstyring',
      color: sessionTypeColors.golfslag
    },
    { 
      id: 'setting', 
      name: 'Setting', 
      ak: 'S1-S10: MiljÃ¸ kompleksitet', 
      tn: '5 prosesser miljÃ¸',
      color: tokenColors.warning
    },
    { 
      id: 'areas', 
      name: 'Golf omrÃ¥der', 
      ak: '17 spesifikke omrÃ¥der', 
      tn: 'Golfslag kategorier',
      color: sessionTypeColors.teknikk
    },
    { 
      id: 'training', 
      name: 'Treningstyper', 
      ak: 'T, TG, TGS, S, G, Fs, Fu, K', 
      tn: 'TreningsÃ¸kt variasjon',
      color: tokenColors.error
    },
    { 
      id: 'testing', 
      name: 'Testing', 
      ak: 'Progresjonstest + Bruddpunkt', 
      tn: 'TN testsystem',
      color: tokenColors.forest
    }
  ];

  const learningPhases = [
    { phase: 'L1', name: 'Kropp', description: 'Kun kroppen', focus: 'Hofter, bryst, balanse', progress: 20 },
    { phase: 'L2', name: 'Kropp + Armer', description: 'Rytme og timing', focus: 'Koordinert bevegelse', progress: 40 },
    { phase: 'L3', name: 'KÃ¸lle uten Ball', description: 'Full sving bevegelse', focus: 'Konsistent sving', progress: 60 },
    { phase: 'L4', name: 'KÃ¸lle + Ball', description: 'Kontrollert ballkontakt', focus: 'Konsistent treff', progress: 80 },
    { phase: 'L5', name: 'Automatikk', description: 'Natural fÃ¸lelse', focus: 'Prestasjon under press', progress: 100 }
  ];

  const golfAreas = [
    { name: 'Tee Total', distance: 'Driver/3W', tn: 'Utslag', type: 'T, TG', color: sessionTypeColors.fysisk },
    { name: 'Innspill 200+m', distance: 'Lange jern', tn: 'Inspill lang', type: 'T, TG', color: tokenColors.warning },
    { name: 'Innspill 150-200m', distance: 'Mellom jern', tn: 'Inspill medium', type: 'T, TG', color: tokenColors.gold },
    { name: 'Innspill 100-150m', distance: 'Korte jern', tn: 'Inspill kort', type: 'T, TG', color: sessionTypeColors.funksjonell },
    { name: 'Innspill 50-100m', distance: 'Wedges', tn: 'Wedge', type: 'TG, TGS', color: sessionTypeColors.golfslag },
    { name: 'Kort Spill', distance: 'Chip/Pitch/Lob', tn: 'Naerspill', type: 'TGS, S', color: tokenColors.forest },
    { name: 'Bunker', distance: 'Sand shots', tn: 'Bunker', type: 'TGS, S', color: tokenColors.primaryLight },
    { name: 'Putting kort', distance: '0-10 ft', tn: 'Putting kort', type: 'G, K', color: tokenColors.success },
    { name: 'Putting lang', distance: '10+ ft', tn: 'Putting lang', type: 'Fs, Fu', color: sessionTypeColors.spill }
  ];

  const settingLevels = [
    { level: 'S1', environment: 'Inne, flat matte', pressure: 'Ingen press', usage: 'Teknisk lÃ¦ring' },
    { level: 'S2', environment: 'Inne, kÃ¸lle uten ball', pressure: 'Minimal press', usage: 'Teknisk utvikling' },
    { level: 'S3', environment: 'Inne, kÃ¸lle + ball lav CS', pressure: 'Lav press', usage: 'Ballkontakt' },
    { level: 'S4', environment: 'Inne, Ã¸kende CS + TrackMan', pressure: 'Moderat press', usage: 'Stabilisering' },
    { level: 'S5', environment: 'Inne, CS100 + mÃ¥linger', pressure: 'Moderat-hÃ¸y', usage: 'Testing' },
    { level: 'S6', environment: 'Ute, range flatt', pressure: 'Moderat press', usage: 'OverfÃ¸ring' },
    { level: 'S7', environment: 'Ute, range variert', pressure: 'Moderat-hÃ¸y', usage: 'Realistisk' },
    { level: 'S8', environment: 'Ute, bane trening', pressure: 'HÃ¸y press', usage: 'Spillsituasjon' },
    { level: 'S9', environment: 'Konkurranse lav/middels', pressure: 'HÃ¸y press', usage: 'Forberedelse' },
    { level: 'S10', environment: 'Konkurranse hÃ¸yt press', pressure: 'Maksimal', usage: 'Turnering' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        .card-hover {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        
        .progress-bar {
          background: linear-gradient(90deg, ${tokenColors.forest}, ${tokenColors.success});
          height: 4px;
          border-radius: 2px;
          transition: width 0.8s ease;
        }
        
        .section-button {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .section-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .section-button:hover::before {
          left: 100%;
        }
        
        .area-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }
        
        .area-card:hover {
          transform: scale(1.05) rotate(1deg);
          z-index: 10;
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 opacity-90"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <PageTitle className="text-5xl font-bold text-white mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
              TIER Golf & Team Norway Golf
            </PageTitle>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Integrert kategori system for systematisk golfutvikling
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {['overview', 'learning', 'areas', 'settings'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`section-button px-6 py-3 rounded-full font-medium ${
                    activeSection === section
                      ? 'bg-white text-blue-700 shadow-lg'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  {section === 'overview' && 'System Oversikt'}
                  {section === 'learning' && 'LÃ¦ringsfaser'}
                  {section === 'areas' && 'Golf OmrÃ¥der'}
                  {section === 'settings' && 'Setting NivÃ¥er'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* System Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <SectionTitle className="text-3xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
                Hovedintegrasjonspunkter
              </SectionTitle>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Seks kjernekompoenenter som kobler TIER Golf sitt vitenskapelige system med Team Norway Golf sitt nasjonale rammeverk
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {systemComponents.map((component, index) => (
                <div 
                  key={component.id}
                  className="card-hover bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div 
                    className="w-4 h-20 rounded-full mb-4"
                    style={{backgroundColor: component.color}}
                  ></div>
                  <SubSectionTitle className="text-xl font-bold text-gray-800 mb-3" style={{fontFamily: 'Outfit, sans-serif'}}>
                    {component.name}
                  </SubSectionTitle>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-1">TIER Golf</p>
                      <p className="text-sm text-gray-700">{component.ak}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-1">Team Norway Golf</p>
                      <p className="text-sm text-gray-700">{component.tn}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Integration Benefits */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl p-8 text-white">
              <SubSectionTitle className="text-2xl font-bold mb-6" style={{fontFamily: 'Outfit, sans-serif'}}>
                Hovedgevinster av Integrert System
              </SubSectionTitle>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <p>Objektive progresjonskriterier eliminerer gjettearbeid</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <p>Strukturert kompleksitetsÃ¸kning forbereder spillere systematisk</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <p>Breaking Point metodikk optimaliserer individuell utvikling</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <p>Standardisert sprÃ¥k forbedrer trener-spiller kommunikasjon</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <p>Dokumenterte fremgangsmÃ¥linger validerer treningseffektivitet</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <p>Systematisk testing kobler AK metodikk til TN standarder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Learning Phases */}
        {activeSection === 'learning' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <SectionTitle className="text-3xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
                LÃ¦ringsfaser (L1-L5)
              </SectionTitle>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Strukturert progresjon fra grunnleggende kroppsbevegelser til automatisert prestasjon under press
              </p>
            </div>

            <div className="space-y-6">
              {learningPhases.map((phase, index) => (
                <div 
                  key={phase.phase}
                  className="card-hover bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{phase.phase}</span>
                      </div>
                      <div>
                        <SubSectionTitle className="text-xl font-bold text-gray-800" style={{fontFamily: 'Outfit, sans-serif'}}>
                          {phase.name}
                        </SubSectionTitle>
                        <p className="text-gray-600">{phase.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-500">{phase.progress}%</p>
                      <p className="text-sm text-gray-500">Progresjon</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="progress-bar rounded-full"
                      style={{width: `${phase.progress}%`}}
                    ></div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-2">FokusomrÃ¥de</p>
                      <p className="text-gray-700">{phase.focus}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-2">Kjerne Formel</p>
                      <p className="text-gray-700">L{index + 1} + CS{20 + index * 20} + S{Math.min(index + 1, 10)} + OmrÃ¥de</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Golf Areas */}
        {activeSection === 'areas' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <SectionTitle className="text-3xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
                Golf OmrÃ¥der Kategorisering
              </SectionTitle>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                17 spesifikke omrÃ¥der som mapper direkte til Team Norway Golf sine golfslag kategorier
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {golfAreas.map((area, index) => (
                <div 
                  key={index}
                  className="area-card bg-white rounded-2xl p-6 shadow-lg cursor-pointer"
                  style={{
                    borderTop: `6px solid ${area.color}`,
                    animationDelay: `${index * 0.1}s`
                  }}
                  onMouseEnter={() => setHoveredArea(index)}
                  onMouseLeave={() => setHoveredArea(null)}
                >
                  <div className="mb-4">
                    <SubSectionTitle className="text-lg font-bold text-gray-800 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
                      {area.name}
                    </SubSectionTitle>
                    <p className="text-sm text-gray-600">{area.distance}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">Team Norway</span>
                      <span className="text-sm text-blue-600 font-medium">{area.tn}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">Treningstype</span>
                      <span className="text-sm text-green-600 font-medium">{area.type}</span>
                    </div>
                  </div>
                  
                  {hoveredArea === index && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-blue-700">
                        Eksempel Ã¸kt: L3 - CS60 - S4 - flat matte - {area.name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setting Levels */}
        {activeSection === 'settings' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <SectionTitle className="text-3xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
                Setting NivÃ¥er (S1-S10)
              </SectionTitle>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Systematisk progresjon fra kontrollerte innendÃ¸rs miljÃ¸er til hÃ¸ypresset turneringsspill
              </p>
            </div>

            <div className="grid gap-4">
              {settingLevels.map((setting, index) => {
                // Use TIER category colors for gradient effect
                const settingColors = [
                  'rgb(var(--category-a))', 'rgb(var(--category-b))', 'rgb(var(--category-c))',
                  'rgb(var(--category-d))', 'rgb(var(--category-e))', 'rgb(var(--category-f))',
                  'rgb(var(--category-g))', 'rgb(var(--category-h))', 'rgb(var(--category-i))',
                  'rgb(var(--category-j))'
                ];
                const settingColor = settingColors[index % settingColors.length];

                return (
                  <div
                    key={setting.level}
                    className="card-hover bg-white rounded-xl p-4 shadow-md border-l-4"
                    style={{
                      borderLeftColor: settingColor,
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{backgroundColor: settingColor}}
                        >
                          {setting.level}
                        </div>
                      <div>
                        <SubSectionTitle className="font-bold text-gray-800">{setting.environment}</SubSectionTitle>
                        <p className="text-sm text-gray-600">{setting.usage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">PressnivÃ¥</p>
                      <p className="text-lg font-bold" style={{color: tokenColors.forest}}>
                        {setting.pressure}
                      </p>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl p-8 text-white">
              <SubSectionTitle className="text-2xl font-bold mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
                Setting Progresjonsprinsipp
              </SubSectionTitle>
              <p className="text-lg mb-4">
                Ny teknikk bygges fÃ¸rst i S1-S4, flyttes til S6-S8, og testes i S9-S10.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-lg">
                  <CardTitle className="font-bold mb-2">Bygging (S1-S4)</CardTitle>
                  <p className="text-sm">Teknisk lÃ¦ring i kontrollerte miljÃ¸er</p>
                </div>
                <div className="p-4 bg-white bg-opacity-20 rounded-lg">
                  <CardTitle className="font-bold mb-2">OverfÃ¸ring (S6-S8)</CardTitle>
                  <p className="text-sm">Anvendelse i realistiske situasjoner</p>
                </div>
                <div className="p-4 bg-white bg-opacity-20 rounded-lg">
                  <CardTitle className="font-bold mb-2">Testing (S9-S10)</CardTitle>
                  <p className="text-sm">Validering under konkurransepress</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-lg font-medium mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
            Integrert System for Systematisk Golfutvikling
          </p>
          <p className="text-gray-400">
            TIER Golf metodikk + Team Norway Golf standarder = Objektiv prestasjonsutvikling
          </p>
        </div>
      </div>
    </div>
  );
};

export default KategoriSystemOversikt;