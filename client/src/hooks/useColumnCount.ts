import { useState, useEffect } from 'react';
import type { CardSize } from '@/../../shared/types';

// Tailwind breakpoints
const SM = 640;
const LG = 1024;
const XL = 1280;

const COLUMN_MAP: Record<CardSize, [number, number, number, number]> = {
  // [<sm, sm-lg, lg-xl, xl+]
  lg: [1, 2, 3, 4],
  md: [2, 3, 4, 5],
  sm: [2, 4, 5, 6],
};

function getColumns(width: number, cardSize: CardSize): number {
  const cols = COLUMN_MAP[cardSize];
  if (width >= XL) return cols[3];
  if (width >= LG) return cols[2];
  if (width >= SM) return cols[1];
  return cols[0];
}

export function useColumnCount(cardSize: CardSize): number {
  const [columns, setColumns] = useState(() =>
    typeof window !== 'undefined' ? getColumns(window.innerWidth, cardSize) : 4,
  );

  useEffect(() => {
    const update = () => setColumns(getColumns(window.innerWidth, cardSize));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [cardSize]);

  return columns;
}
