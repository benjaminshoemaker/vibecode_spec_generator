export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-12 border-t-2 border-stone-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-coral-400 rounded-xl flex items-center justify-center text-white font-black text-xl rotate-3">
                V
              </div>
              <span className="font-black text-stone-800 text-lg tracking-tight">
                Vibe Scaffold
              </span>
            </div>
            <p className="text-sm text-stone-500 font-medium">
              Turn your messy ideas into crystal clear specs.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wide">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/wizard"
                  className="text-stone-600 hover:text-coral-500 transition-colors text-sm font-medium"
                >
                  Get Started
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="text-stone-600 hover:text-coral-500 transition-colors text-sm font-medium"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wide">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/benjaminshoemaker/vibecode_spec_generator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 hover:text-coral-500 transition-colors text-sm font-medium"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://docs.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 hover:text-coral-500 transition-colors text-sm font-medium"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wide">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://forms.gle/CBvAEG7YLxdJvezD6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 hover:text-coral-500 transition-colors text-sm font-medium"
                >
                  Send Feedback
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-stone-600 hover:text-coral-500 transition-colors text-sm font-medium"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-stone-600 hover:text-coral-500 transition-colors text-sm font-medium"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone-500 font-medium">
            © {currentYear} Vibe Scaffold. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/benjaminshoemaker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-coral-500 transition-colors"
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
