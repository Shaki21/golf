/**
 * Norwegian Courses
 * Browse all Norwegian golf courses with weather info
 */

import React, { useState } from 'react';
import { MapPin, Phone, Globe } from 'lucide-react';
import { useNorwegianCourses } from '../../../hooks/useGolfCourses';
import Input from '../../../ui/primitives/Input';
import { SubSectionTitle } from '../../../ui/primitives/typography';

const NorwegianCourses: React.FC = () => {
  const { clubs, loading, error } = useNorwegianCourses();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClubs = clubs.filter((club: any) =>
    club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-info mx-auto mb-4"></div>
        <p className="text-tier-text-secondary">Laster norske golfbaner...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
        <div className="text-tier-error text-4xl mb-2">⚠️</div>
        <p className="text-tier-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded-xl border border-tier-border-default p-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Søk etter klubb eller by..."
          className="w-full"
        />
      </div>

      <div className="bg-tier-info-light border border-tier-info rounded-xl p-4">
        <p className="text-sm text-tier-navy">
          <strong className="font-semibold">{filteredClubs.length} golfklubber</strong> i Norge
          {searchTerm && ` (filtrert fra ${clubs.length})`}
        </p>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClubs.map((club: any) => (
          <div
            key={club.id}
            className="bg-white rounded-xl border border-tier-border-default p-6 hover:border-tier-info hover:shadow-md transition-all"
          >
            <SubSectionTitle style={{ marginBottom: 0 }}>{club.name}</SubSectionTitle>

            <div className="space-y-2 text-sm">
              {club.city && (
                <div className="flex items-center gap-2 text-tier-text-secondary">
                  <MapPin size={16} />
                  <span>{club.city}</span>
                </div>
              )}

              {club.phone && (
                <div className="flex items-center gap-2 text-tier-text-secondary">
                  <Phone size={16} />
                  <span>{club.phone}</span>
                </div>
              )}

              {club.website && (
                <div className="flex items-center gap-2 text-tier-info">
                  <Globe size={16} />
                  <a href={club.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Nettside
                  </a>
                </div>
              )}
            </div>

            {club.courses && club.courses.length > 0 && (
              <div className="mt-4 pt-4 border-t border-tier-border-default">
                <p className="text-xs text-tier-text-secondary mb-2">Baner ({club.courses.length})</p>
                <div className="space-y-1">
                  {club.courses.map((course: any, idx: number) => (
                    <div key={idx} className="text-sm text-tier-navy">
                      • {course.name} {course.holes && `(${course.holes} hull)`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <SubSectionTitle style={{ marginBottom: 0 }}>Ingen resultater</SubSectionTitle>
          <p className="text-tier-text-secondary">Prøv et annet søkeord</p>
        </div>
      )}
    </div>
  );
};

export default NorwegianCourses;
