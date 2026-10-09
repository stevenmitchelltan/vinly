function WineReview({ wine, className = '', captionRef }) {
  const source = (wine.influencer_source || '').replace(/_tiktok$/, '');
  const postUrl = (wine.post_url || '').split('#')[0];

  if (!source && !wine.rating) return null;

  return (
    <p ref={captionRef} className={`text-th-text leading-relaxed ${className}`}>
      {source && (
        <>
          {postUrl ? (
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-th-accent"
              aria-label={`Bekijk de oorspronkelijke post van ${source}`}
            >
              {source}
            </a>
          ) : <span className="font-semibold">{source}</span>}
          {wine.rating && ' '}
        </>
      )}
      {wine.rating}
    </p>
  );
}

export default WineReview;
