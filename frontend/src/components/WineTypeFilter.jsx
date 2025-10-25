function WineTypeFilter({ selectedType, onTypeChange }) {
  const wineTypes = [
    { value: null, label: 'Alle', emoji: '🍷' },
    { value: 'red', label: 'Rood', emoji: '🍷' },
    { value: 'white', label: 'Wit', emoji: '🥂' },
    { value: 'rose', label: 'Rosé', emoji: '🌸' },
    { value: 'sparkling', label: 'Bubbels', emoji: '🍾' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Type wijn</h3>
      <div className="flex flex-wrap gap-3">
        {wineTypes.map((type) => (
          <button
            key={type.value || 'all'}
            onClick={() => onTypeChange(type.value)}
            className={`filter-button ${
              selectedType === type.value ? 'filter-button-active' : 'filter-button-inactive'
            }`}
          >
            <span className="mr-2">{type.emoji}</span>
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WineTypeFilter;

