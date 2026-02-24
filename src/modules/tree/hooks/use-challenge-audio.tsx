import { useEffect, useMemo, useRef } from "react";
import { useAtomValue } from "jotai";
import { treeAtom } from "@/store/tree";

import { AudioManager } from "@/lib/audio-manager";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetParents } from "@/hooks/queries/useGetParents";
import { buildChallengePathFromParents } from "@/common/utils/game/challenge-path";

export const useChallengeAudio = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const challengeStatus = challenge.status;
  const speciesKey = challenge.speciesKey ?? 0;
  const challengeActive =
    challengeStatus === "IN_PROGRESS" || challengeStatus === "COMPLETED";

  const hasPlayedWinSound = useRef(false);
  const prevNodeKeysRef = useRef<Set<number>>(new Set());

  const { data: specieDetail } = useGetSpecieDetail({ specieKey: speciesKey });
  const { data: parentsData } = useGetParents(speciesKey, challengeActive);

  const correctPath = useMemo(() => {
    if (!parentsData || !specieDetail) return [];
    return buildChallengePathFromParents(
      parentsData,
      specieDetail.canonicalName ?? specieDetail.species ?? "",
      speciesKey,
    );
  }, [parentsData, specieDetail, speciesKey]);

  useEffect(() => {
    if (challengeStatus !== "COMPLETED") return;
    if (hasPlayedWinSound.current) return;

    AudioManager.play("win");
    hasPlayedWinSound.current = true;
  }, [challengeStatus]);

  useEffect(() => {
    if (challengeStatus !== "IN_PROGRESS") return;

    if (expandedNodes.length === 0) {
      prevNodeKeysRef.current = new Set();
      return;
    }

    const lastNode = expandedNodes[expandedNodes.length - 1];
    if (!lastNode) return;

    const isNewNode = !prevNodeKeysRef.current.has(lastNode.key);

    prevNodeKeysRef.current = new Set(expandedNodes.map((n) => n.key));

    if (!isNewNode) return;

    const stepIndex = expandedNodes.length - 1;
    const expected = correctPath[stepIndex];
    if (!expected) return;

    const isCorrect =
      lastNode.name.toLowerCase() === expected.name.toLowerCase();

    if (isCorrect) {
      AudioManager.play("success");
    } else {
      AudioManager.play("error");
    }
  }, [expandedNodes, challengeStatus, correctPath]);

  useEffect(() => {
    hasPlayedWinSound.current = false;
    prevNodeKeysRef.current = new Set();
  }, [speciesKey]);
};
