// Export the Container (API-connected) as the main export
export { default as CoachTrainingPlanEditor } from "./CoachTrainingPlanEditorContainer";
// Also export the raw component for testing/customization
export { default as CoachTrainingPlanEditorRaw } from "./CoachTrainingPlanEditor";
// AI Plan Suggestions component
export { default as AIPlanSuggestions } from "./AIPlanSuggestions";
export type { SuggestionToApply } from "./AIPlanSuggestions";
