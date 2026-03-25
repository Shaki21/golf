import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Skoleplan from './Skoleplan';

// Mock data for development/demo
const MOCK_FAG = [
  { id: '1', userId: '1', navn: 'Matematikk', larer: 'Hansen', rom: 'A101', farge: 'var(--category-spill)' },
  { id: '2', userId: '1', navn: 'Norsk', larer: 'Olsen', rom: 'B202', farge: 'var(--category-slag)' },
  { id: '3', userId: '1', navn: 'Engelsk', larer: 'Smith', rom: 'C303', farge: 'var(--achievement)' },
  { id: '4', userId: '1', navn: 'Naturfag', larer: 'Berg', rom: 'D404', farge: 'var(--course-purple)' },
  { id: '5', userId: '1', navn: 'Gym', larer: 'Pedersen', rom: 'Gym', farge: 'var(--status-error)' },
];

const MOCK_TIMER = [
  { id: 't1', fagId: '1', ukedag: 'mandag', startTid: '08:00', sluttTid: '09:30', fag: MOCK_FAG[0] },
  { id: 't2', fagId: '2', ukedag: 'mandag', startTid: '10:00', sluttTid: '11:30', fag: MOCK_FAG[1] },
  { id: 't3', fagId: '3', ukedag: 'tirsdag', startTid: '08:00', sluttTid: '09:30', fag: MOCK_FAG[2] },
  { id: 't4', fagId: '1', ukedag: 'tirsdag', startTid: '10:00', sluttTid: '11:30', fag: MOCK_FAG[0] },
  { id: 't5', fagId: '4', ukedag: 'onsdag', startTid: '08:00', sluttTid: '09:30', fag: MOCK_FAG[3] },
  { id: 't6', fagId: '2', ukedag: 'onsdag', startTid: '10:00', sluttTid: '11:30', fag: MOCK_FAG[1] },
  { id: 't7', fagId: '5', ukedag: 'torsdag', startTid: '08:00', sluttTid: '09:30', fag: MOCK_FAG[4] },
  { id: 't8', fagId: '3', ukedag: 'torsdag', startTid: '10:00', sluttTid: '11:30', fag: MOCK_FAG[2] },
  { id: 't9', fagId: '1', ukedag: 'fredag', startTid: '08:00', sluttTid: '09:30', fag: MOCK_FAG[0] },
  { id: 't10', fagId: '4', ukedag: 'fredag', startTid: '10:00', sluttTid: '11:30', fag: MOCK_FAG[3] },
];

