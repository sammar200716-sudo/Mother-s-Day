import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { UserRound, ArrowRight } from 'lucide-react';

const USERNAME_STORAGE = 'bouquetUserName';

const Username = ({ onContinue, initialValue = '' }) => {
  const containerRef = useRef(null);
  const [value, setValue] = useState(initialValue ?? '');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.username-fade',
        { opacity: 0, y: 26, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.15,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.06,
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = value.trim().replace(/\s+/g, ' ');
    if (name.length < 1 || name.length > 40) return;
    try {
      sessionStorage.setItem(USERNAME_STORAGE, name);
    } catch {
      /* ignore */
    }

    gsap.context(() => {
      gsap.to('.username-fade', {
        opacity: 0,
        y: -20,
        duration: 0.65,
        stagger: 0.06,
        ease: 'power2.inOut',
        onComplete: () => onContinue(name),
      });
    }, containerRef);
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-2"
    >
      <div className="glass-panel p-10 md:p-16 username-fade relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pastel-lavender/25 rounded-full blur-3xl -z-10" />

        <div className="w-14 h-14 mx-auto rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md flex items-center justify-center mb-6 username-fade">
          <UserRound className="w-7 h-7 text-[#8E3B46]" strokeWidth={1.75} />
        </div>

        <p className="text-pastel-teal uppercase tracking-[0.2em] text-xs font-medium mb-3 username-fade">
          Welcome
        </p>
        <h1 className="text-4xl md:text-6xl text-gray-800 mb-4 leading-tight username-fade font-heading">
          How should we greet you?
        </h1>
        <p className="text-gray-600 max-w-md mx-auto mb-8 md:mb-10 text-base md:text-lg username-fade font-body">
          Your name travels with your bouquet across the Global Bouquets garden.
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto space-y-6 username-fade"
        >
          <label htmlFor="display-name" className="sr-only">
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            autoComplete="nickname"
            maxLength={40}
            placeholder="Your name…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-6 py-4 rounded-full bg-white/50 border border-white/60 text-gray-800 placeholder:text-gray-400 shadow-inner outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300/80 text-center text-lg"
          />

          <button
            type="submit"
            disabled={!value.trim()}
            className="neumorphic-btn group cinematic-fade w-full md:w-auto min-w-[200px] mx-auto inline-flex items-center justify-center gap-3 text-gray-800 disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300 text-pastel-pink" />
          </button>

          <p className="text-xs text-gray-500">
            Letters and spaces · up to 40 characters
          </p>
        </form>
      </div>
    </div>
  );
};

export default Username;

export { USERNAME_STORAGE };
