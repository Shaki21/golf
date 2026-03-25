/**
 * Weather & Golf Courses Browser
 * Browse courses and check weather conditions
 */

import React, { useState } from 'react';
import { Cloud, Map, Search, Trophy } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import BestCoursesToday from './components/BestCoursesToday';
import NorwegianCourses from './components/NorwegianCourses';
import CourseSearch from './components/CourseSearch';

type Tab = 'best-today' | 'norway' | 'search';

const WeatherCoursesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('best-today');

  const tabs: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'best-today', label: 'Beste vær i dag', icon: <Trophy size={18} />, description: 'Baner med best værforhold nå' },
    { id: 'norway', label: 'Norge', icon: <Map size={18} />, description: 'Alle norske golfbaner' },
    { id: 'search', label: 'Søk baner', icon: <Search size={18} />, description: 'Søk etter baner globalt' },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Cloud size={28} className="text-tier-info" />
            <PageHeader title="Vær & Golfbaner" subtitle="" helpText="" actions={null} className="mb-0" />
          </div>
          <p className="text-tier-text-secondary">
            Finn de beste banene å spille basert på værforhold, eller bla gjennom alle tilgjengelige baner.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-tier-border-default mb-6">
          <div className="grid grid-cols-3 border-b border-tier-border-default">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-tier-info border-b-2 border-tier-info bg-tier-info-light'
                    : 'text-tier-text-secondary hover:text-tier-navy hover:bg-tier-surface-base'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
                <span className="text-xs text-tier-text-secondary hidden md:block">{tab.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'best-today' && <BestCoursesToday />}
          {activeTab === 'norway' && <NorwegianCourses />}
          {activeTab === 'search' && <CourseSearch />}
        </div>
      </div>
    </div>
  );
};

export default WeatherCoursesPage;
