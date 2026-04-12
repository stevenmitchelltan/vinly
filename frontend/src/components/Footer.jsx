function Footer() {
  return (
    <footer className="bg-th-surface border-t border-th-border mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center space-y-5">
          <p className="text-th-text font-semibold text-lg font-fraunces">
            🍷 Vinly
          </p>
          <p className="text-sm text-th-text-sub max-w-2xl mx-auto leading-relaxed">
            Wijn aanbevelingen van Nederlandse influencers. Data verzameld van TikTok wijn influencers.
            Deze app is niet officieel geaffilieerd met supermarkten.
          </p>
          <div className="pt-6 border-t border-th-border">
            <p className="text-xs text-th-text-dim font-medium">
              © 2026 Vinly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
