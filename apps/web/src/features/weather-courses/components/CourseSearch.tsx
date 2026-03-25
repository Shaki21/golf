/**
 * Course Search
 * Global golf course search with filters
 */

import React, { useState } from 'react';
import { Search, MapPin, Users } from 'lucide-react';
import { useSearchCourses } from '../../../hooks/useGolfCourses';
import Input from '../../../ui/primitives/Input';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle } from '../../../ui/primitives/typography';

const CourseSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { courses, total, loading } = useSearchCourses({
    query: hasSearched ? query : '',
    country: hasSearched ? country : '',
    city: hasSearched ? city : '',
    limit: 50,
  });

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }}>Søk etter golfbaner</SubSectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Navn på bane eller klubb..."
            className="w-full"
          />

          <Input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Land (f.eks. Norway)"
            className="w-full"
          />

          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="By (f.eks. Oslo)"
            className="w-full"
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSearch}
          disabled={!query && !country && !city}
          loading={loading}
          leftIcon={<Search size={18} />}
          className="w-full md:w-auto"
        >
          Søk
        </Button>
      </div>

      {/* Results */}
      {hasSearched && (
        <>
          {loading ? (
            <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-info mx-auto mb-4"></div>
              <p className="text-tier-text-secondary">Søker...</p>
            </div>
          ) : (
            <>
              <div className="bg-tier-info-light border border-tier-info rounded-xl p-4">
                <p className="text-sm text-tier-navy">
                  <strong className="font-semibold">{total} baner funnet</strong>
                  {courses.length < total && ` (viser ${courses.length})`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course: any) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-tier-border-default p-6 hover:border-tier-info hover:shadow-md transition-all"
                  >
                    <SubSectionTitle style={{ marginBottom: 0 }}>{course.name}</SubSectionTitle>

                    {course.club && (
                      <div className="flex items-center gap-2 text-sm text-tier-text-secondary mb-3">
                        <Users size={14} />
                        <span>{course.club.name}</span>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      {(course.city || course.country) && (
                        <div className="flex items-center gap-2 text-tier-text-secondary">
                          <MapPin size={16} />
                          <span>
                            {course.city}
                            {course.city && course.country && ', '}
                            {course.country}
                          </span>
                        </div>
                      )}
                    </div>

                    {course.holes && (
                      <div className="mt-4 pt-4 border-t border-tier-border-default">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-tier-text-secondary">Hull</span>
                          <span className="font-semibold text-tier-navy">{course.holes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {courses.length === 0 && (
                <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <SubSectionTitle style={{ marginBottom: 0 }}>Ingen resultater</SubSectionTitle>
                  <p className="text-tier-text-secondary">Prøv et annet søkeord eller filtrer mindre spesifikt</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Instructions when not searched */}
      {!hasSearched && (
        <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
          <Search size={48} className="text-tier-text-secondary mx-auto mb-4" />
          <SubSectionTitle style={{ marginBottom: 0 }}>Søk etter golfbaner</SubSectionTitle>
          <p className="text-tier-text-secondary">
            Fyll inn minst ett søkefelt og klikk "Søk" for å finne golfbaner globalt
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseSearch;
