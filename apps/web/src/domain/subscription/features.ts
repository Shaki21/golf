export type Feature =
  | "stats_dashboard"
  | "pro_gap_analysis"
  | "training_roi_predictor"
  | "smart_practice_planner"
  | "scenario_simulator"
  | "progression_forecast"
  | "player_overview"
  | "coach_intelligence_dashboard"
  | "team_alerts";

export const TierFeatures: Record<string, Feature[]> = {
  player_base: [
    "stats_dashboard",
    "pro_gap_analysis",
  ],

  player_premium: [
    "stats_dashboard",
    "pro_gap_analysis",
    "training_roi_predictor",
    "smart_practice_planner",
  ],

  player_elite: [
    "stats_dashboard",
    "pro_gap_analysis",
    "training_roi_predictor",
    "smart_practice_planner",
    "scenario_simulator",
    "progression_forecast",
  ],

  coach_base: [
    "player_overview",
  ],

  coach_pro: [
    "player_overview",
    "coach_intelligence_dashboard",
  ],

  coach_team: [
    "player_overview",
    "coach_intelligence_dashboard",
    "team_alerts",
  ],
};
