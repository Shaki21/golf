/**
 * TekniskPlanContainer.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import {
  Target, Video, CheckCircle, Clock, ChevronRight, ChevronDown,
  Play, Camera, MessageCircle, Award,
  Repeat, Eye, BookOpen, TrendingUp
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

// Status configuration
const STATUS_CLASSES = {
  completed: {
    text: 'text-tier-success',
    bg: 'bg-tier-success/15',
    activeBg: 'bg-tier-success',
    icon: CheckCircle,
    label: 'Completed',
  },
  in_progress: {
    text: 'text-tier-navy',
    bg: 'bg-tier-navy/15',
    activeBg: 'bg-tier-navy',
    icon: Play,
    label: 'In progress',
  },
  pending: {
    text: 'text-tier-text-secondary',
    bg: 'bg-tier-surface-base',
    activeBg: 'bg-tier-text-secondary',
    icon: Clock,
    label: 'Pending',
  },
};

// ============================================================================
// MOCK DATA - Will be replaced with API data
// ============================================================================

const TECHNICAL_PLAN = {
  currentFocus: 'Rotation and sequencing',
  startDate: '2025-01-01',
  targetDate: '2025-03-15',
  progress: 45,
  coach: 'Anders Kristiansen',
  areas: [
    {
      id: 'a1',
      name: 'Backswing',
      status: 'completed',
      focus: 'Shoulder rotation and arm position',
      checkpoints: [
        { id: 'c1', text: 'Full shoulder rotation (90+)', completed: true },
        { id: 'c2', text: 'Left arm straight at the top', completed: true },
        { id: 'c3', text: 'Club parallel to target line', completed: true },
      ],
      drills: [
        { name: 'Alignment stick drill', duration: '10 min', videoUrl: '#' },
        { name: 'Mirror training', duration: '5 min', videoUrl: '#' },
      ],
      notes: 'Good progression. Consistent position at the top now.',
    },
    {
      id: 'a2',
      name: 'Downswing sequencing',
      status: 'in_progress',
      focus: 'Start the downswing from the ground up',
      checkpoints: [
        { id: 'c4', text: 'Hip initiation before arms', completed: true },
        { id: 'c5', text: 'Maintain lag longer', completed: false },
        { id: 'c6', text: 'Shaft lean at impact', completed: false },
      ],
      drills: [
        { name: 'Step-through drill', duration: '15 min', videoUrl: '#' },
        { name: 'Pump drill', duration: '10 min', videoUrl: '#' },
        { name: 'Impact bag', duration: '10 min', videoUrl: '#' },
      ],
      notes: 'Main focus now. Working on maintaining the angle longer in the downswing.',
      coachFeedback: 'Great progress last 2 weeks! Focus on feeling the "drag" from the hips.',
    },
    {
      id: 'a3',
      name: 'Impact & Follow-through',
      status: 'pending',
      focus: 'Clean contact and balanced finish',
      checkpoints: [
        { id: 'c7', text: 'Hands ahead of clubhead at impact', completed: false },
        { id: 'c8', text: 'Full extension after impact', completed: false },
        { id: 'c9', text: 'Balanced finish position', completed: false },
      ],
      drills: [
        { name: 'Slow motion swings', duration: '10 min', videoUrl: '#' },
        { name: 'Finish & hold', duration: '5 min', videoUrl: '#' },
      ],
      notes: 'Will start when sequencing is in place.',
    },
  ],
  recentVideos: [
    { id: 'v1', date: '2025-01-14', title: 'Driver FO-view', thumbnail: null, duration: '0:45' },
    { id: 'v2', date: '2025-01-12', title: '7-iron DTL', thumbnail: null, duration: '0:32' },
    { id: 'v3', date: '2025-01-10', title: 'Before/after comparison', thumbnail: null, duration: '1:20' },
  ],
  keyMetrics: [
    { name: 'Club speed', current: '108 mph', target: '112 mph', progress: 75 },
    { name: 'Attack angle (driver)', current: '+2.5', target: '+4', progress: 60 },
    { name: 'Smash factor', current: '1.46', target: '1.48', progress: 85 },
    { name: 'Dispersion 150y', current: '12y', target: '8y', progress: 40 },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusConfig = (status) => {
  return STATUS_CLASSES[status] || STATUS_CLASSES.pending;
};

// ============================================================================
// AREA CARD COMPONENT
// ============================================================================

const AreaCard = ({ area }) => {
  const [isExpanded, setIsExpanded] = useState(area.status === 'in_progress');
  const statusConfig = getStatusConfig(area.status);
  const StatusIcon = statusConfig.icon;

  const completedCheckpoints = area.checkpoints.filter(c => c.completed).length;
  const totalCheckpoints = area.checkpoints.length;
  const progressPercent = (completedCheckpoints / totalCheckpoints) * 100;

  return (
    <div className={`bg-tier-white rounded-2xl overflow-hidden shadow-sm ${
      area.status === 'in_progress' ? 'border-2 border-tier-navy' : 'border-2 border-transparent'
    }`}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 cursor-pointer flex items-center gap-4"
      >
        <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
          <StatusIcon size={24} className={statusConfig.text} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <SubSectionTitle className="text-base">
              {area.name}
            </SubSectionTitle>
            <span className={`text-[11px] font-medium ${statusConfig.text} ${statusConfig.bg} py-0.5 px-2 rounded`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="text-[13px] text-tier-text-secondary mt-1">
            {area.focus}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-tier-navy">
              {completedCheckpoints}/{totalCheckpoints}
            </div>
            <div className="text-[11px] text-tier-text-secondary">checkpoints</div>
          </div>
          <div className={`w-7 h-7 rounded-lg bg-tier-surface-base flex items-center justify-center transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}>
            <ChevronDown size={16} className="text-tier-text-secondary" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="h-1 bg-tier-surface-base rounded-sm overflow-hidden">
          <div
            className={`h-full ${statusConfig.activeBg} rounded-sm transition-all duration-300`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-tier-border-default">
          {/* Checkpoints */}
          <div className="mt-4">
            <div className="text-[13px] font-semibold text-tier-navy mb-2.5 flex items-center gap-1.5">
              <Target size={14} />
              Checkpoints
            </div>
            <div className="flex flex-col gap-2">
              {area.checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg ${
                    checkpoint.completed ? 'bg-tier-success/10' : 'bg-tier-surface-base'
                  }`}
                >
                  <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center ${
                    checkpoint.completed
                      ? 'bg-tier-success'
                      : 'bg-tier-white border-2 border-tier-border-default'
                  }`}>
                    {checkpoint.completed && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <span className={`text-[13px] ${
                    checkpoint.completed
                      ? 'text-tier-text-secondary line-through'
                      : 'text-tier-navy'
                  }`}>
                    {checkpoint.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Drills */}
          <div className="mt-4">
            <div className="text-[13px] font-semibold text-tier-navy mb-2.5 flex items-center gap-1.5">
              <Repeat size={14} />
              Drills
            </div>
            <div className="flex gap-2 flex-wrap">
              {area.drills.map((drill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-2 px-3 bg-tier-surface-base rounded-lg cursor-pointer"
                >
                  <Video size={14} className="text-tier-navy" />
                  <span className="text-xs text-tier-navy">
                    {drill.name}
                  </span>
                  <span className="text-[11px] text-tier-text-secondary bg-tier-white py-0.5 px-1.5 rounded">
                    {drill.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Feedback */}
          {area.coachFeedback && (
            <div className="mt-4 p-3 bg-tier-navy/10 rounded-[10px] border-l-[3px] border-tier-navy">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageCircle size={14} className="text-tier-navy" />
                <span className="text-xs font-semibold text-tier-navy">
                  Coach feedback
                </span>
              </div>
              <p className="text-[13px] text-tier-navy m-0 leading-relaxed">
                {area.coachFeedback}
              </p>
            </div>
          )}

          {/* Notes */}
          {area.notes && !area.coachFeedback && (
            <div className="mt-4 p-3 bg-tier-surface-base rounded-[10px]">
              <div className="text-[11px] text-tier-text-secondary mb-1">
                Notes
              </div>
              <p className="text-[13px] text-tier-navy m-0 leading-relaxed">
                {area.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// METRICS CARD COMPONENT
// ============================================================================

const MetricsCard = ({ metrics }) => {
  return (
    <div className="bg-tier-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-tier-warning" />
        <SubSectionTitle className="text-sm">
          Key metrics
        </SubSectionTitle>
      </div>

      <div className="flex flex-col gap-3.5">
        {metrics.map((metric, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] text-tier-navy">
                {metric.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-tier-navy">
                  {metric.current}
                </span>
                <span className="text-[11px] text-tier-text-secondary">
                  / {metric.target}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-tier-surface-base rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm ${
                  metric.progress >= 80 ? 'bg-tier-success' :
                  metric.progress >= 50 ? 'bg-tier-navy' : 'bg-tier-warning'
                }`}
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// VIDEO CARD COMPONENT
// ============================================================================

const RecentVideosCard = ({ videos }) => {
  return (
    <div className="bg-tier-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-tier-navy" />
          <SubSectionTitle className="text-sm">
            Recent videos
          </SubSectionTitle>
        </div>
        <Button variant="ghost" size="sm">
          View all
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex items-center gap-3 p-2.5 bg-tier-surface-base rounded-[10px] cursor-pointer"
          >
            <div className="w-12 h-9 rounded-md bg-tier-navy flex items-center justify-center">
              <Play size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-tier-navy">
                {video.title}
              </div>
              <div className="text-[11px] text-tier-text-secondary">
                {video.date} - {video.duration}
              </div>
            </div>
            <ChevronRight size={16} className="text-tier-text-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TekniskPlanContainer = () => {
  const plan = TECHNICAL_PLAN;
  const completedAreas = plan.areas.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Technical plan"
        subtitle={`Focus: ${plan.currentFocus}`}
        helpText="Your individual technical training plan with focus areas, tasks, and goals. Follow the coach's recommendations to systematically improve your technique."
      />

      <div className="p-6">
        {/* Progress Overview */}
        <div className="bg-tier-white rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionTitle className="text-lg">
                Technical development plan
              </SectionTitle>
              <div className="text-[13px] text-tier-text-secondary mt-1">
                Coach: {plan.coach} - Target: {new Date(plan.targetDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-tier-navy">
                  {plan.progress}%
                </div>
                <div className="text-[11px] text-tier-text-secondary">total progress</div>
              </div>
            </div>
          </div>

          <div className="h-2 bg-tier-surface-base rounded overflow-hidden">
            <div
              className="h-full bg-tier-navy rounded"
              style={{ width: `${plan.progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-tier-text-secondary">
            <span>{completedAreas}/{plan.areas.length} areas completed</span>
            <span>Started {new Date(plan.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-[1fr_340px] gap-6">
          {/* Areas */}
          <div>
            <SectionTitle className="text-base m-0 mb-4">
              Development areas
            </SectionTitle>
            <div className="flex flex-col gap-3">
              {plan.areas.map((area) => (
                <AreaCard key={area.id} area={area} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <MetricsCard metrics={plan.keyMetrics} />
            <RecentVideosCard videos={plan.recentVideos} />

            {/* Resources */}
            <div className="bg-tier-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-tier-success" />
                <SubSectionTitle className="text-sm">
                  Resources
                </SubSectionTitle>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye size={14} />}
                  className="w-full justify-start"
                >
                  View training videos
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Award size={14} />}
                  className="w-full justify-start"
                >
                  Previous plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TekniskPlanContainer;
