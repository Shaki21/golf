/**
 * KnowledgeBlog Component
 *
 * Blog-style knowledge base display with articles, categories,
 * and author information. Based on Tailwind UI blog template.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageTitle, SubSectionTitle } from '../../components/typography/Headings';

// ============================================================================
// TYPES
// ============================================================================

interface Article {
  id: number;
  title: string;
  description: string;
  date: string;
  datetime: string;
  category: { id: string; title: string };
  readTime: string;
  author: { name: string; role: string };
}

interface Category {
  id: string;
  title: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Optimal svingteknikk for større lengde',
    description: 'Lær hvordan du kan øke drivelengden ved å fokusere på hofterotering og timing.',
    date: '15. des 2024',
    datetime: '2024-12-15',
    category: { id: 'teknikk', title: 'Teknikk' },
    readTime: '8 min',
    author: { name: 'Anders Kristiansen', role: 'Head Coach' },
  },
  {
    id: 2,
    title: 'Mental forberedelse før turneringer',
    description: 'Strategier for å håndtere prestasjonsangst og bygge mental styrke.',
    date: '10. des 2024',
    datetime: '2024-12-10',
    category: { id: 'mental', title: 'Mental trening' },
    readTime: '6 min',
    author: { name: 'Kari Nordmann', role: 'Sportspsykolog' },
  },
  {
    id: 3,
    title: 'Ernæring for optimale prestasjoner',
    description: 'Hva du bør spise før, under og etter en turnering.',
    date: '5. des 2024',
    datetime: '2024-12-05',
    category: { id: 'fysisk', title: 'Fysisk trening' },
    readTime: '5 min',
    author: { name: 'Ole Hansen', role: 'Ernæringsfysiolog' },
  },
  {
    id: 4,
    title: 'Putting: Avstandskontroll over alt',
    description: 'Hvorfor avstandskontroll er viktigere enn retning.',
    date: '1. des 2024',
    datetime: '2024-12-01',
    category: { id: 'teknikk', title: 'Teknikk' },
    readTime: '7 min',
    author: { name: 'Anders Kristiansen', role: 'Head Coach' },
  },
  {
    id: 5,
    title: 'Forstå Strokes Gained-statistikk',
    description: 'En grundig innføring i SG-analyse for å identifisere forbedringsområder.',
    date: '25. nov 2024',
    datetime: '2024-11-25',
    category: { id: 'analyse', title: 'Analyse' },
    readTime: '10 min',
    author: { name: 'Anders Kristiansen', role: 'Head Coach' },
  },
  {
    id: 6,
    title: 'Golfregler: Vanlige situasjoner',
    description: 'Gjennomgang av de vanligste regelsituasjonene på banen.',
    date: '20. nov 2024',
    datetime: '2024-11-20',
    category: { id: 'regler', title: 'Regler' },
    readTime: '9 min',
    author: { name: 'Per Olsen', role: 'Dommer NGF' },
  },
];

const CATEGORIES: Category[] = [
  { id: 'all', title: 'Alle' },
  { id: 'teknikk', title: 'Teknikk' },
  { id: 'mental', title: 'Mental trening' },
  { id: 'fysisk', title: 'Fysisk trening' },
  { id: 'analyse', title: 'Analyse' },
  { id: 'regler', title: 'Regler' },
];

// ============================================================================
// HELPERS
// ============================================================================

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function KnowledgeBlog() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter(article => {
      const matchesCategory = activeCategory === 'all' || article.category.id === activeCategory;
      const matchesSearch = !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="bg-tier-white min-h-screen py-8 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <PageTitle className="text-[32px] font-bold text-tier-navy m-0 mb-3">
            Kunnskapsbase
          </PageTitle>
          <p className="text-lg text-tier-text-secondary m-0 max-w-[600px] mx-auto">
            Lær deg nye teknikker, mentale strategier og analysemetoder.
          </p>
        </div>

        {/* Filter section */}
        <div className="flex flex-col gap-5 mb-8 pb-6 border-b border-tier-border-default">
          {/* Search */}
          <div className="relative max-w-[400px] w-full mx-auto">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tier-text-tertiary"
            />
            <input
              type="text"
              placeholder="Søk i artikler..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pr-3.5 pl-11 text-[15px] border border-tier-border-default rounded-[10px] bg-tier-white text-tier-navy outline-none focus:border-tier-navy"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full cursor-pointer transition-all border ${
                  activeCategory === category.id
                    ? 'bg-tier-navy border-tier-navy text-white'
                    : 'bg-tier-surface-base border-tier-border-default text-tier-text-secondary hover:border-tier-navy'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-8">
          {filteredArticles.map(article => (
            <article
              key={article.id}
              className="flex flex-col bg-tier-white rounded-xl border border-tier-border-default p-6"
            >
              {/* Meta */}
              <div className="flex items-center gap-3 mb-4">
                <time dateTime={article.datetime} className="text-[13px] text-tier-text-tertiary">
                  {article.date}
                </time>
                <span className="px-3 py-1 text-xs font-medium text-tier-text-secondary bg-tier-surface-base rounded-full">
                  {article.category.title}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 mb-5">
                <SubSectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-2.5 leading-tight">
                  <a
                    href={`/ressurser/${article.id}`}
                    onClick={(e) => { e.preventDefault(); navigate(`/ressurser/${article.id}`); }}
                    className="text-inherit no-underline hover:text-tier-navy"
                  >
                    {article.title}
                  </a>
                </SubSectionTitle>
                <p className="text-sm leading-relaxed text-tier-text-secondary m-0 mb-3">
                  {article.description}
                </p>
                <p className="text-[13px] text-tier-text-tertiary m-0">
                  {article.readTime} lesetid
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-tier-border-default">
                <div className="w-10 h-10 rounded-full bg-tier-navy/10 text-tier-navy flex items-center justify-center text-sm font-semibold">
                  {getInitials(article.author.name)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-tier-navy m-0">
                    {article.author.name}
                  </p>
                  <p className="text-[13px] text-tier-text-tertiary m-0">
                    {article.author.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBlog;
