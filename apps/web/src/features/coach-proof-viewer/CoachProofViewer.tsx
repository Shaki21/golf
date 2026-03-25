/**
 * TASK: Implement Coach PROOF Viewer (CPV)
 *
 * Purpose:
 * - Allow coach to view the exact same PROOF as the golfer
 * - Preserve absolute parity and neutrality
 *
 * Contract references:
 * - COACH_ADMIN_IMPLEMENTATION_CONTRACT.md
 * - COACH_ADMIN_SCREEN_CONTRACT.md
 *
 * NON-NEGOTIABLE:
 * - This component MUST be pixel-identical to golfer PROOF
 * - No role branching
 * - No wrapper logic
 * - No additional props
 */

//////////////////////////////
// 1. IMPORT EXACT PROOF
//////////////////////////////

import React from "react";
import Proof from "../../components/proof/Proof";
// ⬆️ path must point to the SAME component used by golfer

//////////////////////////////
// 2. COMPONENT
//////////////////////////////

type Props = {
  athleteId: string;
  testId: string;
};

export default function CoachProofViewer({ athleteId, testId }: Props) {
  return (
    <Proof
      athleteId={athleteId}
      testId={testId}
    />
  );
}

//////////////////////////////
// 3. STRICT NOTES
//////////////////////////////

/*
- Do NOT add styling.
- Do NOT add layout.
- Do NOT add coach context.
- Do NOT add labels, headers, or breadcrumbs.
- Do NOT modify Proof component in any way.
- Any difference from golfer PROOF is a contract violation.
*/
