import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Zap,
  TrendingUp,
  CalendarDays,
  User,
  MessageSquare,
  Settings,
  BookOpen,
  Target,
  ClipboardList,
  BarChart3,
  Video,
  Award,
  Calendar,
  Trophy,
  Flag,
  Bell,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '../../components/shadcn/command';
import { useTestProtocols } from '../../hooks/useTrainingConfig';

/**
 * CommandPalette - Global search and navigation with Cmd+K
 *
 * Features:
 * - Keyboard shortcut (Cmd+K / Ctrl+K)
 * - Navigation to all app sections
 * - Quick actions
 * - Recent pages (future)
 */

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  section: string;
  keywords?: string[];
}

// Icon mapping for dynamic resolution
const iconMap: Record<string, React.ElementType> = {
  Home,
  Zap,
  TrendingUp,
  CalendarDays,
  User,
  MessageSquare,
  Settings,
  BookOpen,
  Target,
  ClipboardList,
  BarChart3,
  Video,
  Award,
  Calendar,
  Trophy,
  Flag,
  Bell,
};

// Static navigation items (without tests - those are added dynamically)
const staticNavigationItems: NavigationItem[] = [
  // Hjem
  { id: 'home', label: 'Hjem', href: '/', icon: Home, section: 'Navigasjon', keywords: ['dashboard', 'start'] },

  // Aktivitet
  { id: 'training-today', label: 'Treningsplan', href: '/trening/dagens', icon: Target, section: 'Aktivitet', keywords: ['trening', 'plan', 'dagens'] },
  { id: 'training-log', label: 'Treningslogg', href: '/trening/logg', icon: Zap, section: 'Aktivitet', keywords: ['logg', 'registrer'] },
  { id: 'testing', label: 'Testprotokoll', href: '/testprotokoll', icon: ClipboardList, section: 'Aktivitet', keywords: ['test', 'protokoll', 'alle'] },

  // Fremgang
  { id: 'stats', label: 'Statistikk', href: '/stats', icon: BarChart3, section: 'Fremgang', keywords: ['statistikk', 'data', 'analyse'] },
  { id: 'videos', label: 'Video', href: '/videos', icon: Video, section: 'Fremgang', keywords: ['video', 'analyse', 'swing'] },
  { id: 'achievements', label: 'Prestasjoner', href: '/achievements', icon: Award, section: 'Fremgang', keywords: ['prestasjon', 'badge', 'mesterskap'] },

  // Plan
  { id: 'calendar', label: 'Kalender', href: '/kalender', icon: Calendar, section: 'Plan', keywords: ['kalender', 'dato', 'uke'] },
  { id: 'tournaments', label: 'Turneringer', href: '/turneringskalender', icon: Trophy, section: 'Plan', keywords: ['turnering', 'konkurranse'] },
  { id: 'goals', label: 'Mal & Plan', href: '/maalsetninger', icon: Flag, section: 'Plan', keywords: ['mal', 'malsetting', 'plan'] },

  // Profil & Innstillinger
  { id: 'profile', label: 'Min profil', href: '/profil', icon: User, section: 'Profil', keywords: ['profil', 'meg', 'bruker'] },
  { id: 'messages', label: 'Meldinger', href: '/meldinger', icon: MessageSquare, section: 'Profil', keywords: ['melding', 'innboks', 'chat'] },
  { id: 'settings', label: 'Innstillinger', href: '/innstillinger', icon: Settings, section: 'Profil', keywords: ['innstilling', 'oppsett', 'konto'] },
  { id: 'notifications', label: 'Varsler', href: '/varsler', icon: Bell, section: 'Profil', keywords: ['varsel', 'notifikasjon'] },

  // Ressurser
  { id: 'exercises', label: 'Ovelsesbibliotek', href: '/ovelsesbibliotek', icon: BookOpen, section: 'Ressurser', keywords: ['ovelse', 'bibliotek', 'drill'] },
];

// Helper to group items by section
function groupItemsBySection(items: NavigationItem[]): Record<string, NavigationItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);
}

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();
  const { protocols: testDefinitions } = useTestProtocols();

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Build navigation items with dynamic test protocols from SportConfig
  const groupedItems = useMemo(() => {
    // Build test navigation items from sport-specific protocols
    const testItems: NavigationItem[] = testDefinitions.map(test => ({
      id: `test-${test.id}`,
      label: test.name,
      href: `/testing/${test.id}`,
      icon: Target,
      section: 'Tester',
      keywords: [test.shortName?.toLowerCase() || '', test.category, 'test', test.testNumber.toString()],
    }));

    // Combine static items with dynamic test items
    const allItems = [...staticNavigationItems, ...testItems];
    return groupItemsBySection(allItems);
  }, [testDefinitions]);

  // Listen for keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const handleSelect = useCallback((href: string) => {
    setOpen(false);
    navigate(href);
  }, [navigate, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Søk etter sider, funksjoner..." />
      <CommandList>
        <CommandEmpty>Ingen resultater funnet.</CommandEmpty>

        {Object.entries(groupedItems).map(([section, items]) => (
          <CommandGroup key={section} heading={section}>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => handleSelect(item.href)}
                >
                  <Icon size={16} style={{ opacity: 0.7 }} />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
