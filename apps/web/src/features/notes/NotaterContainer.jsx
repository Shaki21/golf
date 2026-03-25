import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Notater from './Notater';

/**
 * NotaterContainer - Full CRUD with API integration
 * Handles data fetching and passes handlers to Notater component
 */
const NotaterContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);

  // Map API response to frontend format
  const mapNoteFromAPI = (apiNote) => ({
    id: apiNote.id,
    title: apiNote.title,
    content: apiNote.content,
    date: apiNote.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    tags: apiNote.tags || [],
    pinned: apiNote.isPinned || false,
    mood: apiNote.mood || 4,
    sharedWithCoach: apiNote.sharedWithCoach || false,
    category: apiNote.category,
  });

  // Map frontend format to API format
  const mapNoteToAPI = (frontendNote) => ({
    title: frontendNote.title,
    content: frontendNote.content,
    tags: frontendNote.tags || [],
    isPinned: frontendNote.pinned || false,
    mood: frontendNote.mood,
    sharedWithCoach: frontendNote.sharedWithCoach || false,
    category: frontendNote.tags?.[0] || null,
  });

  const fetchNotes = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const response = await apiClient.get('/api/v1/notes');
      const mappedNotes = (response.data || []).map(mapNoteFromAPI);
      setNotes(mappedNotes);
      setState('idle');
    } catch (err) {
      console.error('Error fetching notes:', err);
      if (err.response?.status === 404) {
        setNotes([]);
        setState('idle');
      } else {
        setError(err);
        setState('error');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, fetchNotes]);

  // Create note
  const handleCreateNote = async (noteData) => {
    try {
      const response = await apiClient.post('/api/v1/notes', mapNoteToAPI(noteData));
      const newNote = mapNoteFromAPI(response.data);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  };

  // Update note
  const handleUpdateNote = async (noteId, noteData) => {
    try {
      const response = await apiClient.put(`/api/v1/notes/${noteId}`, mapNoteToAPI(noteData));
      const updatedNote = mapNoteFromAPI(response.data);
      setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await apiClient.delete(`/api/v1/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  // Toggle pin
  const handleTogglePin = async (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      await handleUpdateNote(noteId, { ...note, pinned: !note.pinned });
    }
  };

  // Toggle share with coach
  const handleToggleShare = async (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      await handleUpdateNote(noteId, { ...note, sharedWithCoach: !note.sharedWithCoach });
    }
  };

  if (state === 'loading') {
    return <LoadingState message="Loading notes..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Could not load notes'}
        onRetry={fetchNotes}
      />
    );
  }

  return (
    <Notater
      notes={notes}
      onCreateNote={handleCreateNote}
      onUpdateNote={handleUpdateNote}
      onDeleteNote={handleDeleteNote}
      onTogglePin={handleTogglePin}
      onToggleShare={handleToggleShare}
    />
  );
};

export default NotaterContainer;
