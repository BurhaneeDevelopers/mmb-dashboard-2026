interface NoResultsProps {
  onClear: () => void;
}

export function NoResults({ onClear }: NoResultsProps) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
      <div className="text-4xl mb-3">🔍</div>
      <h3 className="text-base font-bold text-slate-800 mb-1">No Results Found</h3>
      <p className="text-slate-500 text-sm mb-4">Try a different search or clear your filters.</p>
      <button
        onClick={onClear}
        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
