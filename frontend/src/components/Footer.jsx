function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-burgundy-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center space-y-5">
          <p className="text-gray-700 font-semibold text-lg">
            🍷 Vinly - Wijn aanbevelingen van Nederlandse influencers
          </p>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Data verzameld van TikTok wijn influencers. Deze app is niet officieel geaffilieerd met supermarkten.
          </p>
          <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg py-2 px-4 inline-block">
            ⚠️ Let op: Wijn aanbevelingen zijn gebaseerd op influencer meningen. Drink verantwoord.
          </p>
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-medium">
              © 2025 Vinly - MIT License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