const today = new Date();
const MOCK_OPPGAVER = [
  { id: 'o1', fagId: '1', tittel: 'Kapittel 5 oppgaver 1-20', beskrivelse: 'Algebra og likninger', frist: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', prioritet: 'high', fag: MOCK_FAG[0] },
  { id: 'o2', fagId: '2', tittel: 'Les kapittel 3', beskrivelse: 'Ibsen - Et dukkehjem', frist: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', prioritet: 'medium', fag: MOCK_FAG[1] },
  { id: 'o3', fagId: '3', tittel: 'Essay: My Future Career', beskrivelse: 'Min 500 ord', frist: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', prioritet: 'medium', fag: MOCK_FAG[2] },
  { id: 'o4', fagId: '4', tittel: 'Lab-rapport: Fotosyntese', beskrivelse: '', frist: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', prioritet: 'high', fag: MOCK_FAG[3] },
  { id: 'o5', fagId: '1', tittel: 'Provetentamen', beskrivelse: 'Forbered til provetentamen', frist: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed', prioritet: 'high', fag: MOCK_FAG[0] },
];

const SkoleplanContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [data, setData] = useState({ fag: [], timer: [], oppgaver: [] });
  const [useMockData, setUseMockData] = useState(false);

  const fetchSkoleplan = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const response = await apiClient.get('/skoleplan');
      setData(response.data);
      setUseMockData(false);
      setState('idle');
    } catch (err) {
      console.error('Error fetching skoleplan:', err);
      // Use mock data when backend is unavailable
      setData({ fag: MOCK_FAG, timer: MOCK_TIMER, oppgaver: MOCK_OPPGAVER });
      setUseMockData(true);
      setState('idle');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSkoleplan();
    }
  }, [user, fetchSkoleplan]);

  // CRUD operations for Fag
  const createFag = async (fagData) => {
    if (useMockData) {
      const newFag = { ...fagData, id: `fag-${Date.now()}`, userId: '1' };
      setData(prev => ({ ...prev, fag: [...prev.fag, newFag] }));
      return newFag;
    }
    const response = await apiClient.post('/skoleplan/fag', fagData);
    setData(prev => ({ ...prev, fag: [...prev.fag, response.data] }));
    return response.data;
  };

  const updateFag = async (id, fagData) => {
    if (useMockData) {
      const updatedFag = { ...data.fag.find(f => f.id === id), ...fagData };
      setData(prev => ({
        ...prev,
        fag: prev.fag.map(f => f.id === id ? updatedFag : f)
      }));
      return updatedFag;
    }
    const response = await apiClient.put(`/skoleplan/fag/${id}`, fagData);
    setData(prev => ({
      ...prev,
      fag: prev.fag.map(f => f.id === id ? response.data : f)
    }));
    return response.data;
  };

  const deleteFag = async (id) => {
    if (useMockData) {
      setData(prev => ({
        ...prev,
        fag: prev.fag.filter(f => f.id !== id),
        timer: prev.timer.filter(t => t.fagId !== id),
        oppgaver: prev.oppgaver.filter(o => o.fagId !== id)
      }));
      return;
    }
    await apiClient.delete(`/skoleplan/fag/${id}`);
    setData(prev => ({
      ...prev,
      fag: prev.fag.filter(f => f.id !== id),
      timer: prev.timer.filter(t => t.fagId !== id),
      oppgaver: prev.oppgaver.filter(o => o.fagId !== id)
    }));
  };

  // CRUD operations for Timer
  const createTimer = async (timeData) => {
    if (useMockData) {
      const fagInfo = data.fag.find(f => f.id === timeData.fagId);
      const newTimer = { ...timeData, id: `timer-${Date.now()}`, fag: fagInfo };
      setData(prev => ({ ...prev, timer: [...prev.timer, newTimer] }));
      return newTimer;
    }
    const response = await apiClient.post('/skoleplan/timer', timeData);
    setData(prev => ({ ...prev, timer: [...prev.timer, response.data] }));
    return response.data;
  };

  const updateTimer = async (id, timeData) => {
    if (useMockData) {
      const fagInfo = data.fag.find(f => f.id === timeData.fagId);
      const updatedTimer = { ...data.timer.find(t => t.id === id), ...timeData, fag: fagInfo };
      setData(prev => ({
        ...prev,
        timer: prev.timer.map(t => t.id === id ? updatedTimer : t)
      }));
      return updatedTimer;
    }
    const response = await apiClient.put(`/skoleplan/timer/${id}`, timeData);
    setData(prev => ({
      ...prev,
      timer: prev.timer.map(t => t.id === id ? response.data : t)
    }));
    return response.data;
  };

  const deleteTimer = async (id) => {
    if (useMockData) {
      setData(prev => ({
        ...prev,
        timer: prev.timer.filter(t => t.id !== id)
      }));
      return;
    }
    await apiClient.delete(`/skoleplan/timer/${id}`);
    setData(prev => ({
      ...prev,
      timer: prev.timer.filter(t => t.id !== id)
    }));
  };

  // CRUD operations for Oppgaver
  const createOppgave = async (oppgaveData) => {
    if (useMockData) {
      const fagInfo = data.fag.find(f => f.id === oppgaveData.fagId);
      const newOppgave = {
        ...oppgaveData,
        id: `oppgave-${Date.now()}`,
        status: 'pending',
        prioritet: oppgaveData.prioritet || 'medium',
        fag: fagInfo
      };
      setData(prev => ({ ...prev, oppgaver: [...prev.oppgaver, newOppgave] }));
      return newOppgave;
    }
    const response = await apiClient.post('/skoleplan/oppgaver', oppgaveData);
    setData(prev => ({ ...prev, oppgaver: [...prev.oppgaver, response.data] }));
    return response.data;
  };

  const updateOppgave = async (id, oppgaveData) => {
    if (useMockData) {
      const fagInfo = data.fag.find(f => f.id === oppgaveData.fagId);
      const updatedOppgave = { ...data.oppgaver.find(o => o.id === id), ...oppgaveData, fag: fagInfo };
      setData(prev => ({
        ...prev,
        oppgaver: prev.oppgaver.map(o => o.id === id ? updatedOppgave : o)
      }));
      return updatedOppgave;
    }
    const response = await apiClient.put(`/skoleplan/oppgaver/${id}`, oppgaveData);
    setData(prev => ({
      ...prev,
      oppgaver: prev.oppgaver.map(o => o.id === id ? response.data : o)
    }));
    return response.data;
  };

  const toggleOppgaveStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    if (useMockData) {
      setData(prev => ({
        ...prev,
        oppgaver: prev.oppgaver.map(o => o.id === id ? { ...o, status: newStatus } : o)
      }));
      return;
    }
    const response = await apiClient.patch(`/skoleplan/oppgaver/${id}/status`, { status: newStatus });
    setData(prev => ({
      ...prev,
      oppgaver: prev.oppgaver.map(o => o.id === id ? response.data : o)
    }));
    return response.data;
  };

  const deleteOppgave = async (id) => {
    if (useMockData) {
      setData(prev => ({
        ...prev,
        oppgaver: prev.oppgaver.filter(o => o.id !== id)
      }));
      return;
    }
    await apiClient.delete(`/skoleplan/oppgaver/${id}`);
    setData(prev => ({
      ...prev,
      oppgaver: prev.oppgaver.filter(o => o.id !== id)
    }));
  };

  if (state === 'loading') {
    return <LoadingState message="Laster skoleplan..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste skoleplan'}
        onRetry={fetchSkoleplan}
      />
    );
  }

  return (
    <Skoleplan
      fag={data.fag}
      timer={data.timer}
      oppgaver={data.oppgaver}
      onCreateFag={createFag}
      onUpdateFag={updateFag}
      onDeleteFag={deleteFag}
      onCreateTimer={createTimer}
      onUpdateTimer={updateTimer}
      onDeleteTimer={deleteTimer}
      onCreateOppgave={createOppgave}
      onUpdateOppgave={updateOppgave}
      onToggleOppgaveStatus={toggleOppgaveStatus}
      onDeleteOppgave={deleteOppgave}
      onRefresh={fetchSkoleplan}
    />
  );
};

export default SkoleplanContainer;
