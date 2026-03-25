/**
 * Sessions Feature - Component Exports
 *
 * Design Source: /packages/design-system/figma/tier_golf_complete_figma_kit.svg
 * Spec Source: /Docs/specs/APP_FUNCTIONALITY.md
 *
 * Components:
 * - SessionDetailView: Full session view with all blocks (Section 6)
 * - ActiveSessionView: Active training view with timer (Section 7)
 * - BlockRatingModal: Quality rating after completing a block (Section 7.5)
 * - SessionReflectionForm: Post-session reflection form (Section 8)
 * - SessionEvaluationForm: Session evaluation with ratings, cues, notes
 * - SessionEvaluationFormContainer: Smart component with API integration
 * - SessionCreateForm: Create new training session form
 * - SessionCreateFormContainer: Smart component for session creation
 * - ExerciseLibrary: Exercise library with search/filter (Section 10)
 * - ShareSessionModal: Share session with friends (Section 12)
 * - ReceivedSessionModal: View received shared sessions (Section 12)
 */

export { default as SessionDetailView } from './SessionDetailView';
export { default as ActiveSessionView } from './ActiveSessionView';
export { default as BlockRatingModal } from './BlockRatingModal';
export { default as SessionReflectionForm } from './SessionReflectionForm';
export { default as SessionEvaluationForm } from './SessionEvaluationForm';
export { default as SessionEvaluationFormContainer } from './SessionEvaluationFormContainer';
export { default as SessionCreateForm } from './SessionCreateForm';
export { default as SessionCreateFormContainer } from './SessionCreateFormContainer';
export { default as EvaluationStatsDashboard } from './EvaluationStatsDashboard';
export { default as EvaluationStatsDashboardContainer } from './EvaluationStatsDashboardContainer';
export { default as SessionsListView } from './SessionsListView';
export { default as SessionsListContainer } from './SessionsListContainer';
export { default as SessionEvaluationWidget } from './SessionEvaluationWidget';
export { default as ExerciseLibrary } from './ExerciseLibrary';
export { default as ShareSessionModal, ReceivedSessionModal } from './ShareSessionModal';
export { default as QuickActionsWidget } from './QuickActionsWidget';
