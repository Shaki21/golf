/**
 * @deprecated This file is kept for reference only
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 *
 * DO NOT USE THIS COMPONENT IN NEW CODE
 *
 * For logo usage, see:
 * - /apps/web/src/components/branding/AKLogo.jsx (component)
 *
 * This showcase contains old patterns including "ACADEMY" wordmark
 * which is no longer part of the brand identity.
 */

import React, { useState } from 'react';
import { SectionTitle, SubSectionTitle } from '../typography';

const colors = {
  forest: '#4A7C59',
  forestLight: '#5B9A6F',
  foam: '#E8F0ED',
  ivory: '#FAF9F7',
  gold: 'rgb(var(--tier-gold))',
  white: 'rgb(var(--tier-white))',
  textPrimary: '#2C2C2E',
  textSecondary: '#8E8E93',
  border: '#E5E5E5'
};

// TIER Golf Logo Component with automatic sizing
const TIERGolfLogo = ({ variant = 'medium', size, color = colors.forest, style = {} }) => {
  const sizeMap = { icon: 24, small: 32, medium: 44, large: 56, xlarge: 80, hero: 120 };
  const computedSize = size || sizeMap[variant] || sizeMap.medium;
  const aspectRatio = 196.41 / 204.13;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 196.41 204.13"
      width={computedSize * aspectRatio}
      height={computedSize}
      fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <path d="M170.3,185.77c-6.31-6.32-12.14-13.2-17.5-20.66l-34.14-46.91,2.13-1.92-20.32,17.03,32.11,45.71,9.32,13.77.72,2.16c-.19,1.72-1.53,2.72-4.02,3.01l-7.17.43v5.74h64.98v-5.74c-10.61-1.34-19.32-5.55-26.11-12.62ZM129.42,66.56v5.74l8.03.72,3.59.71c1.91.86,2.82,2.06,2.73,3.59.09,1.72-1.96,4.59-6.17,8.61l-8.18,8.46-31.7,28.98V0l-46.19,14.2v5.74l6.31-.14c8.51.38,13.1,3.87,13.77,10.47l.29,6.17v120.84l25.82-21.66,2.75-2.31,20.32-17.03,22.4-20.31,13.06-10.9c7.93-6.41,16.4-10.33,25.39-11.77l9.18-1v-5.74h-61.4ZM97.72,129.39v6.23l2.75-2.31-2.75-3.92ZM71.25,178.91l-37.82,25.03c1.44-.07,2.9-.21,4.36-.44,6.84-1.28,20.73-6.23,34.37-25.19l-.91.6ZM33.43,203.94c.15.01,1.74.05,4.36-.44-1.46.23-2.92.37-4.36.44ZM71.9,113.67l-15.52,5.97c-16.26,6.6-28.74,13.1-37.44,19.51-5.93,4.3-10.6,9.2-13.99,14.7C1.56,159.35-.09,165.54,0,172.42c.1,9.38,2.99,16.96,8.68,22.74,5.69,5.79,13.36,8.73,23.02,8.82.58,0,1.14-.02,1.72-.04h.01l37.82-25.03c-21.68,14.17-34.35,4.73-34.35,4.73-1.73-1.06-3.32-2.44-4.77-4.19-3.34-4.11-4.97-9.08-4.87-14.91-.39-13.68,9.94-24.92,30.98-33.71l13.66-5.65.26-.11v-11.5l-.26.1ZM46.07,70c-2.91.53-13.6,2.32-16.37,3.22-7.17,2.39-13.15,5.98-17.93,10.76-5.83,5.83-8.75,11.96-8.75,18.36-.19,3.92.84,7.44,3.09,10.54,2.24,3.11,5.61,4.57,10.11,4.38,8.89,0,13.36-6.09,13.56-15.94l-.36-5.92c-.44-5.91-2.7-15.76,16.65-25.4Z"/>
    </svg>
  );
};

// Full logo with wordmark
const TIERGolfLogoFull = ({ variant = 'medium', color = colors.forest }) => {
  const sizeMap = {
    small: { logo: 32, title: 14, subtitle: 9, gap: 8 },
    medium: { logo: 44, title: 18, subtitle: 11, gap: 10 },
    large: { logo: 56, title: 22, subtitle: 13, gap: 12 },
    xlarge: { logo: 80, title: 28, subtitle: 15, gap: 14 },
  };
  const sizes = sizeMap[variant] || sizeMap.medium;
  
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: sizes.gap }}>
      <TIERGolfLogo size={sizes.logo} color={color} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: sizes.title, fontWeight: 700, color, letterSpacing: '0.05em', lineHeight: 1.1 }}>AK GOLF</span>
        <span style={{ fontSize: sizes.subtitle, fontWeight: 600, color, opacity: 0.7, letterSpacing: '0.15em', lineHeight: 1.2 }}>ACADEMY</span>
      </div>
    </div>
  );
};

