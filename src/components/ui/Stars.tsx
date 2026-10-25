export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5 text-clay" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
          <path
            d="m12 2.8 2.7 5.8 6.3.7-4.7 4.3 1.3 6.3L12 16.7 6.4 20l1.3-6.3L3 9.3l6.3-.7L12 2.8Z"
            fill={i < value ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}
