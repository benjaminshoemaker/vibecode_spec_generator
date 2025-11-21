import Link from "next/link";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-700">
      {/* Navigation */}
      <nav className="sticky top-4 z-50 max-w-6xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-md border-2 border-stone-100 rounded-full px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-coral-400 rounded-full flex items-center justify-center text-white font-black text-xl rotate-3">V</div>
            <span className="text-xl font-black text-stone-800 tracking-tight">Vibe Scaffold</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/wizard" 
              className="text-stone-500 hover:text-stone-800 font-bold transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/wizard" 
              className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-12 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full font-bold text-sm mb-8 rotate-1">
            ✨ AI-Powered Spec Generator
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 mb-8 leading-tight">
            Turn your messy ideas into <br/>
            <span className="text-coral-400 inline-block transform -rotate-1">crystal clear specs.</span>
          </h1>
          
          <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-12 font-medium">
            A friendly 4-step wizard that helps you define, design, and plan your next big app idea without the headache.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Link 
              href="/wizard" 
              className="px-8 py-4 bg-coral-400 hover:bg-coral-500 text-white text-lg font-bold rounded-2xl transition-all transform hover:-translate-y-1 hover:rotate-1 shadow-[0_8px_0_rgb(225,29,72)] hover:shadow-[0_4px_0_rgb(225,29,72)] active:shadow-none active:translate-y-2"
            >
              Start Building Now
            </Link>
            <a 
              href="#how-it-works" 
              className="px-8 py-4 bg-white text-stone-700 border-2 border-stone-200 hover:border-stone-300 text-lg font-bold rounded-2xl transition-colors"
            >
              See Example
            </a>
          </div>

          {/* Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-teal-200 rounded-[3rem] rotate-2"></div>
            <div className="relative bg-white border-4 border-stone-100 rounded-[3rem] p-8 md:p-12 shadow-sm">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div className="bg-stone-50 rounded-3xl p-6 text-left border-2 border-stone-100">
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-stone-200"></div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none border-2 border-stone-100 text-sm font-medium text-stone-600">
                        I want to build a plant watering app!
                      </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-coral-400 flex items-center justify-center text-white text-xs font-bold">AI</div>
                      <div className="bg-coral-50 p-3 rounded-2xl rounded-tr-none border-2 border-coral-100 text-sm font-medium text-coral-800">
                        I love that! 🌿 Should it track individual plants or just general schedules?
                      </div>
                    </div>
                 </div>
                 <div className="text-left">
                    <div className="inline-block p-3 bg-teal-100 rounded-2xl mb-4 text-teal-700 font-bold">
                       Generated Output
                    </div>
                    <h3 className="text-2xl font-black text-stone-900 mb-2">Detailed Specs</h3>
                    <p className="text-stone-500 font-medium">We automatically create professional documentation from your casual conversation.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Steps Grid */}
        <div id="how-it-works" className="max-w-6xl mx-auto mt-32 px-4">
          <h2 className="text-3xl font-black text-stone-900 text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "One Pager", desc: "The big idea", color: "bg-coral-100 text-coral-600" },
              { step: "2", title: "Dev Spec", desc: "The nitty gritty", color: "bg-teal-100 text-teal-600" },
              { step: "3", title: "Prompt Plan", desc: "The blueprint", color: "bg-blue-100 text-blue-600" },
              { step: "4", title: "AGENTS.md", desc: "The robot manual", color: "bg-purple-100 text-purple-600" }
            ].map((feature) => (
              <div key={feature.step} className="bg-white p-6 rounded-3xl border-2 border-stone-100 hover:border-stone-200 transition-all cursor-default">
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center text-xl font-black mb-4 rotate-3`}>
                  {feature.step}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-stone-500 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}