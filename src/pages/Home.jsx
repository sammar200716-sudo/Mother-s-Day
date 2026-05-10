import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flower } from 'lucide-react';

const Home = ({ onNext, displayName = '', onChangeName }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading for 3-4 seconds
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return p + 2;
      });
    }, 60);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.cinematic-fade', 
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1.5, stagger: 0.2, ease: 'power3.out' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleStart = () => {
    const ctx = gsap.context(() => {
      gsap.to('.cinematic-fade', {
        opacity: 0,
        y: -30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.inOut',
        onComplete: onNext
      });
    }, containerRef);
    return () => ctx.revert();
  };

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
      {loading ? (
        <div className="flex flex-col items-center space-y-6">
          <Flower className="w-12 h-12 text-white animate-spin-slow opacity-80" />
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
            <div 
              className="h-full bg-white/80 transition-all duration-75 ease-linear rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white/70 font-body text-sm tracking-widest uppercase">Gathering petals...</p>
        </div>
      ) : (
        <div className="glass-panel p-12 md:p-20 cinematic-fade relative overflow-hidden">
          {/* Subtle gradient orb behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pastel-pink/30 rounded-full blur-3xl -z-10"></div>
          
          <h2 className="text-pastel-teal uppercase tracking-[0.2em] text-sm font-medium mb-6 cinematic-fade">
            Mother's Day Interactive
          </h2>
          
          <h1 className="text-5xl md:text-7xl text-gray-800 mb-8 leading-tight cinematic-fade">
            What type of flower <br/> is your Mother?
          </h1>
          
          <p className="text-gray-600 max-w-lg mx-auto mb-12 text-lg cinematic-fade">
            Discover the perfect bloom that matches her unique personality, generated beautifully in 3D.
          </p>
          
          <button 
            onClick={handleStart}
            className="neumorphic-btn group cinematic-fade inline-flex items-center space-x-3 text-gray-800"
          >
            <span>Start the Journey</span>
            <Flower className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700 text-pastel-pink" />
          </button>

          {typeof onChangeName === 'function' && (
            <div className="mt-8 cinematic-fade space-y-2">
              {displayName.trim() ? (
                <p className="text-sm text-gray-500">
                  Signed in as{' '}
                  <span className="font-medium text-gray-700">{displayName.trim()}</span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={onChangeName}
                className="text-sm text-[#8E3B46]/80 hover:text-[#8E3B46] underline-offset-4 hover:underline transition-colors"
              >
                Use a different name?
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
