function ViewModeToggle({ value, onChange, compact = false }) {
  return (
    <div className="inline-flex rounded-lg border border-th-border-sub overflow-hidden" role="group" aria-label="Weergave">
      {['grid', 'list'].map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-label={mode === 'grid' ? 'Rasterweergave' : 'Lijstweergave'}
          aria-pressed={value === mode}
          className={`flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-th-accent ${compact ? 'p-1.5' : 'px-3 min-h-11'} ${value === mode ? 'bg-th-elevated text-th-text' : 'text-th-text-dim hover:text-th-text'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={mode === 'grid'
              ? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
              : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
          {!compact && (mode === 'grid' ? 'Raster' : 'Lijst')}
        </button>
      ))}
    </div>
  );
}

export default ViewModeToggle;
