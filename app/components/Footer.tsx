import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-[18px] h-[18px] bg-accent flex items-center justify-center">
                 <div className="w-2 h-2 bg-zinc-950"></div>
              </div>
              <span className="font-mono font-bold text-white tracking-tight text-sm">
                VIBE_SCAFFOLD
              </span>
            </div>
            <p className="text-[13px] text-[#a1a1aa] max-w-[280px]">
              Turn your ideas into production-ready specifications. Built for vibe coders who want professional results.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-mono text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/wizard" className="text-[13px] text-[#e4e4e7] hover:text-accent transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-[13px] text-[#e4e4e7] hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/benjaminshoemaker/vibecode_spec_generator" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#e4e4e7] hover:text-accent transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://github.com/benjaminshoemaker/vibecode_spec_generator/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#e4e4e7] hover:text-accent transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-mono text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://discord.gg/9v3GpsEpCa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#e4e4e7] hover:text-accent transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://forms.gle/CBvAEG7YLxdJvezD6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#e4e4e7] hover:text-accent transition-colors"
                >
                  Send Feedback
                </a>
              </li>
              <li>
                <a href="https://github.com/benjaminshoemaker/vibecode_spec_generator/blob/main/PRIVACY_POLICY.md" className="text-[13px] text-[#e4e4e7] hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://github.com/benjaminshoemaker/vibecode_spec_generator/blob/main/TERMS_OF_SERVICE.md" className="text-[13px] text-[#e4e4e7] hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#a1a1aa] font-mono">
            © {currentYear} Vibe Scaffold. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/benjaminshoemaker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a1a1aa] hover:text-accent transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
