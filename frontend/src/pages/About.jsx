function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 md:p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-cream-100">
            Over Vinly
          </h1>
          <p className="text-xl text-cream-400">
            Jouw gids voor de beste supermarkt wijnen in Nederland
          </p>
        </div>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-cream-100 flex items-center">
            <span className="mr-3">🔍</span>
            Hoe werkt het?
          </h2>
          <div className="space-y-3 text-cream-300">
            <p>
              Vinly verzamelt automatisch wijn aanbevelingen van populaire Nederlandse wijn influencers op Instagram.
            </p>
            <p>
              Elke dag scannen we nieuwe posts, transcriberen video reviews, en extraheren gestructureerde informatie over welke wijnen goed zijn en waar je ze kunt vinden.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-cream-100 flex items-center">
            <span className="mr-3">✨</span>
            Functies
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-2xl mr-3">🏪</span>
              <div className="text-cream-300">
                <strong className="text-cream-100">6 Nederlandse supermarkten:</strong> Albert Heijn, Dirk, HEMA, LIDL, Jumbo, en ALDI
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">🤖</span>
              <div className="text-cream-300">
                <strong className="text-cream-100">Automatische updates:</strong> Database wordt dagelijks ververst met nieuwe aanbevelingen
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">📊</span>
              <div className="text-cream-300">
                <strong className="text-cream-100">Ratings & reviews:</strong> Zie wat influencers zeggen over elke wijn
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">🎯</span>
              <div className="text-cream-300">
                <strong className="text-cream-100">Filteropties:</strong> Zoek op supermarkt en wijntype (rood, wit, rosé, mousserende)
              </div>
            </li>
          </ul>
        </section>

        {/* Technology */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-cream-100 flex items-center">
            <span className="mr-3">⚙️</span>
            Technologie
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-stone-800/60 border border-stone-700 p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-cream-100">Backend</h3>
              <ul className="text-sm space-y-1 text-cream-400">
                <li>• Python FastAPI</li>
                <li>• MongoDB database</li>
                <li>• OpenAI Whisper (transcriptie)</li>
                <li>• GPT-4o-mini (data extractie)</li>
                <li>• Instaloader (Instagram scraping)</li>
              </ul>
            </div>
            <div className="bg-stone-800/60 border border-stone-700 p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-cream-100">Frontend</h3>
              <ul className="text-sm space-y-1 text-cream-400">
                <li>• React 18</li>
                <li>• Vite</li>
                <li>• TailwindCSS</li>
                <li>• GitHub Pages hosting</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-stone-800/40 border border-stone-700 p-6 rounded-xl space-y-2">
          <h2 className="text-xl font-bold text-gold-500 flex items-center">
            <span className="mr-2">⚠️</span>
            Disclaimer
          </h2>
          <ul className="text-sm text-cream-400 space-y-2">
            <li>• Deze app is niet officieel geaffilieerd met de genoemde supermarkten of influencers</li>
            <li>• Wijn aanbevelingen zijn gebaseerd op meningen van influencers en persoonlijke smaken kunnen verschillen</li>
            <li>• Voorraad informatie is indicatief en kan verouderd zijn</li>
            <li>• Data wordt automatisch verzameld via web scraping (Instagram ToS)</li>
            <li>• Drink verantwoord en volgens de Nederlandse wetgeving (18+)</li>
          </ul>
        </section>

        {/* Open Source */}
        <section className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-cream-100">
            Open Source
          </h2>
          <p className="text-cream-300">
            Vinly is open source en beschikbaar onder de MIT licentie.
          </p>
          <a
            href="https://github.com/yourusername/vinly"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block btn-primary"
          >
            Bekijk op GitHub →
          </a>
        </section>
      </div>
    </div>
  );
}

export default About;
