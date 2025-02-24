import { useEffect, useRef, useCallback } from 'react';
import { VideoCard, VideoPlayerRef } from './components/VideoCard';
import { MOCK_CLIPS } from './data/mockClips';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<Map<Element, VideoPlayerRef>>(new Map());
  const currentPlayingRef = useRef<VideoPlayerRef | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pendingElementsRef = useRef<Set<Element>>(new Set());

  const handlePlayerReady = useCallback((element: Element, player: VideoPlayerRef) => {
    playersRef.current.set(element, player);
    
    // If observer exists, observe immediately
    if (observerRef.current) {
      observerRef.current.observe(element);
    } else {
      // Store element to be observed when observer is created
      pendingElementsRef.current.add(element);
    }
  }, []);

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    playersRef.current.clear();
    currentPlayingRef.current = null;
    pendingElementsRef.current.clear();
  }, []);

  // Setup intersection observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cleanup any existing observer
    cleanupObserver();

    // Create new observer with container as root
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const player = playersRef.current.get(entry.target);
          if (!player) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Stop any currently playing video
            if (currentPlayingRef.current && currentPlayingRef.current !== player) {
              currentPlayingRef.current.pause();
            }
            
            try {
              // Start playing the new video
              player.play();
              currentPlayingRef.current = player;
            } catch (error) {
              console.warn('Failed to play video:', error);
            }
          } else if (!entry.isIntersecting && currentPlayingRef.current === player) {
            // Pause the video when it's no longer visible enough
            player.pause();
            currentPlayingRef.current = null;
          }
        });
      },
      {
        root: container,
        threshold: [0.3], // Lower threshold for easier triggering
        rootMargin: "-5% 0px -5% 0px" // Smaller margins for more responsive autoplay
      }
    );

    // Observe all existing players and pending elements
    playersRef.current.forEach((_, element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });
    
    // Observe any elements that were mounted before observer was created
    pendingElementsRef.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });
    pendingElementsRef.current.clear(); // Clear pending elements after observing them

    return cleanupObserver;
  }, [cleanupObserver]); // Re-run when cleanup function changes

  return (
    <div 
      ref={containerRef}
      className="video-container"
    >
      {MOCK_CLIPS.map((clip) => (
        <VideoCard 
          key={clip.id} 
          clip={clip}
          onPlayerMount={(element, playerRef) => {
            if (element && playerRef) {
              handlePlayerReady(element, playerRef);
            }
          }}
        />
      ))}
    </div>
  );
}

export default App;
