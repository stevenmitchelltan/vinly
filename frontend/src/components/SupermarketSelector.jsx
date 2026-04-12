import { SupermarketIcon } from './icons/SupermarketIcons';

function SupermarketSelector({ supermarkets = [], selectedSupermarket, onSupermarketChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-widest text-th-text-dim">
        Supermarkt
      </label>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => onSupermarketChange(null)}
          className={`filter-button ${
            selectedSupermarket === null ? 'filter-button-active' : 'filter-button-inactive'
          }`}
          aria-label="Toon alle supermarkten"
        >
          Alle
        </button>
        {supermarkets.map((supermarket) => (
          <button
            key={supermarket.value}
            onClick={() => onSupermarketChange(supermarket.value)}
            className={`filter-button ${
              selectedSupermarket === supermarket.value
                ? 'filter-button-active'
                : 'filter-button-inactive'
            }`}
            aria-label={`Filter op ${supermarket.name}`}
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <SupermarketIcon name={supermarket.name} />
              <span>{supermarket.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SupermarketSelector;
