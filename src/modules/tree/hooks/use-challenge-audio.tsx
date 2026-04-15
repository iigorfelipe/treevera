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

  const prevExpandedNodesRef = useRef(expandedNodes);

  useEffect(() => {
    if (challengeStatus !== "IN_PROGRESS") return;

    if (expandedNodes.length === 0) {
      prevExpandedNodesRef.current = [];
      return;
    }

    const previousExpandedNodes = prevExpandedNodesRef.current;
    const lastNode = expandedNodes[expandedNodes.length - 1];
    if (!lastNode) return;

    const previousLastNode =
      previousExpandedNodes[previousExpandedNodes.length - 1];
    const selectedNewStep = expandedNodes.length > previousExpandedNodes.length;
    const changedNodeAtSameStep =
      expandedNodes.length === previousExpandedNodes.length &&
      previousLastNode?.key !== lastNode.key;

    prevExpandedNodesRef.current = expandedNodes;

    if (!selectedNewStep && !changedNodeAtSameStep) return;

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
    prevExpandedNodesRef.current = [];
  }, [speciesKey]);
};
