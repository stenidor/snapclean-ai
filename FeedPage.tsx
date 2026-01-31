import React, { useState, useEffect, useCallback } from 'react';
import { subscribeToFeedImages, type FeedImage } from './services/feedService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const GRID_SIZE = 6;
const TICK_INTERVAL_MS = 10000;
const SUBSCRIPTION_LIMIT = 100;

export const FeedPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [allImages, setAllImages] = useState<FeedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advanceSlide = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 500);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToFeedImages(SUBSCRIPTION_LIMIT, (images) => {
      if (images.length === 0) {
        setError('Aucune image validée pour le moment');
        return;
      }
      setError(null);
      setAllImages(images);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const tick = setInterval(advanceSlide, TICK_INTERVAL_MS);
    return () => clearInterval(tick);
  }, [advanceSlide]);

  if (error) {
    return (
      <div className="w-screen h-screen bg-slate-900 flex flex-col items-center justify-center text-white overflow-hidden">
        <p className="text-lg mb-4">{error}</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Retour
        </button>
      </div>
    );
  }

  const n = allImages.length;
  const heroImage = n > 0 ? allImages[currentIndex % n] : null;
  const gridImages = n > 1
    ? Array.from({ length: Math.min(GRID_SIZE, n) }, (_, i) =>
        allImages[(currentIndex + 1 + i) % n]
      )
    : [];

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden flex" style={{ width: '100vw', height: '100vh' }}>
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white text-sm rounded-lg transition-colors"
        aria-label="Retour"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Retour
      </button>

      <div className="flex flex-1 min-w-0" style={{ width: '100%', height: '100%' }}>
        {/* Zone Principale - Hero (66%) */}
        <div
          className="flex-shrink-0 bg-slate-900 flex flex-col items-center justify-center overflow-hidden relative"
          style={{ width: '66%' }}
        >
          {heroImage && (
            <img
              key={heroImage.id}
              src={heroImage.imageUrl}
              alt={heroImage.prompt}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-6 px-8">
            <h2 className="text-white text-2xl font-bold">Le métier de votre rêve</h2>
          </div>
        </div>

        {/* Zone Feed - Grille (33%) - pas de cases vides, ratio préservé */}
        <div
          className="flex-shrink-0 flex flex-col gap-2 p-2 bg-slate-950 overflow-hidden"
          style={{ width: '33%', height: '100%' }}
        >
          {gridImages.map((img, i) => (
            <div
              key={`${img.id}-${i}`}
              className="flex-1 min-h-0 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center"
            >
              <img
                src={img.imageUrl}
                alt={img.prompt}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
