import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ExerciseLibrary from './ExerciseLibrary';

// Demo exercises for when API is not available
const demoExercises = [
  {
    id: '1',
    name: 'Driver - Teknikk',
    category: 'teknikk',
    subcategory: 'langspill',
    description: 'Grunnleggende driver-teknikk med fokus på sving og kontakt',
    duration: 30,
    difficulty: 'medium',
    equipment: ['Driver', 'Tee', 'Baller']
  },
  {
    id: '2',
    name: 'Putting - Korte putter',
    category: 'golfslag',
    subcategory: 'putting',
    description: 'Putter under 3 meter med fokus på linje og hastighet',
    duration: 20,
    difficulty: 'easy',
    equipment: ['Putter', 'Baller']
  },
  {
    id: '3',
    name: 'Jern 7 - Kontroll',
    category: 'teknikk',
    subcategory: 'jernspill',
    description: 'Jernspill med 7-jern for presisjon og avstandskontroll',
    duration: 25,
    difficulty: 'medium',
    equipment: ['7-jern', 'Baller']
  },
  {
    id: '4',
    name: 'Chipping rundt green',
    category: 'golfslag',
    subcategory: 'kortspill',
    description: 'Chip-slag fra forskjellige posisjoner rundt green',
    duration: 30,
    difficulty: 'medium',
    equipment: ['Wedge', 'Baller']
  },
  {
    id: '5',
    name: 'Bunkerslag',
    category: 'golfslag',
    subcategory: 'bunker',
    description: 'Teknikk for å komme ut av greenside bunker',
    duration: 25,
    difficulty: 'hard',
    equipment: ['Sand Wedge', 'Baller']
  }
];

const ExerciseLibraryContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    if (user) {
      fetchExerciseLibrary();
    }
  }, [user]);

  const fetchExerciseLibrary = async () => {
    try {
      setState('loading');
      setError(null);
      // Use correct API endpoint
      const response = await apiClient.get('/exercises');
      const exercises = response.data?.data?.exercises || response.data?.exercises || response.data || [];
      setLibrary(Array.isArray(exercises) && exercises.length > 0 ? exercises : demoExercises);
      setState('idle');
    } catch (err) {
      console.error('Error fetching exercise library:', err);
      // Use demo data as fallback
      setLibrary(demoExercises);
      setState('idle');
    }
  };

  if (state === 'loading') {
    return <LoadingState message="Laster øvelsesbibliotek..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste øvelsesbibliotek'}
        onRetry={fetchExerciseLibrary}
      />
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        title="Tomt bibliotek"
        message="Øvelsesbiblioteket er tomt"
      />
    );
  }

  return <ExerciseLibrary exercises={library} />;
};

export default ExerciseLibraryContainer;
