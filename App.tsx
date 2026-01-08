
import React, { useState } from 'react';
import { analyzeMoodAndRecommend } from './services/gemini';
import { MoodAnalysis } from './types';

// Components
import RecommendationCard from './components/RecommendationCard';

enum Step {
  CONSENT,
  INPUT,
  PROCESSING,
  RESULTS
}

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.CONSENT);
  const [loadingMsg, setLoadingMsg] = useState('Analyzing your input...');
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);

  // Detailed Questionnaire State
  const [textInput, setTextInput] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [socialContext, setSocialContext] = useState<string>('Alone');
  const [activityContext, setActivityContext] = useState<string>('Relaxing');
  const [primaryGoal, setPrimaryGoal] = useState<string>('Relax');

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Location permission denied. Please enter manually.");
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      alert("Please provide your location to get local recommendations.");
      return;
    }
    if (!textInput.trim()) {
      alert("Please share a little about what's on your mind.");
      return;
    }
    setStep(Step.PROCESSING);
    
    try {
      setLoadingMsg("Synthesizing your mood profile...");
      const result = await analyzeMoodAndRecommend({
        text: textInput,
        location,
        gender,
        energyLevel,
        socialContext,
        activityContext,
        primaryGoal
      });
      setAnalysis(result);
      setStep(Step.RESULTS);
    } catch (err) {
      console.error(err);
      alert("Something went wrong during analysis. Let's try again.");
      setStep(Step.INPUT);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setStep(Step.INPUT);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">M</div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">MoodSync <span className="text-indigo-600">India</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Hyper-Personalized</p>
          </div>
        </div>
        {step === Step.RESULTS && (
          <button onClick={reset} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
            Start Fresh
          </button>
        )}
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        {step === Step.CONSENT && (
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 text-center border border-gray-100 max-w-lg mx-auto mt-12 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-3xl font-black mb-4 text-gray-900 leading-tight">Your Mood, <br/>Expertly Synced.</h2>
            <p className="text-gray-500 mb-10 leading-relaxed font-medium">
              We've upgraded our mood analysis. By answering a few quick details about your context, we can provide hyper-relevant Indian recommendations for your exact moment.
            </p>
            <button 
              onClick={() => setStep(Step.INPUT)}
              className="w-full gradient-bg text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Start Questionnaire
            </button>
            <p className="text-xs text-gray-400 mt-6 italic">
              Privacy is paramount. Data is processed in real-time.
            </p>
          </div>
        )}

        {step === Step.INPUT && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-10">
              {/* Question 1: Text */}
              <div className="space-y-4">
                <label className="text-lg font-black flex items-center gap-4 text-gray-900">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">1</span>
                  What's on your mind right now?
                </label>
                <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g., 'Just finished a workout, feeling energized but hungry' or 'Rough day at work, need a pick-me-up'..."
                  className="w-full h-32 p-5 border-2 border-gray-100 rounded-3xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all resize-none text-lg leading-relaxed bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Question: Gender Identity */}
                <div className="space-y-4">
                  <label className="text-lg font-black flex items-center gap-4 text-gray-900">
                    <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">2</span>
                    Identify As
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Male', 'Female', 'Non-Binary', 'Other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`py-3 rounded-2xl font-bold border-2 transition-all ${
                          gender === g 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question: Energy Level */}
                <div className="space-y-4">
                  <label className="text-lg font-black flex items-center gap-4 text-gray-900">
                    <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm">3</span>
                    Energy Level
                  </label>
                  <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setEnergyLevel(lvl)}
                        className={`w-10 h-10 rounded-full font-bold transition-all ${
                          energyLevel === lvl 
                          ? 'gradient-bg text-white scale-125 shadow-lg' 
                          : 'bg-white text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Question: Social Context */}
                <div className="space-y-4">
                  <label className="text-lg font-black flex items-center gap-4 text-gray-900">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm">4</span>
                    Who are you with?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Alone', 'Partner', 'Friends', 'Family'].map((ctx) => (
                      <button
                        key={ctx}
                        onClick={() => setSocialContext(ctx)}
                        className={`py-3 rounded-2xl font-bold border-2 transition-all ${
                          socialContext === ctx 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {ctx}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question: Currently... */}
                <div className="space-y-4">
                  <label className="text-lg font-black flex items-center gap-4 text-gray-900">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">5</span>
                    Currently...
                  </label>
                  <select 
                    value={activityContext}
                    onChange={(e) => setActivityContext(e.target.value)}
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50 outline-none focus:border-indigo-500 font-bold text-gray-700 cursor-pointer"
                  >
                    {['Working', 'Commuting', 'Relaxing', 'Exercising', 'Waking Up', 'Chores'].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Question: Goal */}
                <div className="space-y-4">
                  <label className="text-lg font-black flex items-center gap-4 text-gray-900">
                    <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-sm">6</span>
                    Your goal right now?
                  </label>
                  <select 
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50 outline-none focus:border-indigo-500 font-bold text-gray-700 cursor-pointer"
                  >
                    {['Relax', 'Focus', 'Celebrate', 'Vent', 'Distract Me', 'Pamper Me'].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Question: Location */}
                <div className="space-y-4">
                  <label className="text-lg font-black flex items-center gap-4 text-gray-900">
                    <span className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center text-sm">7</span>
                    Local Location
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bandra, Mumbai"
                      className="flex-1 p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50 outline-none focus:border-indigo-500 font-bold text-gray-700 shadow-inner"
                    />
                    <button 
                      onClick={handleLocationDetection}
                      className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      📍
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full gradient-bg text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-100 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                disabled={!location || !textInput.trim()}
              >
                Analyze My Vibe
              </button>
            </div>
          </div>
        )}

        {step === Step.PROCESSING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="relative w-40 h-40 mb-10">
              <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-6 gradient-bg rounded-[2rem] animate-pulse opacity-40 rotate-12"></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Syncing Mood...</h2>
            <p className="text-gray-500 font-medium animate-pulse text-lg">{loadingMsg}</p>
          </div>
        )}

        {step === Step.RESULTS && analysis && (
          <div className="space-y-12 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000 pb-20">
            {/* Results Header */}
            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 relative group">
              <div className="p-10 md:p-14 relative z-10">
                <div className="inline-flex items-center px-5 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest mb-8">
                  Vibe Detected: {analysis.mood}
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1]">
                  You seem <span className="text-transparent bg-clip-text gradient-bg">{analysis.mood.toLowerCase()}</span>.
                </h2>
                <p className="text-gray-600 leading-relaxed text-2xl font-medium max-w-3xl italic">
                  "{analysis.explanation}"
                </p>
                
                <div className="mt-12 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full md:w-80 bg-gray-100 h-5 rounded-full overflow-hidden shadow-inner border border-gray-200">
                    <div className="gradient-bg h-full transition-all duration-[2000ms] ease-out" style={{ width: `${analysis.confidence * 100}%` }}></div>
                  </div>
                  <span className="text-lg font-black text-indigo-600">{(analysis.confidence * 100).toFixed(0)}% Confidence Match</span>
                </div>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {[
                { type: 'food', icon: '🍜', label: 'Cravings Map', color: 'orange', data: analysis.recommendations.food, sub: 'Local Picks' },
                { type: 'shopping', icon: '🛍️', label: 'Retail Refresh', color: 'pink', data: analysis.recommendations.shopping, sub: 'Lifestyle' },
                { type: 'music', icon: '🎵', label: 'Soundscapes', color: 'green', data: analysis.recommendations.music, sub: 'Playlists' },
                { type: 'books', icon: '📚', label: 'Page Turners', color: 'blue', data: analysis.recommendations.books, sub: 'Mental Escape' },
              ].map((cat) => (
                <section key={cat.type} className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                      <span className={`p-3 bg-${cat.color}-100 rounded-2xl text-3xl shadow-sm`}>{cat.icon}</span>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 leading-none">{cat.label}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{cat.sub}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-5">
                    {cat.data.map((rec, i) => (
                      <RecommendationCard key={i} rec={rec} type={cat.type as any} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="text-center pt-20 border-t-2 border-gray-100 max-w-2xl mx-auto">
              <p className="text-base text-gray-400 font-medium leading-relaxed">
                MoodSync India analyzes your inputs to suggest relevant services and products available on major Indian platforms. No direct checkout links are provided as per policy.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