// Badge variant
const TIERGolfLogoBadge = ({ size = 56, backgroundColor = colors.forest, logoColor = colors.white, borderRadius = 12 }) => (
  <div style={{ width: size, height: size, borderRadius, backgroundColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <TIERGolfLogo size={size * 0.6} color={logoColor} />
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('sizes');

  const sizes = [
    { name: 'icon', value: 24, use: 'Tab bar, inline' },
    { name: 'small', value: 32, use: 'Compact UI' },
    { name: 'medium', value: 44, use: 'Navigation' },
    { name: 'large', value: 56, use: 'Headers' },
    { name: 'xlarge', value: 80, use: 'Feature sections' },
    { name: 'hero', value: 120, use: 'Splash screens' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.foam, fontFamily: "Inter, system-ui, sans-serif", maxWidth: 430, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ background: colors.forest, color: colors.white, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <TIERGolfLogo variant="medium" color={colors.white} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Design System</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Logo & Branding</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: colors.ivory, padding: 8, gap: 8, borderBottom: `1px solid ${colors.border}` }}>
        {['sizes', 'variants', 'usage'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none',
              backgroundColor: activeTab === tab ? colors.forest : 'transparent',
              color: activeTab === tab ? colors.white : colors.textSecondary,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
            }}
          >
            {tab === 'sizes' ? 'Størrelser' : tab === 'variants' ? 'Varianter' : 'Bruk'}
          </button>
        ))}
      </div>

      <main style={{ padding: 16 }}>

        {/* SIZES TAB */}
        {activeTab === 'sizes' && (
          <div>
            <SectionTitle style={{ fontSize: 17, fontWeight: 600, color: colors.textPrimary, margin: '0 0 8px' }}>Automatisk Størrelse</SectionTitle>
            <p style={{ fontSize: 13, color: colors.textSecondary, margin: '0 0 16px' }}>
              Bruk <code style={{ backgroundColor: colors.ivory, padding: '2px 6px', borderRadius: 4 }}>variant</code> prop for automatisk størrelse
            </p>

            <div style={{ backgroundColor: colors.ivory, borderRadius: 16, overflow: 'hidden' }}>
              {sizes.map((s, i) => (
                <div 
                  key={s.name}
                  style={{ 
                    display: 'flex', alignItems: 'center', padding: 16, gap: 16,
                    borderBottom: i < sizes.length - 1 ? `1px solid ${colors.border}` : 'none'
                  }}
                >
                  <div style={{ width: 80, display: 'flex', justifyContent: 'center' }}>
                    <TIERGolfLogo variant={s.name} color={colors.forest} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>{s.value}px · {s.use}</div>
                  </div>
                  <code style={{ fontSize: 11, color: colors.forest, backgroundColor: colors.foam, padding: '4px 8px', borderRadius: 6 }}>
                    variant="{s.name}"
                  </code>
                </div>
              ))}
            </div>

            {/* Custom Size */}
            <div style={{ marginTop: 16, backgroundColor: colors.ivory, borderRadius: 16, padding: 16 }}>
              <SubSectionTitle style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: '0 0 8px' }}>Egendefinert Størrelse</SubSectionTitle>
              <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 12px' }}>
                Bruk <code style={{ backgroundColor: colors.foam, padding: '2px 6px', borderRadius: 4 }}>size</code> prop for eksakt pikselverdi
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <TIERGolfLogo size={100} color={colors.gold} />
                <code style={{ fontSize: 12, color: colors.textSecondary }}>size={'{100}'} color="rgb(var(--tier-gold))"</code>
              </div>
            </div>
          </div>
        )}

        {/* VARIANTS TAB */}
        {activeTab === 'variants' && (
          <div>
            <SectionTitle style={{ fontSize: 17, fontWeight: 600, color: colors.textPrimary, margin: '0 0 16px' }}>Logo Varianter</SectionTitle>

            {/* Icon Only */}
            <div style={{ backgroundColor: colors.ivory, borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center' }}>
              <TIERGolfLogo variant="xlarge" color={colors.forest} />
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginTop: 12 }}>Icon Only</div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>Standard logo mark</div>
            </div>

            {/* Full Logo */}
            <div style={{ backgroundColor: colors.ivory, borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center' }}>
              <TIERGolfLogoFull variant="large" color={colors.forest} />
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginTop: 12 }}>Full Logo</div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>Med wordmark</div>
            </div>

            {/* Reversed */}
            <div style={{ background: `linear-gradient(135deg, ${colors.forest} 0%, ${colors.forestLight} 100%)`, borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center' }}>
              <TIERGolfLogoFull variant="large" color={colors.white} />
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.white, marginTop: 12 }}>Reversed</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>På mørk bakgrunn</div>
            </div>

            {/* Badge Variants */}
            <SubSectionTitle style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: '20px 0 12px' }}>Badge Varianter</SubSectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <TIERGolfLogoBadge size={56} backgroundColor={colors.forest} logoColor={colors.white} borderRadius={12} />
                <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 6 }}>Standard</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <TIERGolfLogoBadge size={56} backgroundColor={colors.gold} logoColor={colors.white} borderRadius={12} />
                <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 6 }}>Gold</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <TIERGolfLogoBadge size={56} backgroundColor={colors.forest} logoColor={colors.white} borderRadius={28} />
                <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 6 }}>Circle</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: colors.ivory, border: `2px solid ${colors.forest}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TIERGolfLogo size={34} color={colors.forest} />
                </div>
                <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 6 }}>Outline</div>
              </div>
            </div>

            {/* Color Variants */}
            <SubSectionTitle style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: '20px 0 12px' }}>Fargevarianter</SubSectionTitle>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { name: 'Forest', color: colors.forest, bg: colors.ivory },
                { name: 'Gold', color: colors.gold, bg: colors.ivory },
                { name: 'White', color: colors.white, bg: colors.forest },
                { name: 'Black', color: colors.textPrimary, bg: colors.ivory },
              ].map(v => (
                <div key={v.name} style={{ flex: 1, minWidth: 80, backgroundColor: v.bg, borderRadius: 12, padding: 12, textAlign: 'center', border: v.bg === colors.ivory ? `1px solid ${colors.border}` : 'none' }}>
                  <TIERGolfLogo variant="medium" color={v.color} />
                  <div style={{ fontSize: 10, color: v.bg === colors.forest ? colors.white : colors.textSecondary, marginTop: 6 }}>{v.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USAGE TAB */}
        {activeTab === 'usage' && (
          <div>
            <SectionTitle style={{ fontSize: 17, fontWeight: 600, color: colors.textPrimary, margin: '0 0 16px' }}>Brukseksempler</SectionTitle>

            {/* App Header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>APP HEADER</div>
              <div style={{ backgroundColor: colors.forest, borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <TIERGolfLogoFull variant="small" color={colors.white} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white }}>🔔</div>
                </div>
              </div>
            </div>

            {/* Tab Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>TAB BAR</div>
              <div style={{ backgroundColor: colors.ivory, borderRadius: 12, padding: 8, display: 'flex', justifyContent: 'space-around' }}>
                {['Hjem', 'Trening', 'Profil'].map((label, i) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 8 }}>
                    {i === 0 ? <TIERGolfLogo variant="icon" color={colors.forest} /> : 
                     <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: colors.border }} />}
                    <span style={{ fontSize: 10, color: i === 0 ? colors.forest : colors.textSecondary }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>CARD HEADER</div>
              <div style={{ backgroundColor: colors.ivory, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <TIERGolfLogoBadge size={40} borderRadius={10} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>TIER Golf</div>
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>Treningsprogram</div>
                  </div>
                </div>
                <div style={{ height: 60, backgroundColor: colors.foam, borderRadius: 8 }} />
              </div>
            </div>

            {/* Splash Screen */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>SPLASH SCREEN</div>
              <div style={{ background: `linear-gradient(180deg, ${colors.forest} 0%, ${colors.forestLight} 100%)`, borderRadius: 12, padding: 40, textAlign: 'center' }}>
                <TIERGolfLogo variant="hero" color={colors.white} />
                <div style={{ fontSize: 22, fontWeight: 700, color: colors.white, marginTop: 16, letterSpacing: 1 }}>AK GOLF</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 3 }}>ACADEMY</div>
              </div>
            </div>

            {/* Code Example */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>KODE</div>
              <div style={{ backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, fontFamily: 'monospace', fontSize: 11, color: '#A9DC76', overflow: 'auto' }}>
                <div style={{ color: '#78DCE8' }}>{'// Importer komponenten'}</div>
                <div><span style={{ color: '#FF6188' }}>import</span> {'{TIERGolfLogo}'} <span style={{ color: '#FF6188' }}>from</span> <span style={{ color: '#FFD866' }}>'./TIERGolfLogo'</span></div>
                <br />
                <div style={{ color: '#78DCE8' }}>{'// Bruk med variant (anbefalt)'}</div>
                <div>{'<TIERGolfLogo variant="medium" />'}</div>
                <br />
                <div style={{ color: '#78DCE8' }}>{'// Eller med eksakt størrelse'}</div>
                <div>{'<TIERGolfLogo size={64} color="rgb(var(--tier-gold))" />'}</div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
