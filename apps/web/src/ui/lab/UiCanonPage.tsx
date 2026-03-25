import React from 'react';
import Card from '../primitives/Card';
import Button from '../primitives/Button';
import Badge from '../primitives/Badge.primitive';
import Input from '../primitives/Input';
import Tabs from '../composites/Tabs.composite';
import StateCard from '../composites/StateCard';
import {
  PageTitle,
  SectionTitle,
  SubSectionTitle,
} from '../../components/typography';

/**
 * UI Canon Page — Single Source of Truth
 * =======================================
 *
 * This is the authoritative visual reference for all UI components.
 * All feature code MUST align with these patterns.
 *
 * Design Philosophy: Apple/Stripe premium feel
 * - Generous whitespace
 * - Soft shadows (multi-layer)
 * - 20px radius on cards
 * - Subtle micro-interactions
 * - Consistent 12/16/24/32px spacing rhythm
 */

const UiCanonPage: React.FC = () => {
  return (
    <div className="max-w-[1536px] mx-auto p-6 bg-tier-surface-subtle min-h-screen">
      {/* Page Header */}
      <header className="flex justify-between items-start mb-6 pb-4 border-b border-tier-border-default">
        <div>
          <PageTitle className="text-[28px] font-bold text-tier-navy mb-1">UI Canon</PageTitle>
          <p className="text-[15px] text-tier-text-secondary m-0">Single source of truth for TIER Golf visual style</p>
        </div>
        <Badge variant="accent" pill>v1.3</Badge>
      </header>

      {/* Quick Nav */}
      <Card variant="flat" padding="compact" className="mb-6">
        <div className="flex gap-4 flex-wrap">
          {['Typography', 'Colors', 'Buttons', 'Inputs', 'Badges', 'Cards', 'States', 'Navigation'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[13px] text-tier-gold no-underline font-medium">{item}</a>
          ))}
        </div>
      </Card>

      {/* ========== TYPOGRAPHY ========== */}
      <Section id="typography" title="Typography" description="Consistent type scale creates visual hierarchy">
        <Card padding="spacious">
          <div className="flex flex-col gap-0">
            <TypeRow label="H1 / Large Title" token="--font-size-large-title">
              <PageTitle className="text-[28px] font-bold text-tier-navy leading-tight m-0">Welcome to TIER Golf</PageTitle>
            </TypeRow>
            <TypeRow label="H2 / Title 1" token="--font-size-title1">
              <SectionTitle className="text-[22px] font-bold text-tier-navy leading-snug m-0">Today's Training Plan</SectionTitle>
            </TypeRow>
            <TypeRow label="H3 / Title 2" token="--font-size-title2">
              <SubSectionTitle className="text-[17px] font-semibold text-tier-navy leading-normal m-0">Exercises This Week</SubSectionTitle>
            </TypeRow>
            <TypeRow label="Headline" token="--font-size-headline">
              <span className="text-[17px] font-semibold text-tier-navy">Technique Focus</span>
            </TypeRow>
            <TypeRow label="Body" token="--font-size-body">
              <p className="text-[15px] font-normal text-tier-navy leading-relaxed m-0">This is body text used for longer descriptions and content.</p>
            </TypeRow>
            <TypeRow label="Footnote" token="--font-size-footnote">
              <span className="text-[13px] font-normal text-tier-text-secondary">Help text or secondary info</span>
            </TypeRow>
            <TypeRow label="Caption" token="--font-size-caption1">
              <span className="text-[12px] font-normal text-tier-text-tertiary">Last updated: December 26, 2025</span>
            </TypeRow>
            <TypeRow label="Label (uppercase)" token="font-weight: 600">
              <span className="text-[11px] font-semibold text-tier-text-tertiary uppercase tracking-wide">KATEGORI</span>
            </TypeRow>
          </div>
        </Card>

        {/* Page Header Pattern */}
        <SubSection title="Page Header Pattern">
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <SectionTitle className="text-[22px] font-bold text-tier-navy leading-snug m-0">Training Plan</SectionTitle>
                <p className="text-[13px] font-normal text-tier-text-secondary mt-1 mb-0">Week 52 · Dec 23-29, 2025</p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="ghost" size="sm">Previous week</Button>
                <Button variant="primary" size="sm">+ New session</Button>
              </div>
            </div>
          </Card>
        </SubSection>
      </Section>

      {/* ========== COLORS & SURFACES ========== */}
      <Section id="colors" title="Colors & Surfaces" description="Semantic tokens — never use hardcoded hex values">
        <Card padding="spacious">
          <SubSection title="Backgrounds">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              <ColorSwatch name="Background Default" token="--background-default" color="var(--background-default)" />
              <ColorSwatch name="Card / Surface" token="--card" color="var(--card)" />
              <ColorSwatch name="Surface Subtle" token="--background-surface" color="var(--background-surface)" />
              <ColorSwatch name="Inverse" token="--background-inverse" color="var(--background-inverse)" textLight />
            </div>
          </SubSection>

          <SubSection title="Text">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              <ColorSwatch name="Primary" token="--text-primary" color="var(--text-primary)" textLight />
              <ColorSwatch name="Secondary" token="--text-secondary" color="var(--text-secondary)" textLight />
              <ColorSwatch name="Tertiary" token="--text-tertiary" color="var(--text-tertiary)" />
              <ColorSwatch name="Brand" token="--text-brand" color="var(--text-brand)" textLight />
            </div>
          </SubSection>

          <SubSection title="Accent & Status">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              <ColorSwatch name="Accent" token="--accent" color="var(--accent)" textLight />
              <ColorSwatch name="Success" token="--success" color="var(--success)" textLight />
              <ColorSwatch name="Warning" token="--warning" color="var(--warning)" />
              <ColorSwatch name="Error" token="--error" color="var(--error)" textLight />
              <ColorSwatch name="Achievement" token="--achievement" color="var(--achievement)" />
            </div>
          </SubSection>

          <SubSection title="Border">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              <ColorSwatch name="Default" token="--border-default" color="var(--border-default)" showBorder />
              <ColorSwatch name="Subtle" token="--border-subtle" color="var(--border-subtle)" showBorder />
              <ColorSwatch name="Accent" token="--border-accent" color="var(--border-accent)" showBorder />
            </div>
          </SubSection>
        </Card>

        <DosDonts
          dos={[
            'Use semantic tokens: var(--accent), var(--text-primary)',
            'Use color-mix() for subtle backgrounds',
            'Match icon color with surrounding text'
          ]}
          donts={[
            'Hardcode hex values like #10456A',
            'Use raw tokens like var(--accent)',
            'Create new color variables in feature files'
          ]}
        />
      </Section>

      {/* ========== BUTTONS ========== */}
      <Section id="buttons" title="Buttons" description="Interactive elements with clear visual feedback">
        <Card padding="spacious">
          <SubSection title="Variants">
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </SubSection>

          <SubSection title="Sizes (sm: 36px, md: 44px)">
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </SubSection>

          <SubSection title="States (Tab for focus ring)">
            <div className="flex flex-wrap gap-3 items-center">
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
              <Button fullWidth>Full Width</Button>
            </div>
          </SubSection>

          <SubSection title="With Icons">
            <div className="flex flex-wrap gap-3 items-center">
              <Button leftIcon={<span>+</span>}>Add Item</Button>
              <Button rightIcon={<span>→</span>}>Continue</Button>
            </div>
          </SubSection>
        </Card>

        <DosDonts
          dos={[
            'Primary for main CTA (one per view)',
            'Ghost for secondary actions in toolbars',
            'Danger only for destructive actions'
          ]}
          donts={[
            'Multiple primary buttons in same view',
            'Using buttons for navigation (use links)',
            'Custom button styles in features'
          ]}
        />
      </Section>

      {/* ========== INPUTS ========== */}
      <Section id="inputs" title="Inputs" description="Form controls with clear states">
        <Card padding="spacious">
          <SubSection title="Default">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Standard" placeholder="Type here..." />
              <Input label="With hint" placeholder="Type here..." hint="Help text below the field" />
            </div>
          </SubSection>

          <SubSection title="Sizes">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Small (sm)" placeholder="36px height" size="sm" />
              <Input label="Medium (md)" placeholder="44px height" size="md" />
            </div>
          </SubSection>

          <SubSection title="States">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Error" placeholder="Error state" error="This field is required" />
              <Input label="Disabled" placeholder="Disabled" disabled />
            </div>
          </SubSection>
        </Card>
      </Section>

      {/* ========== BADGES ========== */}
      <Section id="badges" title="Badges" description="Status indicators and labels">
        <Card padding="spacious">
          <SubSection title="All Variants">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="achievement">Achievement</Badge>
            </div>
          </SubSection>

          <SubSection title="With Dot Indicator">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="success" dot>Active</Badge>
              <Badge variant="warning" dot>Pending</Badge>
              <Badge variant="error" dot>Error</Badge>
              <Badge variant="accent" dot>New</Badge>
            </div>
          </SubSection>

          <SubSection title="Pill Style">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="neutral" pill>Draft</Badge>
              <Badge variant="success" pill>Completed</Badge>
              <Badge variant="achievement" pill>Premium</Badge>
            </div>
          </SubSection>

          <SubSection title="In List Context">
            <Card variant="outlined" padding="compact">
              <ListRow
                title="Putting drill"
                subtitle="Technique · 15 min"
                badge={<Badge variant="success" size="sm">Completed</Badge>}
              />
              <ListRow
                title="Mental prep"
                subtitle="Mental · 10 min"
                badge={<Badge variant="warning" size="sm">In Progress</Badge>}
              />
              <ListRow
                title="Swing analysis"
                subtitle="Analysis · 20 min"
                badge={<Badge variant="neutral" size="sm">Planned</Badge>}
              />
            </Card>
          </SubSection>
        </Card>

        <DosDonts
          dos={[
            'neutral: default/inactive states',
            'accent: info, links, call-outs',
            'achievement: gold/premium/tier badges only'
          ]}
          donts={[
            'Creating local Badge components in features',
            'Using old variants (primary, gold, default)',
            'More than 2 badges per list item'
          ]}
        />
      </Section>

      {/* ========== CARDS ========== */}
      <Section id="cards" title="Cards" description="Container with 20px radius, soft shadow">
        <Card padding="spacious">
          <SubSection title="Variants">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              <Card variant="default">
                <p className="m-0 font-semibold text-sm text-tier-navy">Default</p>
                <p className="m-0 mt-1 text-xs text-tier-text-secondary">Soft shadow + subtle border</p>
              </Card>
              <Card variant="outlined">
                <p className="m-0 font-semibold text-sm text-tier-navy">Outlined</p>
                <p className="m-0 mt-1 text-xs text-tier-text-secondary">Border, no shadow</p>
              </Card>
              <Card variant="flat">
                <p className="m-0 font-semibold text-sm text-tier-navy">Flat</p>
                <p className="m-0 mt-1 text-xs text-tier-text-secondary">No shadow, muted bg</p>
              </Card>
              <Card variant="elevated">
                <p className="m-0 font-semibold text-sm text-tier-navy">Elevated</p>
                <p className="m-0 mt-1 text-xs text-tier-text-secondary">Stronger shadow</p>
              </Card>
            </div>
          </SubSection>

          <SubSection title="Interactive (hover to see effect)">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              <Card onClick={() => {}}>
                <p className="m-0 font-semibold text-sm text-tier-navy">Clickable</p>
                <p className="m-0 mt-1 text-xs text-tier-text-secondary">Shadow elevates on hover</p>
              </Card>
              <Card variant="outlined" onClick={() => {}}>
                <p className="m-0 font-semibold text-sm text-tier-navy">Clickable Outlined</p>
                <p className="m-0 mt-1 text-xs text-tier-text-secondary">Border highlights on hover</p>
              </Card>
            </div>
          </SubSection>

          <SubSection title="Padding">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              <Card padding="compact">
                <p className="m-0 font-semibold text-sm text-tier-navy">Compact (12px)</p>
              </Card>
              <Card padding="default">
                <p className="m-0 font-semibold text-sm text-tier-navy">Default (20px)</p>
              </Card>
              <Card padding="spacious">
                <p className="m-0 font-semibold text-sm text-tier-navy">Spacious (24px)</p>
              </Card>
            </div>
          </SubSection>
        </Card>
      </Section>

      {/* ========== STATE CARDS ========== */}
      <Section id="states" title="State Cards" description="Loading, error, and empty states">
        <div className="grid grid-cols-2 gap-4">
          <StateCard
            variant="loading"
            title="Loading..."
            description="Fetching data from server"
          />
          <StateCard
            variant="empty"
            title="No data"
            description="There are no items yet"
            action={<Button size="sm">Add first</Button>}
          />
          <StateCard
            variant="error"
            title="Something went wrong"
            description="Could not load data"
            action={<Button size="sm" variant="danger">Try again</Button>}
          />
          <StateCard
            variant="info"
            title="Tip"
            description="Click on an item to see details"
          />
        </div>
      </Section>

      {/* ========== NAVIGATION ========== */}
      <Section id="navigation" title="Navigation Items" description="Sidebar and nav patterns">
        <Card padding="spacious">
          <SubSection title="Sidebar Demo">
            <div className="w-[220px] bg-tier-surface-subtle rounded-lg p-2">
              <SidebarItem icon="Chart" label="Dashboard" active />
              <SidebarItem icon="Cal" label="Calendar" />
              <SidebarItem icon="Goal" label="Goals" badge={<Badge variant="accent" size="sm">3</Badge>} />
              <SidebarItem icon="Stats" label="Statistics" />
              <SidebarItem icon="Cog" label="Settings" disabled />
            </div>
          </SubSection>

          <SubSection title="Icon Buttons">
            <div className="flex flex-wrap gap-3 items-center">
              <IconButton icon="+" />
              <IconButton icon="Edit" />
              <IconButton icon="Del" variant="danger" />
              <IconButton icon="..." variant="ghost" />
            </div>
          </SubSection>
        </Card>
      </Section>

      {/* ========== TABS ========== */}
      <Section id="tabs" title="Tabs" description="Navigation tabs with underline/pills variants">
        <Card padding="spacious">
          <SubSection title="Underline (default)">
            <Tabs
              tabs={[
                { id: '1', label: 'Overview', content: <p className="py-4 text-tier-text-secondary text-sm">Overview content</p> },
                { id: '2', label: 'Statistics', content: <p className="py-4 text-tier-text-secondary text-sm">Statistics content</p> },
                { id: '3', label: 'Settings', content: <p className="py-4 text-tier-text-secondary text-sm">Settings content</p> },
              ]}
            />
          </SubSection>

          <SubSection title="Pills">
            <Tabs
              variant="pills"
              tabs={[
                { id: '1', label: 'Day', content: <p className="py-4 text-tier-text-secondary text-sm">Day view</p> },
                { id: '2', label: 'Week', content: <p className="py-4 text-tier-text-secondary text-sm">Week view</p> },
                { id: '3', label: 'Month', content: <p className="py-4 text-tier-text-secondary text-sm">Month view</p> },
              ]}
            />
          </SubSection>
        </Card>
      </Section>

      {/* ========== SPACING ========== */}
      <Section id="spacing" title="Spacing Scale" description="Consistent rhythm throughout the app">
        <Card padding="spacious">
          <div className="flex flex-col gap-3">
            {[
              { token: '--spacing-2', value: '8px', use: 'Tight spacing (inside cards)' },
              { token: '--spacing-3', value: '12px', use: 'Compact gap' },
              { token: '--spacing-4', value: '16px', use: 'Default gap' },
              { token: '--spacing-6', value: '24px', use: 'Section gap (between cards)' },
              { token: '--spacing-8', value: '32px', use: 'Large gap (page sections)' },
            ].map((s) => (
              <div key={s.token} className="grid grid-cols-[auto_140px_60px_1fr] items-center gap-3">
                <div className="bg-tier-gold rounded h-6" style={{ width: s.value }} />
                <code className="text-xs font-mono text-tier-navy">{s.token}</code>
                <span className="text-xs text-tier-text-secondary">{s.value}</span>
                <span className="text-xs text-tier-text-tertiary">{s.use}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ========== CANON SUMMARY ========== */}
      <Section id="summary" title="Canon Summary" description="Quick reference table">
        <Card padding="spacious">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b-2 border-tier-border-default text-xs font-semibold text-tier-navy uppercase tracking-wide">Element</th>
                <th className="text-left p-2 border-b-2 border-tier-border-default text-xs font-semibold text-tier-navy uppercase tracking-wide">Property</th>
                <th className="text-left p-2 border-b-2 border-tier-border-default text-xs font-semibold text-tier-navy uppercase tracking-wide">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Card</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Radius</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">20px (--radius-xl)</td></tr>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Card</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Shadow</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">--shadow-card (multi-layer)</td></tr>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Card</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Padding</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">20px default, 12px compact, 24px spacious</td></tr>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Button</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Height</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">36px (sm), 44px (md), 52px (lg)</td></tr>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Input</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Height</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">36px (sm), 44px (md)</td></tr>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Focus</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Ring</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">accent @ 15% opacity, 3px offset</td></tr>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Transition</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Duration</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">150-200ms ease-out</td></tr>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Gap (sections)</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Spacing</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">24-32px</td></tr>
              <tr><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Gap (in cards)</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">Spacing</td><td className="p-2 border-b border-tier-border-subtle text-[13px] text-tier-text-secondary">12-16px</td></tr>
            </tbody>
          </table>
        </Card>
      </Section>
    </div>
  );
};

// ============ HELPER COMPONENTS ============

const Section: React.FC<{ id: string; title: string; description: string; children: React.ReactNode }> = ({ id, title, description, children }) => (
  <section id={id} className="mb-8">
    <SectionTitle className="text-xl font-bold text-tier-navy m-0 mb-1">{title}</SectionTitle>
    <p className="text-sm text-tier-text-secondary m-0 mb-4">{description}</p>
    {children}
  </section>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <SubSectionTitle className="text-xs font-semibold text-tier-text-tertiary m-0 mb-3 uppercase tracking-wide">{title}</SubSectionTitle>
    {children}
  </div>
);

const TypeRow: React.FC<{ label: string; token: string; children: React.ReactNode }> = ({ label, token, children }) => (
  <div className="flex items-center gap-4 py-3 border-b border-tier-border-subtle">
    <div className="w-[180px] shrink-0">
      <span className="block text-[13px] font-semibold text-tier-navy">{label}</span>
      <code className="text-[11px] text-tier-text-tertiary font-mono">{token}</code>
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const ColorSwatch: React.FC<{ name: string; token: string; color: string; textLight?: boolean; showBorder?: boolean }> = ({ name, token, color, textLight, showBorder }) => (
  <div className="flex flex-col">
    <div
      className="h-[60px] rounded-lg flex items-end justify-start p-2 text-[11px] font-medium"
      style={{
        backgroundColor: color,
        border: showBorder ? `2px solid ${color}` : undefined,
        color: textLight ? '#FFFFFF' : 'var(--text-primary)',
      }}
    >
      {name}
    </div>
    <code className="text-[10px] text-tier-text-tertiary mt-1 font-mono">{token}</code>
  </div>
);

const DosDonts: React.FC<{ dos: string[]; donts: string[] }> = ({ dos, donts }) => (
  <div className="grid grid-cols-2 gap-4 mt-4">
    <Card variant="flat" padding="compact">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-green-600 text-base font-bold">Yes</span>
        <span className="text-sm font-semibold text-green-600">Do</span>
      </div>
      <ul className="m-0 pl-4 text-[13px] leading-loose">
        {dos.map((item, i) => <li key={i} className="text-tier-navy">{item}</li>)}
      </ul>
    </Card>
    <Card variant="flat" padding="compact" className="bg-red-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-red-600 text-base font-bold">No</span>
        <span className="text-sm font-semibold text-red-600">Don't</span>
      </div>
      <ul className="m-0 pl-4 text-[13px] leading-loose">
        {donts.map((item, i) => <li key={i} className="text-tier-navy">{item}</li>)}
      </ul>
    </Card>
  </div>
);

const ListRow: React.FC<{ title: string; subtitle: string; badge: React.ReactNode }> = ({ title, subtitle, badge }) => (
  <div className="flex justify-between items-center p-3 border-b border-tier-border-subtle">
    <div>
      <p className="m-0 text-sm font-medium text-tier-navy">{title}</p>
      <p className="m-0 text-xs text-tier-text-secondary">{subtitle}</p>
    </div>
    {badge}
  </div>
);

const SidebarItem: React.FC<{ icon: string; label: string; active?: boolean; disabled?: boolean; badge?: React.ReactNode }> = ({ icon, label, active, disabled, badge }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 ${
    active ? 'bg-tier-gold/10 text-tier-gold' : ''
  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <span className="text-base">{icon}</span>
    <span className="flex-1 text-sm font-medium">{label}</span>
    {badge}
  </div>
);

const IconButton: React.FC<{ icon: string; variant?: 'default' | 'danger' | 'ghost' }> = ({ icon, variant = 'default' }) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-tier-surface-subtle text-tier-navy',
    danger: 'bg-red-50 text-red-600',
    ghost: 'bg-transparent text-tier-text-secondary',
  };
  return (
    <button className={`w-9 h-9 rounded-lg border-none cursor-pointer flex items-center justify-center text-base transition-colors duration-150 ${variantClasses[variant]}`}>
      {icon}
    </button>
  );
};

export default UiCanonPage;
