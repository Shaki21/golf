/**
 * Player Booking Page - TIER Golf
 * Design System v3.0 - Premium Light
 *
 * Allows players to:
 * - View coach availability
 * - Request booking for available slots
 * - View and manage their bookings
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { CalendarSkeleton, ListPageSkeleton } from '../../components/skeletons';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from '../../components/typography/Headings';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import {
  useCoachAvailability,
  useMyBookings,
  usePlayerCoaches,
  useCreateBooking,
  useCancelBooking
} from '../../hooks/useBookings';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import BookingRequestModal from './components/BookingRequestModal';
import BookingsList from './components/BookingsList';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';

const PlayerBookingPage: React.FC = () => {
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return {
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
    };
  });
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'availability' | 'my-bookings'>('availability');
  const [bookingToCancel, setBookingToCancel] = useState<{id: string, reason?: string} | null>(null);

  // Fetch data
  const { coaches, loading: coachesLoading, error: coachesError } = usePlayerCoaches();
  const { availability, loading: availabilityLoading, error: availabilityError, refetch: refetchAvailability } =
    useCoachAvailability(selectedCoach || '', dateRange);
  const { bookings, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useMyBookings();
  const { createBooking, loading: creatingBooking } = useCreateBooking();
  const { cancelBooking, loading: cancellingBooking } = useCancelBooking();

  // Select first coach by default
  React.useEffect(() => {
    if (coaches.length > 0 && !selectedCoach) {
      setSelectedCoach(coaches[0].id);
    }
  }, [coaches, selectedCoach]);

  // Handle slot selection
  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  // Handle booking creation
  const handleCreateBooking = async (bookingData: any) => {
    try {
      await createBooking({
        ...bookingData,
        coachId: selectedCoach,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        date: selectedSlot.date,
      });
      setShowBookingModal(false);
      setSelectedSlot(null);
      refetchAvailability();
      refetchBookings();
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string, reason?: string): Promise<void> => {
    setBookingToCancel({ id: bookingId, reason });
  };

  // Confirm booking cancellation
  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      await cancelBooking(bookingToCancel.id, bookingToCancel.reason);
      refetchBookings();
      refetchAvailability();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setBookingToCancel(null);
    }
  };

  // Loading state
  if (coachesLoading) {
    return <CalendarSkeleton />;
  }

  // Error state
  if (coachesError) {
    return (
      <ErrorState
        message={coachesError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // No coaches found
  if (coaches.length === 0) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Book session"
          subtitle="Book training sessions with your coach"
          helpText="Book and manage training sessions with your coach. See available slots, choose a time and send a booking request. Manage your existing bookings, cancel or change sessions. Get an overview of upcoming and past sessions."
          actions={null}
        />
        <div className="p-6">
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <User size={48} className="text-tier-text-secondary mx-auto mb-4" />
            <SubSectionTitle style={{ marginBottom: '0.5rem' }}>
              No coaches found
            </SubSectionTitle>
            <p className="text-tier-text-secondary mb-4">
              You must be connected to a coach to book sessions.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/mer/trenerteam'}>
              Go to Coach Team
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedCoachData = coaches.find((c: any) => c.id === selectedCoach);

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Book session"
        subtitle="Book training sessions with your coach"
        helpText="Book and manage training sessions with your coach. See available slots, choose a time and send a booking request. Manage your existing bookings, cancel or change sessions. Get an overview of upcoming and past sessions."
        actions={null}
      />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-tier-border-default">
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'availability'
                ? 'text-tier-navy border-b-2 border-tier-navy'
                : 'text-tier-text-secondary hover:text-tier-navy'
            }`}
          >
            <Calendar size={18} className="inline mr-2" />
            Available slots
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'my-bookings'
                ? 'text-tier-navy border-b-2 border-tier-navy'
                : 'text-tier-text-secondary hover:text-tier-navy'
            }`}
          >
            <CheckCircle2 size={18} className="inline mr-2" />
            My bookings
            {bookings.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-tier-warning text-tier-navy text-xs rounded-full">
                {bookings.filter((b: any) => b.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <>
            {/* Coach Selector */}
            <div className="bg-white rounded-xl border border-tier-border-default p-4 mb-6">
              <label className="block text-sm font-medium text-tier-navy mb-2">
                Select coach
              </label>
              <select
                value={selectedCoach || ''}
                onChange={(e) => setSelectedCoach(e.target.value)}
                className="w-full px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy"
              >
                {coaches.map((coach: any) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.firstName} {coach.lastName}
                  </option>
                ))}
              </select>
              {selectedCoachData && (
                <p className="mt-2 text-sm text-tier-text-secondary">
                  {selectedCoachData.email}
                </p>
              )}
            </div>

            {/* Availability Calendar */}
            {availabilityLoading ? (
              <CalendarSkeleton />
            ) : availabilityError ? (
              <div className="bg-white rounded-xl border border-tier-border-default p-8">
                <ErrorState message={availabilityError} onRetry={refetchAvailability} />
              </div>
            ) : (
              <AvailabilityCalendar
                availability={availability}
                onSlotSelect={handleSlotSelect}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
          </>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'my-bookings' && (
          <>
            {bookingsLoading ? (
              <ListPageSkeleton items={3} />
            ) : bookingsError ? (
              <div className="bg-white rounded-xl border border-tier-border-default p-8">
                <ErrorState message={bookingsError} onRetry={refetchBookings} />
              </div>
            ) : (
              <BookingsList
                bookings={bookings}
                onCancel={handleCancelBooking}
                loading={cancellingBooking}
              />
            )}
          </>
        )}
      </div>

      {/* Booking Request Modal */}
      {showBookingModal && selectedSlot && (
        <BookingRequestModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          slot={selectedSlot}
          coach={selectedCoachData}
          onSubmit={handleCreateBooking}
          loading={creatingBooking}
        />
      )}

      {/* Cancel Booking Confirmation Modal */}
      {bookingToCancel && (
        <DeleteConfirmModal
          isOpen={!!bookingToCancel}
          onClose={() => setBookingToCancel(null)}
          onConfirm={handleConfirmCancel}
          title="Cancel booking"
          itemName="this session"
          message="Are you sure you want to cancel this booking?"
          confirmLabel="Cancel booking"
        />
      )}
    </div>
  );
};

export default PlayerBookingPage;
