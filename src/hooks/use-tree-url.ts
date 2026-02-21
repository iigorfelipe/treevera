import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { treeAtom, setExpandedPathAtom } from "@/store/tree";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";
import { capitalizar } from "@/common/utils/string";
import type { PathNode } from "@/common/types/tree-atoms";

export function useTreeUrl() {
  const navigate = useNavigate();
  const location = useLocation();
  const setExpandedPath = useSetAtom(setExpandedPathAtom);
  const allNodes = useAtomValue(treeAtom.nodes);

  const allNodesRef = useRef(allNodes);
  const pendingKeys = useRef<number[]>([]);
  const resolvedPath = useRef<PathNode[]>([]);
  const lastUrl = useRef("");
  const done = useRef(true);

  useEffect(() => {
    allNodesRef.current = allNodes;
  }, [allNodes]);

  const tryResolveNext = () => {
    if (done.current || pendingKeys.current.length === 0) return;

    const nextKey = pendingKeys.current[0];
    const node = allNodesRef.current[nextKey];

    if (!node) return;

    const pathNode: PathNode = {
      key: node.key,
      rank: node.rank,
      name:
        node.rank === "KINGDOM"
          ? capitalizar(NAME_KINGDOM_BY_KEY[node.key])
          : node.canonicalName || node.scientificName || "",
    };

    const newResolved = [...resolvedPath.current, pathNode];
    const remaining = pendingKeys.current.slice(1);

    resolvedPath.current = newResolved;
    pendingKeys.current = remaining;

    if (remaining.length === 0) {
      done.current = true;
    }

    setExpandedPath(newResolved);

    if (remaining.length > 0) {
      tryResolveNext();
    }
  };

  useEffect(() => {
    if (done.current) return;
    tryResolveNext();
  }, [allNodes]); // eslint-disable-line

  useEffect(() => {
    const fullUrl = location.pathname;
    if (fullUrl === lastUrl.current) return;
    lastUrl.current = fullUrl;

    const pathname = fullUrl.replace("/treevera", "");
    const parts = pathname.split("/").filter(Boolean);

    if (parts[0] !== "tree") {
      pendingKeys.current = [];
      resolvedPath.current = [];
      done.current = true;
      setExpandedPath([]);
      return;
    }

    const keyStrings = parts.slice(1);

    if (keyStrings.length === 0) {
      pendingKeys.current = [];
      resolvedPath.current = [];
      done.current = true;
      setExpandedPath([]);
      return;
    }

    const keys = keyStrings.map(Number);
    if (keys.some(isNaN)) {
      console.warn("⚠️ URL com keys invalidas:", keyStrings);
      navigate({ to: "/", replace: true });
      return;
    }

    pendingKeys.current = keys;
    resolvedPath.current = [];
    done.current = false;

    tryResolveNext();
  }, [location.pathname]); // eslint-disable-line
}
