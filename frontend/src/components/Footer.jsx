function Footer() {
  return (
    <footer className="bg-stone-900 border-t border-stone-800 mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center space-y-5">
          <p className="text-cream-200 font-semibold text-lg font-fraunces">
            🍷 Vinly
          </p>
          <p className="text-sm text-cream-400 max-w-2xl mx-auto leading-relaxed">
            Wijn aanbevelingen van Nederlandse influencers. Data verzameld van TikTok wijn influencers.
            Deze app is niet officieel geaffilieerd met supermarkten.
          </p>
          <p className="text-xs text-stone-400 bg-stone-800/60 border border-stone-700 rounded-lg py-2 px-4 inline-block">
            ⚠️ Wijn aanbevelingen zijn gebaseerd op influencer meningen. Drink verantwoord.
          </p>
          <div className="pt-6 border-t border-stone-800">
            <p className="text-xs text-stone-600 font-medium">
              © 2025 Vinly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
