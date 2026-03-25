/**
 * SessionPackages
 * Purchase and manage session packages
 *
 * Features:
 * - View available session packages
 * - Purchase session packages
 * - View owned packages and remaining sessions
 * - Use session from package
 * - Package expiration tracking
 */

import React, { useState, useCallback } from 'react';
import { useSessionPackages } from '../../hooks/useSessionPackages';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle } from '../../ui/components/typography';
import { track } from '../../analytics/track';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  section: 'flex flex-col gap-4',
  sectionTitle: 'text-lg font-semibold text-[var(--text-inverse)] m-0',
  packagesGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  packageCard: 'p-6 bg-surface rounded-xl border border-border hover:border-primary transition-all',
  popularBadge: 'inline-flex py-1 px-3 bg-primary/20 border border-primary rounded-lg text-primary text-xs font-semibold mb-2',
  packageName: 'text-xl font-bold text-[var(--text-inverse)] mb-2',
  packagePrice: 'text-3xl font-bold text-primary mb-1',
  pricePerSession: 'text-sm text-[var(--video-text-secondary)] mb-4',
  packageFeatures: 'flex flex-col gap-2 mb-4',
  feature: 'flex items-center gap-2 text-sm text-[var(--text-inverse)]',
  featureIcon: 'text-tier-success',
  purchaseButton: 'w-full py-2 px-4 bg-primary border-none rounded-lg text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity',
  ownedPackagesList: 'flex flex-col gap-3',
  ownedPackageCard: 'p-4 bg-surface rounded-xl border border-border flex items-center gap-4',
  packageIcon: 'text-3xl',
  packageInfo: 'flex-1',
  packageTitle: 'text-sm font-semibold text-[var(--text-inverse)] mb-1',
  packageDetails: 'text-xs text-[var(--video-text-secondary)]',
  sessionsRemaining: 'text-right',
  sessionsCount: 'text-2xl font-bold text-primary',
  sessionsLabel: 'text-xs text-[var(--video-text-secondary)]',
  expiryWarning: 'text-xs text-yellow-500 mt-1',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
  modal: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
  modalCard: 'w-full max-w-md bg-surface rounded-xl border border-border p-6 flex flex-col gap-4',
  modalTitle: 'text-lg font-semibold text-[var(--text-inverse)] m-0',
  modalActions: 'flex gap-2 justify-end',
};

// ═══════════════════════════════════════════
// PACKAGE DEFINITIONS
// ═══════════════════════════════════════════

