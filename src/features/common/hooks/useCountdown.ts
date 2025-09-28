import { useEffect, useState } from 'react';

export function useCountdown(initial: number, onDone?: () => void) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    if (left <= 0) { onDone?.(); return; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return left;
}
