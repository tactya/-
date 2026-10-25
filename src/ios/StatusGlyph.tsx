export function StatusGlyph({
  kind,
}: {
  kind: "silent" | "cellular" | "wifi";
}) {
  if (kind === "silent")
    return (
      <svg className="status-silent" viewBox="0 0 14 18" aria-hidden="true">
        <path
          d="M5 2.2A3.3 3.3 0 0 1 10.4 5v3.1l1.8 3.2H7M2.8 5.3v2.8L1 11.3h3.2M5.2 14a1.9 1.9 0 0 0 3.6 0M1 1l12 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (kind === "cellular")
    return (
      <svg className="status-cellular" viewBox="0 0 22 16" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <g key={i} fill="currentColor" opacity={i === 3 ? 0.25 : 1}>
            <rect
              x={i * 5.5}
              y={7 - i * 2}
              width="3.8"
              height={6 + i * 2}
              rx="1.8"
            />
            <rect x={i * 5.5} y="14" width="3.8" height="2" rx="1" />
          </g>
        ))}
      </svg>
    );
  return (
    <svg className="status-wifi" viewBox="0 0 20 16" aria-hidden="true">
      <path
        d="M1.6 4.4a13.3 13.3 0 0 1 16.8 0M4.6 8a8.6 8.6 0 0 1 10.8 0M7.7 11.3a3.7 3.7 0 0 1 4.6 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="m8.3 13.2 1.7 1.7 1.7-1.7a2.6 2.6 0 0 0-3.4 0"
        fill="currentColor"
      />
    </svg>
  );
}
