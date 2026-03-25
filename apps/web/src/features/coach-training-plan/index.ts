// Export the Container (API-connected) as the main export
export { default as CoachTrainingPlan } from "./CoachTrainingPlanContainer";
// Also export the raw component for testing/customization
export { default as CoachTrainingPlanRaw } from "./CoachTrainingPlan";

// Export Training Plan Templates (Sprint 5.12)
export { CoachTrainingPlanTemplates } from './CoachTrainingPlanTemplates';
export { TemplatePlanLibrary } from './components/TemplatePlanLibrary';
export { TemplatePlanCalendar } from './components/TemplatePlanCalendar';
export { TemplatePlanApplyDialog } from './components/TemplatePlanApplyDialog';
export { CoachTemplateCreatorPage } from './pages/CoachTemplateCreatorPage';
export { CoachTemplateCreator } from './components/CoachTemplateCreator';

// Export template types
export type {
  TrainingPlanTemplate,
  TemplateSession,
  TemplateExercise,
  TemplateCategory,
  TemplateLevel,
} from './types/template.types';
