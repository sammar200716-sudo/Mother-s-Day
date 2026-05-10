import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';
import flowerData from '../data/flowers.json';

const ALL_KEYWORDS = [...new Set(flowerData.flatMap(f => f.keywords))];

// Generate dynamic questions from the scraped dataset
// We will split the available keywords into three distinct sets for the 3 questions.
const shuffle = (array) => array.sort(() => 0.5 - Math.random());
const shuffledKeywords = shuffle([...ALL_KEYWORDS]);

const QUESTIONS = [
  {
    id: 1,
    title: "How would you describe your mother?",
    options: shuffledKeywords.slice(0, 10)
  },
  {
    id: 2,
    title: "What are her favorite vibes?",
    options: shuffledKeywords.slice(10, 20)
  },
  {
    id: 3,
    title: "What makes her special?",
    options: shuffledKeywords.slice(20, 30)
  }
];

const OptionPill = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`magnetic px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-md flex items-center space-x-2 ${
      isSelected 
      ? 'bg-pastel-teal text-white border-pastel-teal shadow-[0_4px_20px_rgba(0,77,64,0.4)] scale-[1.02]' 
      : 'bg-white/30 border-white/40 text-gray-700 hover:bg-white/50'
    }`}
  >
    {isSelected && <Sparkles className="w-4 h-4 text-white" />}
    <span>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
  </button>
);

const Questions = ({ onNext }) => {
  const containerRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.question-animate', 
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [currentStep]);

  const handleToggleKeyword = (keyword) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
      ? prev.filter(k => k !== keyword)
      : [...prev, keyword]
    );
  };

  const calculateResult = () => {
    // Scoring logic
    let bestMatch = flowerData[0];
    let highestScore = -1;

    flowerData.forEach(flower => {
      const matchCount = flower.keywords.filter(k => selectedKeywords.includes(k)).length;
      if (matchCount > highestScore) {
        highestScore = matchCount;
        bestMatch = flower;
      } else if (matchCount === highestScore) {
        // Random tiebreaker
        if (Math.random() > 0.5) {
          bestMatch = flower;
        }
      }
    });

    return bestMatch;
  };

  const handleNextStep = () => {
    if (selectedKeywords.length === 0) return; // Force at least one selection

    gsap.context(() => {
      gsap.to('.question-animate', {
        opacity: 0,
        x: -30,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: () => {
          if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(s => s + 1);
          } else {
            const result = calculateResult();
            onNext(selectedKeywords, result);
          }
        }
      });
    }, containerRef);
  };

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto flex flex-col justify-center">
      <div className="mb-8 flex justify-between items-center px-4 question-animate">
        <span className="text-pastel-teal font-medium tracking-wider text-sm uppercase">
          Step {currentStep + 1} of {QUESTIONS.length}
        </span>
        <div className="flex space-x-2">
          {QUESTIONS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-white/80' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      <div className="glass-panel p-8 md:p-14 relative overflow-hidden question-animate">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-pastel-skyblue/20 rounded-full blur-3xl -z-10"></div>
        
        <h2 className="text-3xl md:text-4xl text-gray-800 mb-10 leading-tight">
          {currentQuestion.title}
        </h2>

        <div className="flex flex-wrap gap-4 mb-12">
          {currentQuestion.options.map((option, idx) => (
            <OptionPill 
              key={idx} 
              label={option} 
              isSelected={selectedKeywords.includes(option)}
              onClick={() => handleToggleKeyword(option)}
            />
          ))}
        </div>

        <div className="flex justify-end pt-6 border-t border-white/20">
          <button 
            onClick={handleNextStep}
            disabled={selectedKeywords.length === 0}
            className={`neumorphic-btn group inline-flex items-center space-x-3 text-gray-800 ${
              selectedKeywords.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            <span>{currentStep === QUESTIONS.length - 1 ? 'Generate Bouquet' : 'Continue'}</span>
            {currentStep === QUESTIONS.length - 1 ? (
              <Sparkles className="w-5 h-5 text-pastel-teal" />
            ) : (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questions;
