/**
 * TIER Golf - Batch Operations Panel
 *
 * Provides batch actions for selected players:
 * - Assign training sessions
 * - Send notes
 * - Update player status
 * - Create training plans
 */

import React, { useState } from 'react';
import { X, Calendar, MessageSquare, UserCheck, ClipboardList, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { coachesAPI } from '../../services/api';
import { SubSectionTitle } from '../../ui/primitives/typography';

interface Props {
  selectedPlayerIds: string[];
  selectedPlayerNames: Map<string, string>;
  onClose: () => void;
  onComplete: () => void;
}

type ActionType = 'session' | 'note' | 'status' | 'plan';

interface BatchResult {
  success: string[];
  failed: Array<{ playerId: string; error: string }>;
}

export default function BatchOperationsPanel({
  selectedPlayerIds,
  selectedPlayerNames,
  onClose,
  onComplete,
}: Props) {
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [sessionData, setSessionData] = useState({
    sessionType: '',
    scheduledDate: '',
    durationMinutes: 60,
    notes: '',
  });

  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  const [statusData, setStatusData] = useState<'active' | 'inactive' | 'on_break'>('active');

  const [planData, setPlanData] = useState({
    planName: '',
    startDate: '',
    durationWeeks: 12,
    focusAreas: [] as string[],
  });

  const handleSubmit = async () => {
    if (!activeAction) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;

      switch (activeAction) {
        case 'session':
          response = await coachesAPI.batchAssignSession({
            playerIds: selectedPlayerIds,
            ...sessionData,
          });
          break;
        case 'note':
          response = await coachesAPI.batchSendNote({
            playerIds: selectedPlayerIds,
            ...noteData,
          });
          break;
        case 'status':
          response = await coachesAPI.batchUpdateStatus({
            playerIds: selectedPlayerIds,
            status: statusData,
          });
          break;
        case 'plan':
          response = await coachesAPI.batchCreatePlan({
            playerIds: selectedPlayerIds,
            ...planData,
          });
          break;
      }

      const data = response.data.data;
      setResult(data);

      if (data.success.length > 0 && data.failed.length === 0) {
        // All successful - close after a short delay
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const actions: Array<{ type: ActionType; icon: React.ReactNode; label: string; description: string }> = [
    { type: 'session', icon: <Calendar size={20} />, label: 'Assign training session', description: 'Schedule a training session for all selected players' },
    { type: 'note', icon: <MessageSquare size={20} />, label: 'Send note', description: 'Send a note to all selected players' },
    { type: 'status', icon: <UserCheck size={20} />, label: 'Update status', description: 'Change status for all selected players' },
    { type: 'plan', icon: <ClipboardList size={20} />, label: 'Create training plan', description: 'Create a training plan for all selected players' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-default)',
        boxShadow: '0 -4px 20px rgb(var(--tier-navy-rgb) / 0.1)',
        zIndex: 100,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div>
          <SubSectionTitle style={{ marginBottom: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Batch Operations
          </SubSectionTitle>
          <p style={{ margin: 0, marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {selectedPlayerIds.length} players selected
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: result.failed.length === 0 ? 'rgb(var(--status-success-rgb) / 0.1)' : 'rgb(var(--status-warning-rgb) / 0.1)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {result.failed.length === 0 ? (
              <CheckCircle size={20} color="var(--status-success)" />
            ) : (
              <AlertCircle size={20} color="var(--status-warning)" />
            )}
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {result.success.length} successful, {result.failed.length} failed
            </span>
          </div>
          {result.failed.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {result.failed.map((f, i) => (
                <div key={i}>{selectedPlayerNames.get(f.playerId) || f.playerId}: {f.error}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'rgb(var(--status-error-rgb) / 0.1)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={20} color="var(--status-error)" />
          <span style={{ fontSize: '14px', color: 'var(--status-error)' }}>{error}</span>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '20px 24px' }}>
        {!activeAction ? (
          // Action Selection
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {actions.map((action) => (
              <button
                key={action.type}
                onClick={() => setActiveAction(action.type)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.backgroundColor = 'rgba(var(--accent-rgb), 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
              >
                <div style={{ color: 'var(--accent)', marginBottom: '8px' }}>{action.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{action.description}</div>
              </button>
            ))}
          </div>
        ) : (
          // Action Form
          <div>
            <button
              onClick={() => {
                setActiveAction(null);
                setResult(null);
                setError(null);
              }}
              style={{
                marginBottom: '16px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>

            {activeAction === 'session' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Session type *
                  </label>
                  <input
                    type="text"
                    value={sessionData.sessionType}
                    onChange={(e) => setSessionData({ ...sessionData, sessionType: e.target.value })}
                    placeholder="E.g. Putting"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={sessionData.scheduledDate}
                    min={getTodayISO()}
                    onChange={(e) => setSessionData({ ...sessionData, scheduledDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={sessionData.durationMinutes}
                    onChange={(e) => setSessionData({ ...sessionData, durationMinutes: parseInt(e.target.value) })}
                    min={1}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Notes
                  </label>
                  <input
                    type="text"
                    value={sessionData.notes}
                    onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })}
                    placeholder="Optional..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            {activeAction === 'note' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={noteData.title}
                    onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                    placeholder="E.g. Weekly update"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Content *
                  </label>
                  <input
                    type="text"
                    value={noteData.content}
                    onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                    placeholder="Write note..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={noteData.category}
                    onChange={(e) => setNoteData({ ...noteData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="general">General</option>
                    <option value="training">Training</option>
                    <option value="technique">Technique</option>
                    <option value="mental">Mental</option>
                  </select>
                </div>
              </div>
            )}

            {activeAction === 'status' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['active', 'inactive', 'on_break'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusData(status)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-md)',
                      border: statusData === status ? '2px solid var(--accent)' : '1px solid var(--border-default)',
                      backgroundColor: statusData === status ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg-secondary)',
                      color: statusData === status ? 'var(--accent)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'On break'}
                  </button>
                ))}
              </div>
            )}

            {activeAction === 'plan' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Plan name *
                  </label>
                  <input
                    type="text"
                    value={planData.planName}
                    onChange={(e) => setPlanData({ ...planData, planName: e.target.value })}
                    placeholder="E.g. Winter training 2026"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Start date *
                  </label>
                  <input
                    type="date"
                    value={planData.startDate}
                    min={getTodayISO()}
                    onChange={(e) => setPlanData({ ...planData, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Duration (weeks)
                  </label>
                  <input
                    type="number"
                    value={planData.durationWeeks}
                    onChange={(e) => setPlanData({ ...planData, durationWeeks: parseInt(e.target.value) })}
                    min={1}
                    max={52}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isLoading ? 'var(--border-default)' : 'var(--accent)',
                  color: isLoading ? 'var(--text-secondary)' : 'var(--bg-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Execute for {selectedPlayerIds.length} players
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
