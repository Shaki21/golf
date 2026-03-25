/**
 * SESSION Screen
 *
 * Responsibility: Support execution of the current training session.
 * Contract: See docs/IMPLEMENTATION_CONTRACT.md (S-01 to S-63, S-E1 to S-E6)
 *
 * MUST: Show current drill/block, timer, rep counter, pause/resume
 * MUST NOT: Show outcome, baseline, proof, evaluation, encouragement
 */

import React, { useState } from "react";

//////////////////////////////
// DATA MODEL (LOCAL, MOCK)
//////////////////////////////

type SessionBlock = {
  id: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  reps?: number;
};

const MOCK_BLOCK: SessionBlock = {
  id: "block-1",
  title: "Putting – 3 meter straight putts",
  description: "Focus on setup and alignment.",
  reps: 20,
};

//////////////////////////////
// SESSION SCREEN
//////////////////////////////

export default function SessionScreen() {
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [repsRemaining, setRepsRemaining] = useState<number | null>(
    MOCK_BLOCK.reps ?? null
  );

  function handleStart() {
    setIsActive(true);
  }

  function handlePause() {
    setIsActive(false);
  }

  function handleRepComplete() {
    if (repsRemaining === null) return;
    if (repsRemaining <= 1) {
      setRepsRemaining(0);
      setIsCompleted(true);
      setIsActive(false);
    } else {
      setRepsRemaining(repsRemaining - 1);
    }
  }

  function handleFinishBlock() {
    setIsCompleted(true);
    setIsActive(false);
  }

  return (
    <main aria-label="Training session">
      {/* Block context */}
      <section>
        <h1>{MOCK_BLOCK.title}</h1>
        {MOCK_BLOCK.description && <p>{MOCK_BLOCK.description}</p>}
      </section>

      {/* Active task */}
      <section>
        {repsRemaining !== null && (
          <p>
            Repetitions remaining: <strong>{repsRemaining}</strong>
          </p>
        )}
      </section>

      {/* Controls */}
      <section>
        {!isActive && !isCompleted && (
          <button onClick={handleStart}>Start</button>
        )}

        {isActive && (
          <>
            <button onClick={handlePause}>Pause</button>
            <button onClick={handleRepComplete}>Rep completed</button>
          </>
        )}

        {!isActive && !isCompleted && (
          <button onClick={handleFinishBlock}>Finish block</button>
        )}

        {isCompleted && <p>Block completed.</p>}
      </section>
    </main>
  );
}
