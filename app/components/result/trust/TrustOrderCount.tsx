'use client';

import { useEffect, useState } from 'react';

type Props = {
  initial: number;
  locale: string;
};

export default function TrustOrderCount({ initial, locale }: Props) {
  const [n, setN] = useState(initial);

  useEffect(() => {
    const fetchCount = () => {
      fetch('/api/data/count')
        .then((res) => res.json())
        .then((data: { totalCount?: number | null }) => {
          if (data.totalCount != null) setN(data.totalCount);
        })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 300_000);
    return () => clearInterval(interval);
  }, []);

  return <span className="ds-trust-stat__num">{n.toLocaleString(locale)}</span>;
}
