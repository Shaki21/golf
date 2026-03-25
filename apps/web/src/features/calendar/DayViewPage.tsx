/**
 * Day View Page
 *
 * Archetype: C - Dashboard/Calendar Page
 * Purpose: Entry point for the Decision Engine Day View
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DayViewExecution } from './day-view';
import { useScreenView } from '../../analytics/useScreenView';

export const DayViewPage: React.FC = () => {
  useScreenView('Kalender-Dag');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Parse date from query params or use today
  const dateParam = searchParams.get('date');
  const initialDate = dateParam ? new Date(dateParam) : new Date();

  // Handle navigation within day view
  const handleNavigate = (direction: -1 | 0 | 1, goToToday = false) => {
    if (goToToday) {
      navigate('/kalender/dag');
    } else {
      const newDate = new Date(initialDate);
      newDate.setDate(newDate.getDate() + direction);
      navigate(`/kalender/dag?date=${newDate.toISOString().split('T')[0]}`);
    }
  };

  // Handle back to calendar
  const handleBack = () => {
    navigate('/kalender');
  };

  return (
    <div className="h-[calc(100vh-64px)]">
      <DayViewExecution
        date={initialDate}
        onNavigate={handleNavigate}
        onBack={handleBack}
      />
    </div>
  );
};

export default DayViewPage;
