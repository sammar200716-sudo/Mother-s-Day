import { useEffect, useRef, useState, useMemo, startTransition } from 'react';
import gsap from 'gsap';
import { ArrowLeft, Clock, Award, Quote } from 'lucide-react';
import { getbouquetsFromDB } from '../lib/db';
import flowersData from '../data/flowers.json';

const Ranking = ({ onBack }) => {
  const containerRef = useRef(null);
  const [rankings, setRankings] = useState([]);

  const flowerByName = useMemo(() => {
    const map = new Map();
    for (const row of flowersData) {
      map.set(row.name, row.imageUrl || '/bouquet.png');
    }
    return map;
  }, []);

  useEffect(() => {
    let active = true;

    const loadRankings = async () => {
      const data = await getbouquetsFromDB();
      if (active) {
        startTransition(() => setRankings(data));
      }
    };

    loadRankings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ranking-header',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
      if (rankings.length > 0) {
        gsap.fromTo(
          '.ranking-item',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, [rankings]);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const normalizeEntry = (item, legacyIdx) => {
    const flowerName = item.flowerName || item.name || 'Flower';
    const thumb =
      flowerByName.get(flowerName) ||
      flowersData[0]?.imageUrl ||
      '/bouquet.png';
    return {
      flowerName,
      thumb,
      userName: item.userName || item.displayName || 'Anonymous',
      comment: item.comment ?? '',
      timestamp: item.timestamp,
      id: item.id ?? item.timestamp ?? `legacy-${legacyIdx}`,
    };
  };

  return (
    <div ref={containerRef} className="w-full max-w-xl md:max-w-2xl mx-auto flex flex-col min-h-[80vh]">
      <div className="flex items-center justify-between mb-8 ranking-header gap-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-3 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md transition-colors border border-white/20 magnetic shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-2xl sm:text-3xl text-gray-800 font-heading text-center flex-1 min-w-0">
          Global Bouquets
        </h2>
        <div className="w-11 shrink-0" aria-hidden />
      </div>

      <div className="glass-panel flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar min-h-[45vh]">
        {rankings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 italic text-center px-6">
            No bouquets generated yet. Be the first!
          </div>
        ) : (
          rankings.map((raw, idx) => {
            const item = normalizeEntry(raw, idx);
            return (
              <div
                key={item.id || idx}
                className="ranking-item bg-white/40 hover:bg-white/55 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/30 transition-all shadow-xs magnetic flex flex-col sm:flex-row gap-4 sm:gap-5"
              >
                <div className="flex gap-4 flex-1 min-w-0">
                  <div
                    className="shrink-0 w-[4.75rem] h-[4.75rem] sm:w-[5.25rem] sm:h-[5.25rem] rounded-2xl border-2 border-white/70 shadow-inner bg-white/30 overflow-hidden self-start"
                    aria-hidden
                  >
                    <img
                      src={item.thumb}
                      alt=""
                      className="w-full h-full object-cover bg-pastel-pink/40"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
                      <span className="text-base font-heading font-semibold text-gray-900">
                        {item.userName}
                      </span>
                      <span className="text-[0.6875rem] uppercase tracking-[0.15em] text-pastel-teal font-medium">
                        bouquet
                      </span>
                      <span className="rounded-full px-3 py-0.5 text-xs bg-white/50 border border-rose-200/60 text-[#8E3B46] font-medium truncate max-w-full inline-block align-middle">
                        {item.flowerName}
                      </span>
                    </div>

                    {item.comment ? (
                      <p className="text-sm text-gray-700 leading-relaxed mb-3 flex gap-2 items-start">
                        <Quote className="w-4 h-4 text-rose-300 shrink-0 mt-0.5 opacity-75" aria-hidden />
                        <span className="line-clamp-4">{item.comment}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 italic mb-3 flex items-start gap-2">
                        <span className="inline-block shrink-0">—</span>
                        No comment shared yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t border-white/25 sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3 shrink-0 opacity-75" aria-hidden />
                    <span>{item.timestamp ? formatDate(item.timestamp) : 'Just now'}</span>
                  </div>
                  {idx === 0 ? (
                    <Award className="w-7 h-7 text-amber-500 drop-shadow-md" aria-hidden />
                  ) : (
                    <span className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide sm:text-right whitespace-nowrap">
                      #{idx + 1}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Ranking;
