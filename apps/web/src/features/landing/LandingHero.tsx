/**
 * LandingHero.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Full-viewport hero section for landing/welcome pages.
 *
 * Design principles:
 * - Semantic tokens only (no raw hex/rgb values)
 * - Clear visual hierarchy: Tagline > Headline > Description > CTAs
 * - Touch-friendly targets (44px minimum)
 * - Responsive: stacked on mobile, side-by-side on desktop
 * - No decorative gradients (per UI Canon v1.2)
 */

import React from 'react';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';

interface Feature {
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Icon (SVG element or React node) */
  icon?: React.ReactNode;
}

interface FooterLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  /** Footer link sections */
  sections?: FooterSection[];
  /** Contact information */
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  /** Social media links */
  social?: Array<{
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube';
    href: string;
  }>;
  /** Copyright text */
  copyright?: string;
}

interface LandingHeroProps {
  /** Small tagline/label above headline */
  tagline?: string;
  /** Main headline */
  headline: string;
  /** Highlighted part of headline (rendered in brand color) */
  headlineHighlight?: string;
  /** Supporting description text */
  description?: string;
  /** Primary CTA button */
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary CTA button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Optional hero image/illustration */
  heroImage?: React.ReactNode;
  /** Navigation items (optional) */
  navigation?: Array<{
    label: string;
    onClick: () => void;
    isActive?: boolean;
  }>;
  /** User menu (for logged-in state) */
  userMenu?: React.ReactNode;
  /** Features section */
  features?: {
    title?: string;
    subtitle?: string;
    items: Feature[];
  };
  /** Footer section */
  footer?: FooterProps;
}

