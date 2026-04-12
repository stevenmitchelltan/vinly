function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-th-surface rounded-2xl border border-th-border p-8 md:p-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-th-text">
            Over Vinly
          </h1>
          <p className="text-xl text-th-text-dim">
            Jouw gids voor de beste supermarkt wijnen in Nederland
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-th-text flex items-center">
            <span className="mr-3">🔍</span>
            Hoe werkt het?
          </h2>
          <div className="space-y-3 text-th-text-sub">
            <p>Vinly verzamelt automatisch wijn aanbevelingen van populaire Nederlandse wijn influencers op Instagram.</p>
            <p>Elke dag scannen we nieuwe posts, transcriberen video reviews, en extraheren gestructureerde informatie over welke wijnen goed zijn en waar je ze kunt vinden.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-th-text flex items-center">
            <span className="mr-3">✨</span>
            Functies
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-2xl mr-3">🏪</span>
              <div className="text-th-text-sub"><strong className="text-th-text">6 Nederlandse supermarkten:</strong> Albert Heijn, Dirk, HEMA, LIDL, Jumbo, en ALDI</div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">🤖</span>
              <div className="text-th-text-sub"><strong className="text-th-text">Automatische updates:</strong> Database wordt dagelijks ververst met nieuwe aanbevelingen</div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">📊</span>
              <div className="text-th-text-sub"><strong className="text-th-text">Ratings & reviews:</strong> Zie wat influencers zeggen over elke wijn</div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">🎯</span>
              <div className="text-th-text-sub"><strong className="text-th-text">Filteropties:</strong> Zoek op supermarkt en wijntype (rood, wit, rosé, mousserende)</div>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-th-text flex items-center">
            <span className="mr-3">⚙️</span>
            Technologie
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-th-elevated/60 border border-th-border-sub p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-th-text">Backend</h3>
              <ul className="text-sm space-y-1 text-th-text-dim">
                <li>• Python FastAPI</li>
                <li>• MongoDB database</li>
                <li>• OpenAI Whisper (transcriptie)</li>
                <li>• GPT-4o-mini (data extractie)</li>
                <li>• Instaloader (Instagram scraping)</li>
              </ul>
            </div>
            <div className="bg-th-elevated/60 border border-th-border-sub p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-th-text">Frontend</h3>
              <ul className="text-sm space-y-1 text-th-text-dim">
                <li>• React 18</li>
                <li>• Vite</li>
                <li>• TailwindCSS</li>
                <li>• GitHub Pages hosting</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-th-elevated/40 border border-th-border-sub p-6 rounded-xl space-y-2">
          <h2 className="text-xl font-bold text-th-accent flex items-center">
            <span className="mr-2">⚠️</span>
            Disclaimer
          </h2>
          <ul className="text-sm text-th-text-dim space-y-2">
            <li>• Deze app is niet officieel geaffilieerd met de genoemde supermarkten of influencers</li>
            <li>• Wijn aanbevelingen zijn gebaseerd op meningen van influencers en persoonlijke smaken kunnen verschillen</li>
            <li>• Voorraad informatie is indicatief en kan verouderd zijn</li>
            <li>• Data wordt automatisch verzameld via web scraping (Instagram ToS)</li>
            <li>• Drink verantwoord en volgens de Nederlandse wetgeving (18+)</li>
          </ul>
        </section>

        <section className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-th-text">Open Source</h2>
          <p className="text-th-text-sub">Vinly is open source en beschikbaar onder de MIT licentie.</p>
          <a href="https://github.com/yourusername/vinly" target="_blank" rel="noopener noreferrer" className="inline-block btn-primary">
            Bekijk op GitHub →
          </a>
        </section>
      </div>
    </div>
  );
}

export default About;
