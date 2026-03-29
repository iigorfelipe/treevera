import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import { treeAtom } from "@/store/tree";

import { AudioManager } from "@/lib/audio-manager";

export const useChallengeAudio = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const challengeStatus = challenge.status;
  const speciesKey = challenge.speciesKey ?? 0;

  const correctPath = useAtomValue(treeAtom.challengeCorrectPath);

  const prevNodeKeysRef = useRef<Set<number>>(new Set());

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
    prevNodeKeysRef.current = new Set();
  }, [speciesKey]);
};