const LandingHero: React.FC<LandingHeroProps> = ({
  tagline,
  headline,
  headlineHighlight,
  description,
  primaryAction,
  secondaryAction,
  heroImage,
  navigation,
  userMenu,
  features,
  footer,
}) => {
  // Social media icons
  const getSocialIcon = (platform: string) => {
    const icons: Record<string, React.ReactNode> = {
      facebook: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      instagram: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      twitter: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      linkedin: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      youtube: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    };
    return icons[platform] || null;
  };
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with navigation */}
      {(navigation || userMenu) && (
        <header className="py-4 px-6 border-b border-tier-border-default">
          <nav className="flex items-center justify-between max-w-[1536px] mx-auto w-full">
            {/* Logo area */}
            <div className="shrink-0">
              <span className="text-xl font-bold text-tier-navy tracking-tight">TIER Golf</span>
            </div>

            {/* Navigation links */}
            {navigation && (
              <div className="flex items-center gap-1">
                {navigation.map((item, index) => (
                  <button
                    key={index}
                    className={`inline-flex items-center h-11 px-4 text-sm font-medium bg-transparent border-none rounded cursor-pointer transition-colors ${
                      item.isActive
                        ? 'text-tier-navy bg-tier-navy/10'
                        : 'text-tier-text-secondary hover:text-tier-navy hover:bg-tier-surface-base'
                    }`}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* User menu */}
            {userMenu && <div className="shrink-0">{userMenu}</div>}
          </nav>
        </header>
      )}

      {/* Main hero content */}
      <div className="flex-1 flex items-center justify-center py-8 px-6 max-w-[1536px] mx-auto w-full gap-8 max-md:flex-col max-md:text-center">
        {/* Text content */}
        <div className="flex-1 max-w-[640px]">
          {/* Tagline */}
          {tagline && (
            <p className="text-sm font-semibold text-tier-navy uppercase tracking-widest mb-3">{tagline}</p>
          )}

          {/* Headline */}
          <PageTitle className="text-4xl md:text-5xl leading-tight font-bold text-tier-navy mb-4 tracking-tight">
            {headlineHighlight ? (
              <>
                {headline.split(headlineHighlight)[0]}
                <span className="text-tier-navy">{headlineHighlight}</span>
                {headline.split(headlineHighlight)[1]}
              </>
            ) : (
              headline
            )}
          </PageTitle>

          {/* Description */}
          {description && (
            <p className="text-base leading-relaxed text-tier-text-secondary mb-6 max-w-[520px] max-md:mx-auto">{description}</p>
          )}

          {/* CTAs */}
          {(primaryAction || secondaryAction) && (
            <div className="flex items-center gap-4 flex-wrap max-md:justify-center">
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className="inline-flex items-center justify-center h-12 px-6 bg-tier-navy text-white border-none rounded font-semibold cursor-pointer transition-all shadow-sm hover:opacity-90 active:scale-[0.98]"
                >
                  {primaryAction.label}
                </button>
              )}
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center h-12 px-4 bg-transparent text-tier-navy border-none rounded font-semibold cursor-pointer transition-colors gap-2 hover:bg-tier-surface-base"
                >
                  {secondaryAction.label}
                  <span className="text-sm" aria-hidden="true">→</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hero image/illustration */}
        {heroImage && (
          <div className="flex-1 flex items-center justify-center max-w-[560px]">
            {heroImage}
          </div>
        )}
      </div>

      {/* Features Section */}
      {features && features.items.length > 0 && (
        <section className="bg-tier-surface-base border-t border-tier-border-default py-10 px-6">
          <div className="max-w-[1536px] mx-auto">
            {/* Section header */}
            {(features.title || features.subtitle) && (
              <div className="text-center mb-8">
                {features.title && (
                  <SectionTitle className="text-2xl md:text-3xl font-bold text-tier-navy mb-3 tracking-tight">{features.title}</SectionTitle>
                )}
                {features.subtitle && (
                  <p className="text-base leading-relaxed text-tier-text-secondary max-w-[600px] mx-auto">{features.subtitle}</p>
                )}
              </div>
            )}

            {/* Features grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
              {features.items.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  {/* Icon */}
                  {feature.icon && (
                    <div className="flex items-center justify-center w-12 h-12 bg-tier-navy/10 rounded-lg text-tier-navy mb-4">
                      {feature.icon}
                    </div>
                  )}
                  {/* Content */}
                  <SubSectionTitle className="text-lg font-semibold text-tier-navy mb-2">{feature.title}</SubSectionTitle>
                  <p className="text-sm leading-relaxed text-tier-text-secondary m-0">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      {footer && (
        <footer className="bg-tier-navy text-white py-10 px-6 pb-6">
          <div className="max-w-[1536px] mx-auto">
            {/* Main footer content */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 mb-8">
              {/* Brand column */}
              <div className="max-w-[280px]">
                <span className="block text-xl font-bold text-white tracking-tight mb-3">TIER Golf</span>
                <p className="text-sm leading-relaxed text-white/80 mb-4">
                  Systematisk talentutvikling for ambisiøse golfspillere.
                </p>
                {/* Social links */}
                {footer.social && footer.social.length > 0 && (
                  <div className="flex items-center gap-3">
                    {footer.social.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-white text-tier-navy rounded-full transition-all hover:scale-105 hover:opacity-90"
                        aria-label={item.platform}
                      >
                        {getSocialIcon(item.platform)}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Link sections */}
              {footer.sections && footer.sections.length > 0 && (
                <div className="flex gap-8 flex-wrap">
                  {footer.sections.map((section, index) => (
                    <div key={index} className="min-w-[140px]">
                      <CardTitle className="text-xs font-semibold text-white uppercase tracking-widest mb-4">{section.title}</CardTitle>
                      <ul className="list-none p-0 m-0 flex flex-col gap-2">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            {link.href ? (
                              <a href={link.href} className="inline-block text-sm leading-relaxed text-white/80 no-underline py-1 transition-opacity hover:opacity-100">
                                {link.label}
                              </a>
                            ) : (
                              <button
                                onClick={link.onClick}
                                className="inline-block text-sm leading-relaxed text-white/80 bg-transparent border-none py-1 cursor-pointer text-left transition-opacity hover:opacity-100"
                              >
                                {link.label}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact column */}
              {footer.contact && (
                <div className="min-w-[200px]">
                  <CardTitle className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Kontakt</CardTitle>
                  <div className="flex flex-col gap-3">
                    {footer.contact.email && (
                      <a href={`mailto:${footer.contact.email}`} className="flex items-center gap-2 text-sm leading-relaxed text-white/80 no-underline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {footer.contact.email}
                      </a>
                    )}
                    {footer.contact.phone && (
                      <a href={`tel:${footer.contact.phone}`} className="flex items-center gap-2 text-sm leading-relaxed text-white/80 no-underline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {footer.contact.phone}
                      </a>
                    )}
                    {footer.contact.address && (
                      <span className="flex items-center gap-2 text-sm leading-relaxed text-white/80">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {footer.contact.address}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer bottom */}
            <div className="border-t border-white/20 pt-6">
              <p className="text-xs leading-relaxed text-white/60 m-0 text-center">
                {footer.copyright || `© ${new Date().getFullYear()} TIER Golf. Alle rettigheter reservert.`}
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default LandingHero;
