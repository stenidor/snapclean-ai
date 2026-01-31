import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchFeedImages, type FeedImage } from './services/feedService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const GRID_SIZE = 5;
const TICK_INTERVAL_MS = 10000;

export const FeedPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [heroImage, setHeroImage] = useState<FeedImage | null>(null);
  const [gridImages, setGridImages] = useState<FeedImage[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageQueueRef = useRef<FeedImage[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMoreImages = useCallback(async () => {
    try {
      const images = await fetchFeedImages(30);
      if (images.length > 0) {
        imageQueueRef.current = [...imageQueueRef.current, ...images];
      }
    } catch (err) {
      console.error('Feed load error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    }
  }, []);

  const popNextImage = useCallback((): FeedImage | null => {
    if (imageQueueRef.current.length === 0) return null;
    const next = imageQueueRef.current.shift()!;
    if (imageQueueRef.current.length < 10) {
      loadMoreImages();
    }
    return next;
  }, [loadMoreImages]);

  const advanceSlide = useCallback(() => {
    setGridImages((prev) => {
      if (prev.length === 0) return prev;
      const nextHero = prev[0];
      const rest = prev.slice(1);
      const newFromQueue = popNextImage();
      const newGrid = newFromQueue ? [...rest, newFromQueue] : rest;

      setTimeout(() => {
        setIsTransitioning(true);
        setHeroImage(nextHero);
        setTimeout(() => setIsTransitioning(false), 500);
      }, 0);

      return newGrid;
    });
  }, [popNextImage]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const images = await fetchFeedImages(30);
        if (!mounted) return;
        if (images.length === 0) {
          setError('Aucune image validée pour le moment');
          return;
        }
        const hero = images[0];
        const grid = images.slice(1, 1 + GRID_SIZE);
        imageQueueRef.current = images.slice(1 + GRID_SIZE);
        setHeroImage(hero);
        setGridImages(grid);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement');
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    tickRef.current = setInterval(advanceSlide, TICK_INTERVAL_MS);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
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
          className="flex-shrink-0 bg-slate-900 flex items-center justify-center overflow-hidden"
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
        </div>

        {/* Zone Feed - Grille (33%) */}
        <div
          className="flex-shrink-0 flex flex-col gap-2 p-2 bg-slate-950 overflow-hidden"
          style={{ width: '33%', height: '100%' }}
        >
          {Array.from({ length: GRID_SIZE }).map((_, i) => {
            const img = gridImages[i];
            if (!img) return <div key={`empty-${i}`} className="flex-1 min-h-0 rounded-lg bg-slate-800/50" />;
            return (
            <div
              key={`${img.id}-${i}`}
              className="flex-1 min-h-0 rounded-lg overflow-hidden bg-slate-800"
            >
              <img
                src={img.imageUrl}
                alt={img.prompt}
                className="w-full h-full object-cover"
              />
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
};
