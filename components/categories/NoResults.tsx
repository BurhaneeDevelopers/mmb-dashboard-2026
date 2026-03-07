interface NoResultsProps {
  search: string;
  onClear: () => void;
}

export function NoResults({ search, onClear }: NoResultsProps) {
  return (
    <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
      <div className="text-4xl mb-3">🔍</div>
      <p className="text-slate-600 font-medium">No categories match &quot;{search}&quot;</p>
      <button
        onClick={onClear}
        className="mt-3 text-sm text-indigo-500 hover:text-indigo-700 font-medium"
      >
        Clear search
      </button>
    </div>
  );
}
