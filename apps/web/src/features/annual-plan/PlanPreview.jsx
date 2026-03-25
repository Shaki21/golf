import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import Button from '../../ui/primitives/Button';
import { PageTitle, SectionTitle, SubSectionTitle } from '../../components/typography';

/**
 * Plan Preview Component
 * Implements UI contract for plan-generation.contract.ts
 *
 * States: loading → viewing → accepting → accepted
 *         loading → error_not_found
 *         loading → error_system
 *         viewing → requesting_modifications → modification_requested
 *         viewing → rejecting → rejected
 */

export default function PlanPreview() {
  const { planId } = useParams();
  const navigate = useNavigate();

  // State Machine states
  const [state, setState] = useState('loading');
  const [viewMode, setViewMode] = useState('overview');

  // Data
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState(null);

  // Modal states
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [modificationForm, setModificationForm] = useState({
    concerns: [],
    notes: '',
    urgency: 'medium'
  });
  const [rejectForm, setRejectForm] = useState({
    reason: '',
    willCreateNewIntake: false
  });

  // Load plan on mount
  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  // Auto-navigation after accept
  useEffect(() => {
    if (state === 'accepted') {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, navigate]);

  // Auto-navigation after modification requested
  useEffect(() => {
    if (state === 'modification_requested') {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state, navigate]);

  // Load complete plan
  const loadPlan = async () => {
    setState('loading');
    try {
      const response = await apiClient.get(
        `/training-plan/${planId}/full?includeSessionDetails=true`
      );

      if (response.data.success) {
        setPlanData(response.data.data);
        setState('viewing');
      }
    } catch (err) {
      if (err.status === 404 || err.status === 403) {
        setError({
          code: err.details?.code || 'PLAN_NOT_FOUND',
          message: err.message || 'Training plan not found'
        });
        setState('error_not_found');
      } else {
        setError({
          code: 'SYSTEM_ERROR',
          message: 'Could not load training plan. Please try again.'
        });
        setState('error_system');
      }
    }
  };

  // Accept plan
  const handleAcceptPlan = async () => {
    setState('accepting');
    try {
      const response = await apiClient.put(
        `/training-plan/${planId}/accept`,
        {}
      );

      if (response.data.success) {
        setState('accepted');
      }
    } catch (err) {
      if (err.status === 400) {
        alert(err.message || 'Cannot approve plan in current status');
        setState('viewing');
      } else {
        alert('Could not approve the plan. Please try again.');
        setState('viewing');
      }
    }
  };

  // Request modifications
  const handleRequestModifications = async () => {
    setState('requesting_modifications');
    try {
      const response = await apiClient.post(
        `/training-plan/${planId}/modification-request`,
        modificationForm
      );

      if (response.data.success) {
        setState('modification_requested');
        setShowModificationModal(false);
      }
    } catch (err) {
      alert('Could not send modification request. Please try again.');
      setState('viewing');
    }
  };

  // Reject plan
  const handleRejectPlan = async () => {
    setState('rejecting');
    try {
      const response = await apiClient.put(
        `/training-plan/${planId}/reject`,
        rejectForm
      );

      if (response.data.success) {
        setState('rejected');
        // Navigate to intake form immediately
        navigate('/intake-form');
      }
    } catch (err) {
      alert('Could not reject the plan. Please try again.');
      setState('viewing');
      setShowRejectModal(false);
    }
  };

  // Render loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your training plan...</p>
        </div>
      </div>
    );
  }

  // Render error states
  if (state === 'error_not_found') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <PageTitle className="text-2xl font-bold text-gray-900 mb-2">Plan not found</PageTitle>
          <p className="text-gray-600 mb-6">{error?.message}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'error_system') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-orange-500 text-5xl mb-4">!</div>
          <PageTitle className="text-2xl font-bold text-gray-900 mb-2">System error</PageTitle>
          <p className="text-gray-600 mb-6">{error?.message}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              onClick={loadPlan}
            >
              Try again
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render accepting state
  if (state === 'accepting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Activating your training plan...</p>
        </div>
      </div>
    );
  }

  // Render accepted state
  if (state === 'accepted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">OK</div>
          <PageTitle className="text-2xl font-bold text-gray-900 mb-2">Plan activated!</PageTitle>
          <p className="text-gray-600 mb-6">
            Your training plan is now active. Redirecting to dashboard...
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to dashboard now
          </Button>
        </div>
      </div>
    );
  }

  // Render modification requested state
  if (state === 'modification_requested') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-blue-500 text-5xl mb-4">NOTE</div>
          <PageTitle className="text-2xl font-bold text-gray-900 mb-2">Request sent</PageTitle>
          <p className="text-gray-600 mb-6">
            Your coach will review the request within 24-48 hours.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Render viewing state (main plan preview)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <PageTitle className="text-3xl font-bold text-gray-900">
            {planData?.annualPlan.planName || '12-måneders treningsplan'}
          </PageTitle>
          <p className="text-gray-600 mt-1">
            {new Date(planData?.annualPlan.startDate).toLocaleDateString()} - {new Date(planData?.annualPlan.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            {['overview', 'calendar', 'weekly', 'periodization', 'tournaments'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`py-4 px-6 font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                  viewMode === mode
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'overview' && <OverviewView data={planData} />}
        {viewMode === 'calendar' && <CalendarView data={planData} />}
        {viewMode === 'weekly' && <WeeklyView data={planData} />}
        {viewMode === 'periodization' && <PeriodizationView data={planData} />}
        {viewMode === 'tournaments' && <TournamentsView data={planData} />}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <Button
            variant="primary"
            size="md"
            onClick={handleAcceptPlan}
          >
            Approve training plan
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowModificationModal(true)}
          >
            Request modifications
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setShowRejectModal(true)}
            style={{ color: 'var(--color-status-error)' }}
          >
            Reject plan
          </Button>
        </div>
      </div>

      {/* Modification Request Modal */}
      {showModificationModal && (
        <Modal onClose={() => setShowModificationModal(false)}>
          <SectionTitle className="text-2xl font-bold mb-4">Request modifications</SectionTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What concerns do you have? (Select all that apply)
              </label>
              {['Too many sessions per week', 'Too few rest days', 'Tournament dates conflict', 'Session types not suitable', 'Weekly hours too high'].map(concern => (
                <label key={concern} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={modificationForm.concerns.includes(concern)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setModificationForm(prev => ({
                          ...prev,
                          concerns: [...prev.concerns, concern]
                        }));
                      } else {
                        setModificationForm(prev => ({
                          ...prev,
                          concerns: prev.concerns.filter(c => c !== concern)
                        }));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{concern}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional notes (optional)
              </label>
              <textarea
                value={modificationForm.notes}
                onChange={(e) => setModificationForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows="4"
                placeholder="Provide more context about your concerns..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency
              </label>
              <select
                value={modificationForm.urgency}
                onChange={(e) => setModificationForm(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowModificationModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRequestModifications}
                disabled={modificationForm.concerns.length === 0}
              >
                Send request
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Plan Modal */}
      {showRejectModal && (
        <Modal onClose={() => setShowRejectModal(false)}>
          <SectionTitle className="text-2xl font-bold mb-4 text-red-600">Reject training plan</SectionTitle>
          <p className="text-gray-600 mb-4">
            Are you sure? This will archive the plan and you will need to create a new intake form.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (required, min 10 characters)
              </label>
              <textarea
                value={rejectForm.reason}
                onChange={(e) => setRejectForm(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows="4"
                placeholder="Please explain why you are rejecting this plan..."
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rejectForm.willCreateNewIntake}
                onChange={(e) => setRejectForm(prev => ({ ...prev, willCreateNewIntake: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">I will create a new intake form</span>
            </label>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRejectPlan}
                disabled={rejectForm.reason.length < 10}
                style={{ backgroundColor: 'var(--color-status-error)' }}
              >
                Confirm rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// View Components
function OverviewView({ data }) {
  if (!data) return null;

  const { statistics, periodizations, tournaments } = data;

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <SectionTitle className="text-xl font-bold mb-4">Plan Summary</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total rest days" value={statistics.totalRestDays} />
          <StatCard label="Avg session (min)" value={Math.round(statistics.averageSessionDuration)} />
          <StatCard label="Weeks" value={periodizations.length} />
        </div>
      </div>

      {/* Period Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <SectionTitle className="text-xl font-bold mb-4">Training Periods</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PeriodCard label="Base (E)" count={statistics.periodBreakdown.E || 0} color="bg-blue-100 text-blue-800" />
          <PeriodCard label="General (G)" count={statistics.periodBreakdown.G || 0} color="bg-green-100 text-green-800" />
          <PeriodCard label="Specific (S)" count={statistics.periodBreakdown.S || 0} color="bg-purple-100 text-purple-800" />
          <PeriodCard label="Tournament (T)" count={statistics.periodBreakdown.T || 0} color="bg-yellow-100 text-yellow-800" />
        </div>
      </div>

      {/* Tournaments */}
      <div className="bg-white rounded-lg shadow p-6">
        <SectionTitle className="text-xl font-bold mb-4">Planned Tournaments ({tournaments.length})</SectionTitle>
        <div className="space-y-2">
          {tournaments.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{t.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{new Date(t.startDate).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  t.importance === 'A' ? 'bg-red-100 text-red-800' :
                  t.importance === 'B' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {t.importance}-priority
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ data }) {
  if (!data?.dailyAssignments) return null;

  // Group assignments by month
  const monthlyAssignments = {};
  data.dailyAssignments.forEach(assignment => {
    const date = new Date(assignment.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyAssignments[monthKey]) {
      monthlyAssignments[monthKey] = [];
    }
    monthlyAssignments[monthKey].push(assignment);
  });

  const months = Object.keys(monthlyAssignments).sort();

  const getSessionTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'range': return 'bg-green-200';
      case 'course': return 'bg-blue-200';
      case 'physical': return 'bg-purple-200';
      case 'mental': return 'bg-yellow-200';
      case 'rest': return 'bg-gray-100';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SectionTitle className="text-xl font-bold mb-4">365-day calendar</SectionTitle>
      <p className="text-sm text-gray-500 mb-4">
        Total number of assignments: {data.dailyAssignments.length}
      </p>

      <div className="space-y-6">
        {months.map(monthKey => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          const assignments = monthlyAssignments[monthKey];

          return (
            <div key={monthKey} className="border border-gray-200 rounded-lg p-4">
              <SubSectionTitle className="font-semibold text-lg mb-3 capitalize">{monthName}</SubSectionTitle>
              <div className="grid grid-cols-7 gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                {assignments.map(assignment => {
                  const date = new Date(assignment.date);
                  const dayOfMonth = date.getDate();
                  const isRest = assignment.isRest;

                  return (
                    <div
                      key={assignment.id}
                      className={`text-center py-2 rounded text-xs ${
                        isRest ? 'bg-gray-100 text-gray-400' : getSessionTypeColor(assignment.sessionType)
                      }`}
                      title={isRest ? 'Rest day' : `${assignment.sessionType || 'Training'}`}
                    >
                      {dayOfMonth}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span>Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <span>Course</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-200 rounded"></div>
          <span>Physical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span>Mental</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Rest</span>
        </div>
      </div>
    </div>
  );
}

function WeeklyView({ data }) {
  if (!data?.periodizations || !data?.dailyAssignments) return null;

  // Group daily assignments by week number
  const weeklyData = {};
  data.dailyAssignments.forEach(assignment => {
    const weekNum = assignment.weekNumber || getWeekNumber(new Date(assignment.date));
    if (!weeklyData[weekNum]) {
      weeklyData[weekNum] = {
        assignments: [],
        restDays: 0,
        trainingDays: 0
      };
    }
    weeklyData[weekNum].assignments.push(assignment);
    if (assignment.isRest) {
      weeklyData[weekNum].restDays++;
    } else {
      weeklyData[weekNum].trainingDays++;
    }
  });

  // Merge with periodization data
  const weeks = data.periodizations.map(period => ({
    ...period,
    ...(weeklyData[period.weekNumber] || { assignments: [], restDays: 0, trainingDays: 0 })
  }));

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'E': return 'Evaluation';
      case 'G': return 'Base Period';
      case 'S': return 'Specialization';
      case 'T': return 'Tournament';
      default: return period;
    }
  };

  const getPeriodColor = (period) => {
    switch (period) {
      case 'E': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'G': return 'bg-green-100 text-green-800 border-green-200';
      case 'S': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'T': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SectionTitle className="text-xl font-bold mb-4">Week-by-Week View</SectionTitle>
      <p className="text-sm text-gray-500 mb-4">
        {weeks.length} weeks planned
      </p>

      <div className="space-y-3">
        {weeks.map(week => (
          <div
            key={week.weekNumber}
            className={`border rounded-lg p-4 ${getPeriodColor(week.period)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg">Week {week.weekNumber}</span>
                <span className="px-2 py-1 rounded text-sm font-medium bg-white/50">
                  {getPeriodLabel(week.period)}
                </span>
                {week.learningPhase && (
                  <span className="text-sm opacity-75">{week.learningPhase}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {week.trainingDays} training days
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  {week.restDays} rest days
                </span>
              </div>
            </div>

            {/* Show session breakdown if there are assignments */}
            {week.assignments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {week.assignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className={`px-2 py-1 rounded text-xs ${
                      assignment.isRest
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-white/70 text-gray-700'
                    }`}
                  >
                    {assignment.isRest ? 'R' : (assignment.sessionType?.charAt(0) || 'T')}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get week number from date
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function PeriodizationView({ data }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SectionTitle className="text-xl font-bold mb-4">Periodization Timeline</SectionTitle>
      <div className="space-y-2">
        {data?.periodizations.map(period => (
          <div key={period.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
            <div className="w-20 text-sm font-medium">Week {period.weekNumber}</div>
            <div className="flex-1 flex items-center gap-2">
              <span className={`px-3 py-1 rounded font-medium ${
                period.period === 'E' ? 'bg-blue-100 text-blue-800' :
                period.period === 'G' ? 'bg-green-100 text-green-800' :
                period.period === 'S' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {period.period}
              </span>
              <span className="text-sm text-gray-600">{period.learningPhase}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TournamentsView({ data }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SectionTitle className="text-xl font-bold mb-4">Tournament Schedule & Preparation</SectionTitle>
      <div className="space-y-4">
        {data?.tournaments.map(t => (
          <div key={t.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <SubSectionTitle className="font-bold text-lg">{t.name}</SubSectionTitle>
              <span className={`px-3 py-1 rounded font-medium ${
                t.importance === 'A' ? 'bg-red-100 text-red-800' :
                t.importance === 'B' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {t.importance}-Priority
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>Date: {new Date(t.startDate).toLocaleDateString()}</div>
              <div>Week: {t.weekNumber}</div>
              <div>Topping: Week {t.toppingStartWeek} ({t.toppingDurationWeeks} weeks)</div>
              <div>Tapering: {t.taperingDurationDays} days</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Utility Components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Modal({ children, onClose: _onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-3xl font-bold text-green-600">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function PeriodCard({ label, count, color }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {count} weeks
      </div>
      <div className="text-sm text-gray-600 mt-2">{label}</div>
    </div>
  );
}
