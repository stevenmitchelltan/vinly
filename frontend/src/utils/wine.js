export function getWineTypeEmoji(type) {
  const emojis = {
    red: '\u{1F377}',
    white: '\u{1F942}',
    rose: '\u{1F338}',
    sparkling: '\u{1F37E}',
  };
  return emojis[type] || '\u{1F377}';
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const wineTypes = {
  red: { label: 'Rood', color: '#a64b52' },
  white: { label: 'Wit', color: '#ae8d42' },
  rose: { label: 'Rosé', color: '#c47c8b' },
  sparkling: { label: 'Bubbels', color: '#8c9561' },
};
