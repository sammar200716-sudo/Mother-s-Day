import { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import flowersData from '../data/flowers.json';

const BouquetCanvas = ({ resultName }) => {
  const containerRef = useRef(null);

  const flowerInfo = useMemo(() => {
    return flowersData.find(f => f.name === resultName) || flowersData[0];
  }, [resultName]);

  useEffect(() => {
    // Gentle floating animation
    const ctx = gsap.context(() => {
      gsap.to(containerRef.current, {
        y: -15,
        rotation: 1,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none mt-12 md:mt-0">
      <div ref={containerRef} className="relative flex flex-col items-center justify-center scale-90 md:scale-100">
        
        {/* Flower Image - Bursting from the top of the wrapper */}
        <div className="w-64 h-64 md:w-80 md:h-80 relative z-10 -mb-20 drop-shadow-2xl flex justify-center">
          <div 
            className="w-full h-full bg-center bg-cover border-4 border-white shadow-xl shadow-rose-200/50"
            style={{ 
              backgroundImage: `url(${flowerInfo.imageUrl || '/bouquet.png'})`,
              borderRadius: '50% 50% 40% 40%', // Soft organic shape
              maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
            }}
          ></div>
        </div>

        {/* Bouquet Wrapper (CSS Cone) */}
        <div className="relative z-20 flex flex-col items-center">
          {/* Glassmorphic Paper wrap */}
          <div 
            className="w-48 h-64 md:w-56 md:h-72 bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_20px_40px_rgba(142,59,70,0.1)]"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 70% 100%, 30% 100%)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,240,245,0.2) 100%)'
            }}
          >
            {/* Soft inner shading */}
            <div className="w-full h-full opacity-30 bg-linear-to-t from-rose-200 to-transparent"></div>
          </div>
          
          {/* Ribbon */}
          <div className="absolute top-1/3 w-32 h-6 md:w-40 md:h-8 bg-[#F8AFA6] rounded-full shadow-md -translate-y-1/2 flex items-center justify-center border border-white/50 backdrop-blur-xs z-30">
            {/* Bow center */}
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FFC0CB] rounded-full shadow-inner border border-white/50 absolute"></div>
            {/* Bow loops */}
            <div className="w-12 h-10 md:w-16 md:h-12 border-[6px] border-[#F8AFA6] rounded-full absolute -left-8 md:-left-12 origin-right rotate-12"></div>
            <div className="w-12 h-10 md:w-16 md:h-12 border-[6px] border-[#F8AFA6] rounded-full absolute -right-8 md:-right-12 origin-left -rotate-12"></div>
            {/* Ribbon tails */}
            <div className="absolute top-full left-1/2 -translate-x-4 w-6 h-20 bg-[#F8AFA6] origin-top rotate-12 -z-10 rounded-b-md"></div>
            <div className="absolute top-full right-1/2 translate-x-4 w-6 h-24 bg-[#F8AFA6] origin-top -rotate-12 -z-10 rounded-b-md"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BouquetCanvas;

