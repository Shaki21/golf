/**
 * TechniquePlanPage
 * Main dashboard for technique development with tasks, goals, and TrackMan import
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useTechniqueTasks,
  useTechniqueGoals,
  useTrackmanImports,
  useTechniqueStats,
} from './hooks/useTechniquePlan';
import TaskCard from './components/TaskCard';
import GoalProgressCard from './components/GoalProgressCard';
import TrackmanImport from './components/TrackmanImport';
import { TECHNICAL_AREAS, METRIC_LABELS, PRIORITY_LABELS } from './types';
import { PageHeader } from '../../ui/raw-blocks';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

const TABS = [
  { id: 'tasks', label: 'Oppgaver' },
  { id: 'goals', label: 'Mal' },
  { id: 'stats', label: 'Statistikk' },
  { id: 'import', label: 'Import' },
];

export default function TechniquePlanPage() {
  const { user } = useAuth();
  const playerId = user?.playerId;

  const [activeTab, setActiveTab] = useState('tasks');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  // Hooks
  const { tasks, loading: tasksLoading, updateTask, deleteTask, createTask } = useTechniqueTasks(playerId);
  const { goals, loading: goalsLoading, updateGoal, createGoal } = useTechniqueGoals(playerId);
  const { imports, loading: importsLoading, uploadCSV } = useTrackmanImports(playerId);
  const { stats, loading: statsLoading } = useTechniqueStats(playerId);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    technicalArea: 'swing',
    priority: 'medium',
  });

  // Goal form state
  const [goalForm, setGoalForm] = useState({
    title: '',
    metricType: 'clubPath',
    targetValue: '',
  });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await createTask({ ...taskForm, playerId });
    setTaskForm({ title: '', description: '', technicalArea: 'swing', priority: 'medium' });
    setShowCreateTask(false);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    await createGoal({
      ...goalForm,
      playerId,
      targetValue: parseFloat(goalForm.targetValue),
    });
    setGoalForm({ title: '', metricType: 'clubPath', targetValue: '' });
    setShowCreateGoal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Teknikkplan"
        subtitle="Din plan for teknisk utvikling med TrackMan-data"
        helpText="Dashboard for teknisk utvikling med TrackMan-integrering. Administrer teknikkoppgaver (swing, putting, shortgame, fysisk) med prioritering, sett teknikkmål for metrikker (clubPath, faceToPath, attackAngle osv.), se statistikk over importert TrackMan-data og importer CSV-filer direkte. Bruk fanene for å navigere mellom oppgaver, mål, statistikk og import."
      />

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <SectionTitle style={{ margin: 0 }}>Teknikkoppgaver</SectionTitle>
            <button
              onClick={() => setShowCreateTask(true)}
              style={{
                padding: '8px 16px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              + Ny oppgave
            </button>
          </div>

          {/* Create task form */}
          {showCreateTask && (
            <form
              onSubmit={handleCreateTask}
              style={{
                background: 'var(--color-surface)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                  Tittel
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                  Beskrivelse
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    Omrade
                  </label>
                  <select
                    value={taskForm.technicalArea}
                    onChange={(e) => setTaskForm({ ...taskForm, technicalArea: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                    }}
                  >
                    {Object.entries(TECHNICAL_AREAS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    Prioritet
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                    }}
                  >
                    {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Opprett
                </button>
              </div>
            </form>
          )}

          {/* Task list */}
          {tasksLoading ? (
            <p>Laster...</p>
          ) : tasks.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px' }}>
              Ingen oppgaver enna. Opprett din forste oppgave!
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
            ))
          )}
        </div>
      )}

      {activeTab === 'goals' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <SectionTitle style={{ margin: 0 }}>Teknikk-mal</SectionTitle>
            <button
              onClick={() => setShowCreateGoal(true)}
              style={{
                padding: '8px 16px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              + Nytt mal
            </button>
          </div>

          {/* Create goal form */}
          {showCreateGoal && (
            <form
              onSubmit={handleCreateGoal}
              style={{
                background: 'var(--color-surface)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                  Tittel
                </label>
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    Metrikk
                  </label>
                  <select
                    value={goalForm.metricType}
                    onChange={(e) => setGoalForm({ ...goalForm, metricType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                    }}
                  >
                    {Object.entries(METRIC_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    Malverdi (grader)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalForm.targetValue}
                    onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateGoal(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Opprett
                </button>
              </div>
            </form>
          )}

          {/* Goals list */}
          {goalsLoading ? (
            <p>Laster...</p>
          ) : goals.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px' }}>
              Ingen mal enna. Sett ditt forste teknikk-mal!
            </p>
          ) : (
            goals.map((goal) => <GoalProgressCard key={goal.id} goal={goal} onUpdate={updateGoal} />)
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <SectionTitle style={{ margin: '0 0 16px 0' }}>TrackMan-statistikk</SectionTitle>

          {statsLoading ? (
            <p>Laster...</p>
          ) : !stats || Object.keys(stats.stats).length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px' }}>
              Ingen data enna. Importer TrackMan-data for a se statistikk.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {Object.entries(stats.stats).map(([metric, data]) => (
                <div
                  key={metric}
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: '8px',
                    padding: '20px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <SubSectionTitle style={{ margin: '0 0 16px 0' }}>
                    {METRIC_LABELS[metric] || metric}
                  </SubSectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Snitt</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600 }}>
                        {data.avg.toFixed(1)}°
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Antall</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600 }}>{data.count}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Min</span>
                      <p style={{ margin: '4px 0 0 0' }}>{data.min.toFixed(1)}°</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Max</span>
                      <p style={{ margin: '4px 0 0 0' }}>{data.max.toFixed(1)}°</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ marginTop: '16px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Totalt {stats?.totalShots || 0} slag registrert
          </p>
        </div>
      )}

      {activeTab === 'import' && (
        <div>
          <SectionTitle style={{ margin: '0 0 16px 0' }}>Importer TrackMan-data</SectionTitle>
          <TrackmanImport playerId={playerId} onUpload={uploadCSV} imports={imports} />
        </div>
      )}
    </div>
  );
}
