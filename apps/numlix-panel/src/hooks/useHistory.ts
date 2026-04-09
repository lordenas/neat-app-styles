import { useState, useCallback, useRef } from "react";

export function useHistory<T>(initial: T | (() => T), maxSize = 10) {
  const [current, setCurrent] = useState<T>(typeof initial === "function" ? (initial as () => T)() : initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const push = useCallback((newState: T) => {
    past.current = [...past.current.slice(-(maxSize - 1)), current];
    future.current = [];
    setCurrent(newState);
  }, [current, maxSize]);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [current, ...future.current.slice(0, maxSize - 1)];
    setCurrent(prev);
  }, [current, maxSize]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current.slice(-(maxSize - 1)), current];
    setCurrent(next);
  }, [current, maxSize]);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return { state: current, setState: push, setStateDirectly: setCurrent, undo, redo, canUndo, canRedo };
}
