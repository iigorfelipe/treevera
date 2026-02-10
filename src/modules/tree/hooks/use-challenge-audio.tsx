import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { treeAtom } from "@/store/tree";

import {
  getDailySpecies,
  speciesPaths,
} from "@/common/utils/game/daily-species";
import { AudioManager } from "@/lib/audio-manager";

export const useChallengeAudio = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challengeStatus = useAtomValue(treeAtom.challenge).status;
  const [playedSteps, setPlayedSteps] = useAtom(treeAtom.feedbackAudio);

  const hasPlayedWinSound = useRef(false);

  useEffect(() => {
    if (challengeStatus !== "COMPLETED") return;
    if (hasPlayedWinSound.current) return;

    AudioManager.play("win");
    hasPlayedWinSound.current = true;
  }, [challengeStatus]);

  useEffect(() => {
    if (challengeStatus !== "IN_PROGRESS") return;
    if (expandedNodes.length === 0) return;

    const stepIndex = expandedNodes.length - 1;
    const currentNode = expandedNodes[stepIndex];

    if (!currentNode) return;

    const audioKey = `${stepIndex}:${currentNode.key}`;

    if (playedSteps[audioKey]) return;

    const speciesName = getDailySpecies();
    const correctPath = speciesPaths[speciesName] || [];

    const expected = correctPath[stepIndex];
    if (!expected) return;

    const isCorrect =
      currentNode.name.toLowerCase() === expected.name.toLowerCase();

    if (isCorrect) {
      AudioManager.play("success");
    } else {
      AudioManager.play("error");
    }

    setPlayedSteps((prev) => ({
      ...prev,
      [audioKey]: true,
    }));
  }, [expandedNodes, challengeStatus, playedSteps, setPlayedSteps]);

  useEffect(() => {
    if (challengeStatus === "NOT_STARTED") {
      hasPlayedWinSound.current = false;
    }
  }, [challengeStatus]);
};
