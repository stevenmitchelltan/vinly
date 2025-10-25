function WineCard({ wine }) {
  const getWineTypeEmoji = (type) => {
    const emojis = {
      red: '🍷',
      white: '🥂',
      rose: '🌸',
      sparkling: '🍾',
    };
    return emojis[type] || '🍷';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="wine-card">
      {/* Image */}
      <div className="relative bg-gradient-to-br from-burgundy-100 to-rose-100 h-48 flex items-center justify-center overflow-hidden">
        {wine.image_url ? (
          <img
            src={wine.image_url}
            alt={wine.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x400?text=Wine+Bottle';
            }}
          />
        ) : (
          <div className="text-6xl">{getWineTypeEmoji(wine.wine_type)}</div>
        )}
        
        {/* Stock status badge */}
        {wine.in_stock !== null && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
            wine.in_stock ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {wine.in_stock ? '✓ Op voorraad' : '✗ Mogelijk uitverkocht'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Supermarket badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block bg-burgundy-100 text-burgundy-800 px-3 py-1 rounded-full text-sm font-medium">
            {wine.supermarket}
          </span>
          <span className="text-2xl">{getWineTypeEmoji(wine.wine_type)}</span>
        </div>

        {/* Wine name */}
        <h3 className="font-bold text-lg text-gray-900 leading-tight">
          {wine.name}
        </h3>

        {/* Rating */}
        {wine.rating && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">{wine.rating}</span>
          </div>
        )}

        {/* Description */}
        {wine.description && (
          <p className="text-sm text-gray-600 line-clamp-4">
            {wine.description}
          </p>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <p className="text-xs text-gray-500">
            📸 van <span className="font-medium">@{wine.influencer_source}</span>
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(wine.date_found)}
          </p>
          
          {/* Link to Instagram post */}
          <a
            href={wine.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-burgundy-600 hover:text-burgundy-800 font-medium"
          >
            Bekijk originele post →
          </a>
        </div>
      </div>
    </div>
  );
}

export default WineCard;

