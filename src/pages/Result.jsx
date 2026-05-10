import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import BouquetCanvas from '../components/BouquetCanvas';
import { ArrowRight, Heart, Sparkles, MessageCircleHeart, Send, Flower2 } from 'lucide-react';
import { addBouquetToDB, updateBouquetInDB } from '../lib/db';

const Result = ({ result, userName = '', onViewRankings, onRestart }) => {
  const containerRef = useRef(null);
  const [processing, setProcessing] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [bouquetDbId, setBouquetDbId] = useState(null);
  const hasSavedEntryRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProcessing(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!processing) return;
    const ctx = gsap.context(() => {
      gsap.to('.processing-text', {
        opacity: 0.5,
        yoyo: true,
        repeat: -1,
        duration: 0.8,
        ease: 'power1.inOut',
      });
    }, containerRef);
    return () => ctx.revert();
  }, [processing]);

  useEffect(() => {
    if (processing || !result?.name || hasSavedEntryRef.current) return;
    hasSavedEntryRef.current = true;
    const id = addBouquetToDB({
      userName: userName.trim() || 'Guest',
      flowerName: result.name,
      name: result.name,
      comment: '',
      timestamp: new Date().toISOString(),
    });
    setBouquetDbId(id);
  }, [processing, result, userName]);

  useEffect(() => {
    if (processing) return;

    const duration = 3 * 1000;
    const end = Date.now() + duration;

    let rafId;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FADADD', '#E6D6FF', '#D6F0FF'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FADADD', '#E6D6FF', '#D6F0FF'],
      });

      if (Date.now() < end) {
        rafId = requestAnimationFrame(frame);
      }
    };
    frame();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.result-anim',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power3.out',
          delay: 0.2,
        }
      );
    }, containerRef);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [processing]);

  const handleSendFeedback = () => {
    if (!bouquetDbId || !feedback.trim()) return;
    updateBouquetInDB(bouquetDbId, {
      comment: feedback.trim(),
    });
    setFeedback('');
  };

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen flex flex-col items-center justify-between relative pt-14 pb-12 px-4 sm:px-6 md:py-12 overflow-y-auto"
    >
      {!processing && (
        <button
          type="button"
          onClick={onRestart}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-100 uppercase tracking-[0.12em] text-xs sm:text-sm font-medium text-[#8E3B46]/90 hover:text-[#8E3B46] hover:bg-white/40 backdrop-blur-md border border-white/50 rounded-full px-4 py-2.5 shadow-[0_4px_24px_rgba(142,59,70,0.12)] transition-colors magnetic"
        >
          Start again
        </button>
      )}

      {processing ? (
        <div className="flex flex-1 flex-col items-center justify-center z-50 w-full min-h-[50vh]">
          <div className="w-32 h-32 rounded-full border-4 border-rose-300/30 border-t-rose-400 animate-spin mb-8" />
          <h2 className="text-2xl text-gray-700 tracking-wider font-medium processing-text">
            Gathering petals...
          </h2>
        </div>
      ) : (
        <>
          <div className="relative z-20 text-center w-full max-w-2xl result-anim mb-6 md:mb-8 mt-8 md:mt-0 px-4">
            <div className="mx-auto inline-flex flex-col items-center gap-3">
              {/* Original small ornaments; only the heart is nudged left toward the gap under "For You" */}
              <div className="mb-1 flex items-center justify-center gap-3 text-rose-300" aria-hidden>
                <Sparkles className="h-4 w-4 shrink-0 -translate-x-6 md:-translate-x-4" />
                <Heart className="relative h-5 w-5 shrink-0 stroke-[1.35] -translate-x-2 md:-translate-x-2.5" />
                <Sparkles className="h-4 w-4 shrink-0 -translate-x-6 md:-translate-x-1" />
              </div>
              <h1 className="m-0 text-center font-heading tracking-wide text-5xl text-[#8E3B46] drop-shadow-xs md:text-7xl">
                For You
              </h1>
            </div>

            <p className="text-gray-700 tracking-wide text-sm md:text-base font-medium">
              {result?.name ? `A ${result.name} bouquet, crafted for her.` : 'A flower for every feeling.'}
            </p>
            <div className="flex justify-center mt-3">
              <div className="h-px w-12 bg-rose-200" />
              <Heart className="w-3 h-3 text-rose-400 fill-current mx-2" aria-hidden />
              <div className="h-px w-12 bg-rose-200" />
            </div>
          </div>

          <div className="relative z-10 w-full max-w-xl flex items-center justify-center result-anim my-8 md:my-12 min-h-[340px] md:min-h-[400px]">
            <BouquetCanvas resultName={result?.name || 'Flower'} />
          </div>

          <div className="w-full max-w-6xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8 mt-auto z-20 result-anim">
            <div className="w-full md:max-w-[min(380px,calc(100vw-4rem))] bg-white/40 backdrop-blur-xl border border-white/60 p-5 sm:p-6 rounded-[2rem] shadow-[0_8px_32px_rgba(142,59,70,0.1)] transition-transform hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-full border border-rose-200 flex items-center justify-center mb-4 bg-white/50">
                <MessageCircleHeart className="w-5 h-5 text-[#8E3B46]" />
              </div>
              <h3 className="text-xl text-gray-800 font-heading mb-1 text-left">
                Leave feedback
              </h3>
              <p className="text-sm text-gray-600 mb-5 text-left">
                Your thoughts help this garden grow.
              </p>
              <div className="relative mb-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full h-28 sm:h-24 bg-white/50 border border-white/60 rounded-xl p-4 text-sm focus:outline-hidden focus:ring-1 focus:ring-rose-300 placeholder-gray-400 resize-none shadow-inner"
                  placeholder="Write your feedback…"
                  maxLength={500}
                />
                <Heart
                  aria-hidden
                  className="absolute bottom-3 right-3 w-4 h-4 text-rose-300 pointer-events-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSendFeedback}
                disabled={!feedback.trim() || !bouquetDbId}
                className="w-full min-h-[3rem] min-w-0 px-4 sm:px-6 py-3 rounded-full flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:flex-nowrap sm:justify-between bg-[#B56B74] hover:bg-[#8E3B46] disabled:opacity-45 disabled:pointer-events-none text-white transition-colors shadow-md magnetic text-base"
              >
                <span className="font-medium tracking-wide text-center whitespace-nowrap">
                  Send
                </span>
                <Send className="w-[1.125rem] h-[1.125rem] shrink-0" aria-hidden />
              </button>
            </div>

            <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto pb-14 md:pb-0 md:justify-end md:self-center">
              <button
                type="button"
                onClick={onViewRankings}
                className="w-full md:w-max flex items-center space-x-4 sm:space-x-6 bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:pr-8 rounded-full shadow-[0_8px_32px_rgba(142,59,70,0.1)] group hover:bg-white/60 transition-all cursor-pointer magnetic justify-center md:justify-start"
              >
                <div className="w-14 h-14 rounded-full border border-rose-200 flex items-center justify-center bg-white/50 shrink-0">
                  <Flower2 className="w-7 h-7 text-[#8E3B46]" />
                </div>
                <div className="flex flex-col items-start pr-2 min-w-0 text-left flex-1">
                  <h3 className="text-gray-800 font-heading text-lg">
                    View Others&apos; Flowers
                  </h3>
                  <p className="text-xs text-gray-600">
                    See the beauty shared by other hearts.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#8E3B46] shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Result;