const AVAILABLE_PACKAGES = [
  {
    id: 'starter-5',
    name: 'Starter Pack',
    sessions: 5,
    price: 2000,
    popular: false,
    features: [
      '5 training sessions',
      'Valid for 3 months',
      'Book anytime',
      'Flexible scheduling',
    ],
  },
  {
    id: 'standard-10',
    name: 'Standard Pack',
    sessions: 10,
    price: 3500,
    popular: true,
    features: [
      '10 training sessions',
      'Valid for 6 months',
      'Best value',
      'Priority booking',
      'Free video analysis',
    ],
  },
  {
    id: 'premium-20',
    name: 'Premium Pack',
    sessions: 20,
    price: 6000,
    popular: false,
    features: [
      '20 training sessions',
      'Valid for 12 months',
      'Maximum savings',
      'Priority booking',
      'Free video analysis',
      'Monthly progress reports',
    ],
  },
];

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function SessionPackages({ className = '' }) {
  const {
    ownedPackages,
    loading,
    error,
    purchasePackage,
    refresh,
  } = useSessionPackages();

  const [purchasing, setPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate price per session
  const getPricePerSession = (pkg) => {
    return Math.round(pkg.price / pkg.sessions);
  };

  // Check if package is expiring soon (within 30 days)
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  // Check if package is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Handle purchase package
  const handlePurchaseClick = useCallback((pkg) => {
    setSelectedPackage(pkg);
    setShowConfirmModal(true);
  }, []);

  // Confirm purchase
  const handleConfirmPurchase = useCallback(async () => {
    if (!selectedPackage) return;

    setPurchasing(true);

    try {
      await purchasePackage({
        packageType: selectedPackage.id,
        totalSessions: selectedPackage.sessions,
        price: selectedPackage.price,
      });

      track('session_package_purchased', {
        screen: 'SessionPackages',
        packageType: selectedPackage.id,
        sessions: selectedPackage.sessions,
        price: selectedPackage.price,
      });

      setShowConfirmModal(false);
      setSelectedPackage(null);
      alert('Session package purchased successfully!');
    } catch (err) {
      console.error('Failed to purchase package:', err);
      alert(err.response?.data?.message || 'Failed to purchase package');
    } finally {
      setPurchasing(false);
    }
  }, [selectedPackage, purchasePackage]);

  // Loading state
  if (loading && ownedPackages.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Loading packages..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Failed to load packages"
          description={error}
          action={<Button variant="primary" onClick={refresh}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <div className={`${tw.container} ${className}`}>
        {/* Owned Packages */}
        {ownedPackages.length > 0 && (
          <div className={tw.section}>
            <SectionTitle style={{ marginBottom: 0 }} className={tw.sectionTitle}>My Session Packages</SectionTitle>

            <div className={tw.ownedPackagesList}>
              {ownedPackages.map((pkg) => {
                const expired = isExpired(pkg.expiresAt);
                const expiringSoon = isExpiringSoon(pkg.expiresAt);

                return (
                  <div key={pkg.id} className={tw.ownedPackageCard}>
                    <div className={tw.packageIcon}>[ticket]</div>
                    <div className={tw.packageInfo}>
                      <div className={tw.packageTitle}>{pkg.packageType}</div>
                      <div className={tw.packageDetails}>
                        Purchased {new Date(pkg.createdAt).toLocaleDateString('nb-NO')}
                        {pkg.expiresAt && (
                          <> · Expires {new Date(pkg.expiresAt).toLocaleDateString('nb-NO')}</>
                        )}
                      </div>
                      {expiringSoon && !expired && (
                        <div className={tw.expiryWarning}>
                          alert-triangle️ Expiring soon
                        </div>
                      )}
                      {expired && (
                        <div className={tw.expiryWarning}>
                          Expired
                        </div>
                      )}
                    </div>
                    <div className={tw.sessionsRemaining}>
                      <div className={tw.sessionsCount}>{pkg.remainingSessions}</div>
                      <div className={tw.sessionsLabel}>
                        of {pkg.totalSessions} sessions
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Packages */}
        <div className={tw.section}>
          <SectionTitle style={{ marginBottom: 0 }} className={tw.sectionTitle}>Purchase Session Package</SectionTitle>

          <div className={tw.packagesGrid}>
            {AVAILABLE_PACKAGES.map((pkg) => (
              <div key={pkg.id} className={tw.packageCard}>
                {pkg.popular && (
                  <div className={tw.popularBadge}> Most Popular</div>
                )}

                <div className={tw.packageName}>{pkg.name}</div>

                <div className={tw.packagePrice}>{formatCurrency(pkg.price)}</div>

                <div className={tw.pricePerSession}>
                  {formatCurrency(getPricePerSession(pkg))} per session
                </div>

                <div className={tw.packageFeatures}>
                  {pkg.features.map((feature, index) => (
                    <div key={index} className={tw.feature}>
                      <span className={tw.featureIcon}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePurchaseClick(pkg)}
                  className={tw.purchaseButton}
                >
                  Purchase Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showConfirmModal && selectedPackage && (
        <div className={tw.modal} onClick={() => setShowConfirmModal(false)}>
          <div className={tw.modalCard} onClick={(e) => e.stopPropagation()}>
            <SubSectionTitle style={{ marginBottom: 0 }} className={tw.modalTitle}>Confirm Purchase</SubSectionTitle>

            <div>
              <p className="text-sm text-[var(--text-inverse)] mb-2">
                You are about to purchase:
              </p>
              <div className="p-4 bg-surface-elevated rounded-lg">
                <div className="font-semibold text-[var(--text-inverse)] mb-1">
                  {selectedPackage.name}
                </div>
                <div className="text-sm text-[var(--video-text-secondary)]">
                  {selectedPackage.sessions} training sessions
                </div>
                <div className="text-xl font-bold text-primary mt-2">
                  {formatCurrency(selectedPackage.price)}
                </div>
              </div>
            </div>

            <div className={tw.modalActions}>
              <Button
                variant="ghost"
                onClick={() => setShowConfirmModal(false)}
                disabled={purchasing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmPurchase}
                disabled={purchasing}
                loading={purchasing}
              >
                {purchasing ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionPackages;
