// @ts-nocheck
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, User, Users, Target, Calendar, ClipboardList,
  TrendingUp, Activity, Dumbbell, FileText, Archive, BarChart3, LogOut, BookOpen,
  LineChart, Award, MessageSquare, Video, Bell, Settings, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Separator,
  ScrollArea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../shadcn';
import { cn } from 'lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  path: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  badge?: string;
}

interface NavSectionProps {
  items: NavItem[];
  currentPath: string;
}

// ============================================================================
// NAV ITEMS CONFIGURATION
// ============================================================================

const mainNavItems: NavItem[] = [
  { path: '/', icon: Home, label: 'Oversikt' },
  { path: '/profil', icon: User, label: 'Brukerprofil' },
  { path: '/trenerteam', icon: Users, label: 'Trenerteam' },
  { path: '/maalsetninger', icon: Target, label: 'Målsetninger' },
  { path: '/aarsplan', icon: Calendar, label: 'Årsplan' },
];

const trainingNavItems: NavItem[] = [
  { path: '/testprotokoll', icon: ClipboardList, label: 'Testprotokoll' },
  { path: '/testresultater', icon: TrendingUp, label: 'Testresultater' },
  { path: '/treningsprotokoll', icon: Activity, label: 'Treningsprotokoll' },
  { path: '/training/statistics', icon: BarChart3, label: 'Treningsstatistikk' },
];

const progressNavItems: NavItem[] = [
  { path: '/progress', icon: LineChart, label: 'Fremdrift', badge: 'NEW' },
  { path: '/achievements', icon: Award, label: 'Prestasjoner', badge: 'NEW' },
  { path: '/videos', icon: Video, label: 'Videoer', badge: 'NEW' },
];

const resourceNavItems: NavItem[] = [
  { path: '/oevelser', icon: Dumbbell, label: 'Øvelser' },
  { path: '/ovelsesbibliotek', icon: BookOpen, label: 'Øvelsesbibliotek' },
  { path: '/kalender', icon: Calendar, label: 'Kalender' },
  { path: '/notater', icon: FileText, label: 'Notater' },
  { path: '/arkiv', icon: Archive, label: 'Arkiv' },
];

// ============================================================================
// NAV ITEM COMPONENT
// ============================================================================

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({ item, isActive }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
        "hover:bg-white/10",
        isActive
          ? "bg-white/15 text-white"
          : "text-white/70 hover:text-white"
      )}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge className="bg-achievement text-white text-[10px] px-1.5 py-0 border-0">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
};

// ============================================================================
// NAV SECTION COMPONENT
// ============================================================================

interface NavSectionComponentProps {
  title?: string;
  items: NavItem[];
  currentPath: string;
}

const NavSection: React.FC<NavSectionComponentProps> = ({ title, items, currentPath }) => (
  <div className="space-y-1">
    {title && (
      <p className="px-4 py-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
        {title}
      </p>
    )}
    {items.map((item) => (
      <NavItemComponent
        key={item.path}
        item={item}
        isActive={currentPath === item.path}
      />
    ))}
  </div>
);

// ============================================================================
// MAIN NAVIGATION COMPONENT
// ============================================================================

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Coach-specific items
  const coachNavItems: NavItem[] = user?.role === 'coach' ? [
    { path: '/coach/modification-requests', icon: MessageSquare, label: 'Planendringer', badge: 'NEW' },
  ] : [];

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <nav className="w-60 min-h-screen bg-ak-primary fixed left-0 top-0 flex flex-col">
      {/* Logo Area */}
      <div className="p-4 pb-2">
        <Link to="/" className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">TIER Golf</span>
        </Link>
      </div>

      <Separator className="bg-white/10 my-2" />

      {/* Scrollable Nav Content */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-6 py-2">
          {/* Main Navigation */}
          <NavSection items={mainNavItems} currentPath={location.pathname} />

          {/* Training Section */}
          <NavSection title="Trening" items={trainingNavItems} currentPath={location.pathname} />

          {/* Progress Section */}
          <NavSection title="Utvikling" items={progressNavItems} currentPath={location.pathname} />

          {/* Resources Section */}
          <NavSection title="Ressurser" items={resourceNavItems} currentPath={location.pathname} />

          {/* Coach Section */}
          {coachNavItems.length > 0 && (
            <NavSection title="Trener" items={coachNavItems} currentPath={location.pathname} />
          )}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-white/20 text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Min konto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profil')}>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/innstillinger')}>
                <Settings className="w-4 h-4 mr-2" />
                Innstillinger
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/varsler')}>
                <Bell className="w-4 h-4 mr-2" />
                Varsler
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-error">
                <LogOut className="w-4 h-4 mr-2" />
                Logg ut
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
