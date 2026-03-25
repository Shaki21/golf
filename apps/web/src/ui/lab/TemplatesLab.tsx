import React, { useState } from 'react';
import { ListTemplate, ListItem, ListSection } from '../templates/ListTemplate';
import { CardGridTemplate, CardItem } from '../templates/CardGridTemplate';
import {
  PageTitle,
  SectionTitle,
  SubSectionTitle,
} from '../../components/typography';
import {
  CheckCircle,
  TrendingUp,
  Calendar,
  Target,
  Award,
  FileText,
  Inbox,
  Plus,
} from 'lucide-react';

/**
 * Templates Lab - Demo and testing page for reusable UI templates
 * Access at /ui-lab/templates
 */
export const TemplatesLab: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'list' | 'cards'>('list');
  const [selectedListItem, setSelectedListItem] = useState<string | null>(null);

  // List Template Demo Data
  const listSections: ListSection[] = [
    {
      id: 'in-progress',
      header: 'In progress',
      items: [
        {
          id: '1',
          icon: <Target size={20} />,
          title: 'Improve putting technique',
          subtitle: '5 of 8 sessions completed',
          metadata: '62%',
          badge: 'High',
          badgeColor: 'error',
          onClick: () => setSelectedListItem('1'),
          selected: selectedListItem === '1',
        },
        {
          id: '2',
          icon: <TrendingUp size={20} />,
          title: 'Increase driver distance',
          subtitle: '3 of 10 sessions completed',
          metadata: '30%',
          badge: 'Medium',
          badgeColor: 'warning',
          onClick: () => setSelectedListItem('2'),
          selected: selectedListItem === '2',
        },
      ],
    },
    {
      id: 'completed',
      header: 'Completed',
      items: [
        {
          id: '3',
          icon: <CheckCircle size={20} />,
          title: 'Chip exercises around the green',
          subtitle: 'Completed Dec 15, 2025',
          metadata: '100%',
          badge: 'Completed',
          badgeColor: 'success',
          onClick: () => setSelectedListItem('3'),
          selected: selectedListItem === '3',
        },
      ],
    },
  ];

  const flatListItems: ListItem[] = [
    {
      id: '1',
      icon: <Calendar size={20} />,
      title: 'Next session: Technique training',
      subtitle: 'Tomorrow at 14:00',
      metadata: '60 min',
      onClick: () => alert('Session clicked'),
    },
    {
      id: '2',
      icon: <FileText size={20} />,
      title: 'Training note from coach',
      subtitle: 'Review of previous session',
      metadata: '2h ago',
      badge: 'New',
      badgeColor: 'primary',
      onClick: () => alert('Note clicked'),
    },
    {
      id: '3',
      icon: <Award size={20} />,
      title: 'New badge earned!',
      subtitle: 'Putting Master - Silver',
      metadata: 'Today',
      badge: 'Silver',
      badgeColor: 'success',
      onClick: () => alert('Badge clicked'),
    },
  ];

  // Card Grid Template Demo Data
  const cardItems: CardItem[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
      imageAlt: 'Golf course',
      title: 'Putting Masterclass',
      description: 'Learn advanced putting techniques from professional players.',
      badge: 'New',
      badgeColor: 'primary',
      metadata: '12 videos • 2h 30min',
      actions: {
        primary: {
          label: 'Start course',
          onClick: () => alert('Start course'),
        },
        secondary: {
          label: 'Preview',
          onClick: () => alert('Preview'),
        },
      },
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1593111774240-d529f12a3aae?w=400',
      imageAlt: 'Golf swing',
      title: 'Driver technique',
      description: 'Optimize your driver swing for longer and more accurate shots.',
      badge: 'Popular',
      badgeColor: 'warning',
      metadata: '8 videos • 1h 45min',
      actions: {
        primary: {
          label: 'Continue',
          onClick: () => alert('Continue'),
        },
      },
      onClick: () => alert('Card clicked'),
    },
    {
      id: '3',
      icon: <Target size={64} />,
      title: 'Short game around the green',
      description: 'Master chip and pitch for better scoring.',
      metadata: '6 videos • 1h 15min',
      actions: {
        primary: {
          label: 'Start course',
          onClick: () => alert('Start course'),
        },
      },
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
      imageAlt: 'Golf bunker',
      title: 'Bunker shots',
      description: 'Get out of sand traps with confidence.',
      badge: 'Coming soon',
      badgeColor: 'success',
      metadata: 'Launching Jan 1, 2026',
    },
    {
      id: '5',
      loading: true,
      title: 'Loading...',
      description: '',
    },
  ];

  return (
    <div className="min-h-screen bg-ak-snow p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <PageTitle className="text-[32px] font-bold text-ak-charcoal mb-2">
          UI Templates Lab
        </PageTitle>
        <p className="text-[16px] text-ak-steel">
          Demo and testing of reusable UI templates
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 border-b border-ak-mist">
          <button
            onClick={() => setSelectedTab('list')}
            className={`px-6 py-3 text-[14px] font-medium transition-colors ${
              selectedTab === 'list'
                ? 'text-ak-primary border-b-2 border-ak-primary'
                : 'text-ak-steel hover:text-ak-charcoal'
            }`}
          >
            List Template
          </button>
          <button
            onClick={() => setSelectedTab('cards')}
            className={`px-6 py-3 text-[14px] font-medium transition-colors ${
              selectedTab === 'cards'
                ? 'text-ak-primary border-b-2 border-ak-primary'
                : 'text-ak-steel hover:text-ak-charcoal'
            }`}
          >
            Card Grid Template
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* List Template Examples */}
        {selectedTab === 'list' && (
          <div className="space-y-8">
            {/* Sectioned List */}
            <div>
              <SectionTitle className="text-[20px] font-semibold text-ak-charcoal mb-4">
                Sectioned List with Icons & Badges
              </SectionTitle>
              <div className="bg-white rounded-xl border border-ak-mist p-6">
                <ListTemplate sections={listSections} showDividers />
              </div>
            </div>

            {/* Flat List */}
            <div>
              <SectionTitle className="text-[20px] font-semibold text-ak-charcoal mb-4">
                Flat List with Metadata
              </SectionTitle>
              <div className="bg-white rounded-xl border border-ak-mist p-6">
                <ListTemplate items={flatListItems} showDividers />
              </div>
            </div>

            {/* Empty State */}
            <div>
              <SectionTitle className="text-[20px] font-semibold text-ak-charcoal mb-4">
                Empty State Example
              </SectionTitle>
              <div className="bg-white rounded-xl border border-ak-mist p-6">
                <ListTemplate
                  items={[]}
                  emptyState={{
                    icon: <Inbox size={48} />,
                    title: 'No messages',
                    description: 'You have no new messages right now.',
                    action: {
                      label: 'View archive',
                      onClick: () => alert('View archive'),
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Card Grid Template Examples */}
        {selectedTab === 'cards' && (
          <div className="space-y-8">
            {/* 3 Column Grid */}
            <div>
              <SectionTitle className="text-[20px] font-semibold text-ak-charcoal mb-4">
                3 Column Grid with Images & Actions
              </SectionTitle>
              <CardGridTemplate cards={cardItems} columns={3} gap="md" />
            </div>

            {/* 2 Column Grid */}
            <div>
              <SectionTitle className="text-[20px] font-semibold text-ak-charcoal mb-4">
                2 Column Grid
              </SectionTitle>
              <CardGridTemplate
                cards={cardItems.slice(0, 4)}
                columns={2}
                gap="lg"
              />
            </div>

            {/* 4 Column Grid */}
            <div>
              <SectionTitle className="text-[20px] font-semibold text-ak-charcoal mb-4">
                4 Column Grid (Small Cards)
              </SectionTitle>
              <CardGridTemplate
                cards={cardItems.slice(0, 4)}
                columns={4}
                gap="sm"
              />
            </div>

            {/* Empty State */}
            <div>
              <SectionTitle className="text-[20px] font-semibold text-ak-charcoal mb-4">
                Empty State Example
              </SectionTitle>
              <CardGridTemplate
                cards={[]}
                columns={3}
                emptyState={{
                  icon: <Plus size={48} />,
                  title: 'No courses available',
                  description: 'New courses coming soon. Stay tuned!',
                  action: {
                    label: 'Create new course',
                    onClick: () => alert('Create course'),
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Implementation Examples */}
      <div className="max-w-7xl mx-auto mt-12 p-6 bg-white rounded-xl border border-ak-mist">
        <SectionTitle className="text-[20px] font-semibold text-ak-charcoal mb-4">
          Implementation Examples
        </SectionTitle>

        <div className="space-y-6">
          {/* List Template Code */}
          <div>
            <SubSectionTitle className="text-[16px] font-medium text-ak-charcoal mb-2">
              List Template Usage
            </SubSectionTitle>
            <pre className="bg-ak-snow p-4 rounded-lg text-[13px] text-ak-charcoal overflow-x-auto">
              {`import { ListTemplate } from '@/ui/templates/ListTemplate';

const items = [
  {
    id: '1',
    icon: <Calendar size={20} />,
    title: 'Next training session',
    subtitle: 'Tomorrow at 14:00',
    metadata: '60 min',
    badge: 'New',
    badgeColor: 'primary',
    onClick: () => console.log('Clicked'),
  },
];

<ListTemplate items={items} showDividers />`}
            </pre>
          </div>

          {/* Card Grid Template Code */}
          <div>
            <SubSectionTitle className="text-[16px] font-medium text-ak-charcoal mb-2">
              Card Grid Template Usage
            </SubSectionTitle>
            <pre className="bg-ak-snow p-4 rounded-lg text-[13px] text-ak-charcoal overflow-x-auto">
              {`import { CardGridTemplate } from '@/ui/templates/CardGridTemplate';

const cards = [
  {
    id: '1',
    image: '/course-image.jpg',
    title: 'Putting Masterclass',
    description: 'Learn advanced putting techniques',
    badge: 'New',
    badgeColor: 'primary',
    actions: {
      primary: {
        label: 'Start course',
        onClick: () => console.log('Start'),
      },
    },
  },
];

<CardGridTemplate cards={cards} columns={3} gap="md" />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesLab;
