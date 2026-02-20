import { useEffect, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { treeAtom } from "@/store/tree";

import { AudioManager } from "@/lib/audio-manager";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { buildChallengePathFromDetail } from "@/common/utils/game/challenge-path";

export const useChallengeAudio = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const challengeStatus = challenge.status;
  const speciesKey = challenge.speciesKey ?? 0;
  const [playedSteps, setPlayedSteps] = useAtom(treeAtom.feedbackAudio);

  const hasPlayedWinSound = useRef(false);

  const { data: specieDetail } = useGetSpecieDetail({ specieKey: speciesKey });

  const correctPath = useMemo(
    () => (specieDetail ? buildChallengePathFromDetail(specieDetail) : []),
    [specieDetail],
  );

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
  }, [expandedNodes, challengeStatus, playedSteps, setPlayedSteps, correctPath]);

  useEffect(() => {
    if (challengeStatus === "NOT_STARTED") {
      hasPlayedWinSound.current = false;
    }
  }, [challengeStatus]);
};
