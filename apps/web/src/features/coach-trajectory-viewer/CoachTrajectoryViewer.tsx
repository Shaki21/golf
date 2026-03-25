/**
 * TASK: Implement Coach Trajectory Viewer (CTV)
 *
 * Purpose:
 * - Allow coach to view the exact same historical trajectory as the golfer
 * - Preserve absolute neutrality and parity
 *
 * Contract references:
 * - COACH_ADMIN_IMPLEMENTATION_CONTRACT.md
 * - COACH_ADMIN_SCREEN_CONTRACT.md
 *
 * NON-NEGOTIABLE:
 * - Must be identical to golfer TRAJECTORY
 * - No trends, no summaries, no interpretation
 * - No role branching
 */

//////////////////////////////
// 1. IMPORT EXACT TRAJECTORY
//////////////////////////////

import React from "react";
import Trajectory from "../../components/trajectory/Trajectory";
// ⬆️ MUST be the same component used in golfer experience

//////////////////////////////
// 2. COMPONENT
//////////////////////////////

type Props = {
  athleteId: string;
};

export default function CoachTrajectoryViewer({ athleteId }: Props) {
  return <Trajectory athleteId={athleteId} />;
}

//////////////////////////////
// 3. STRICT NOTES
//////////////////////////////

/*
- Do NOT add styling.
- Do NOT add headers, titles, or labels.
- Do NOT add filters or grouping.
- Do NOT add trend indicators or deltas beyond what Trajectory already shows.
- Do NOT wrap this in cards, panels, or coach-specific layout.
- Any deviation from golfer TRAJECTORY is a contract violation.
*/
