import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { VideoClip } from '../types/VideoClip';
import { Share2, Heart } from 'lucide-react';
import { useLikedClips } from '../contexts/LikedClipsContext';
import '../styles/App.css';

// Import YouTube IFrame API types
type YouTubePlayer = YT.Player;

// Declare global script loading state
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | null;
    __ytScriptLoading?: Promise<void>;
  }
}

interface VideoCardProps {
  clip: VideoClip;
  onPlayerReady?: (player: YouTubePlayer) => void;
  onPlayerMount?: (element: HTMLDivElement, player: VideoPlayerRef) => void;
}

export interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  getPlayerState: () => number;
  current?: HTMLDivElement | null;
}

function extractYouTubeId(url: string): string {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    // Try to extract ID from the end of the URL
    const fallbackId = url.split('/').pop()?.split('?')[0];
    if (fallbackId && fallbackId.length === 11) {
      return fallbackId;
    }
    throw new Error('Invalid YouTube URL format');
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
    return '';
  }
}

export const VideoCard = forwardRef<VideoPlayerRef, VideoCardProps>(({ clip, onPlayerReady, onPlayerMount }, ref) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YouTubePlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { toggleLike, isLiked } = useLikedClips();

  useImperativeHandle(ref, () => {
    const playerInterface: VideoPlayerRef = {
      play: () => {
        try {
          if (playerInstanceRef.current?.getPlayerState() !== 1) { // 1 is playing
            playerInstanceRef.current?.playVideo();
          }
        } catch (error) {
          console.error('Error playing video:', error);
          setError('Failed to play video');
        }
      },
      pause: () => {
        try {
          if (playerInstanceRef.current?.getPlayerState() === 1) { // 1 is playing
            playerInstanceRef.current?.pauseVideo();
          }
        } catch (error) {
          console.error('Error pausing video:', error);
          setError('Failed to pause video');
        }
      },
      getPlayerState: () => {
        try {
          return playerInstanceRef.current?.getPlayerState() ?? -1;
        } catch (error) {
          console.error('Error getting player state:', error);
          return -1;
        }
      },
      current: playerContainerRef.current
    };

    // Call onPlayerMount with the container element and player interface
    if (onPlayerMount && playerContainerRef.current) {
      onPlayerMount(playerContainerRef.current, playerInterface);
    }

    return playerInterface;
  }, [onPlayerMount]);

  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted || !playerRef.current) return;

      // Cleanup existing player
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying previous player:', error);
        }
        playerInstanceRef.current = null;
      }

      const videoId = extractYouTubeId(clip.videoUrl);
      if (!videoId) {
        setError('Invalid video URL');
        setIsLoading(false);
        return;
      }

      try {
        playerInstanceRef.current = new window.YT.Player(playerRef.current, {
          videoId,
          playerVars: {
            autoplay: 1, // Enable autoplay by default
            start: clip.startTime,
            end: clip.endTime,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            mute: 1 // Required for autoplay
          },
          events: {
            onReady: (event: YT.PlayerEvent) => {
              if (isMounted) {
                setIsLoading(false);
                setError(null);
                onPlayerReady?.(event.target);
              }
            },
            onError: (event: YT.OnErrorEvent) => {
              console.error('YouTube Player Error:', event.data);
              setError('Failed to load video');
              setIsLoading(false);
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === YT.PlayerState.ENDED) {
                // Handle video end if needed
              }
            }
          }
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        setError('Failed to initialize player');
        setIsLoading(false);
      }
    };

    // Load YouTube IFrame API
    if (!window.YT?.Player) {
      if (!window.__ytScriptLoading) {
        // Define the callback before loading the script
        window.__ytScriptLoading = new Promise<void>((resolve) => {
          // Ensure onYouTubeIframeAPIReady is defined before loading script
          window.onYouTubeIframeAPIReady = () => {
            // Only resolve when YT.Player is actually available
            if (window.YT?.Player) {
              resolve();
            } else {
              const checkYTPlayer = setInterval(() => {
                if (window.YT?.Player) {
                  clearInterval(checkYTPlayer);
                  resolve();
                }
              }, 100);
              // Timeout after 10 seconds
              setTimeout(() => {
                clearInterval(checkYTPlayer);
                console.error('Timeout waiting for YT.Player');
                resolve();
              }, 10000);
            }
          };

          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          tag.onerror = (error) => {
            console.error('Error loading YouTube IFrame API:', error);
            if (isMounted) {
              setError('Failed to load YouTube player');
              setIsLoading(false);
            }
            resolve();
          };
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        });
      }

      // Wait for the API to be fully loaded
      window.__ytScriptLoading.then(() => {
        if (isMounted && window.YT?.Player) {
          initPlayer();
        }
      });
    } else {
      // YT.Player is already available
      initPlayer();
    }

    return () => {
      isMounted = false;
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error cleaning up player:', error);
        }
        playerInstanceRef.current = null;
      }
    };
  }, [clip, onPlayerReady]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/watch?v=${extractYouTubeId(clip.videoUrl)}&start=${clip.startTime}&end=${clip.endTime}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: clip.title,
          text: clip.description,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div ref={playerContainerRef} className="video-card" onDoubleClick={() => toggleLike(clip)}>
      <div ref={playerRef} className="w-full h-full" />
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
      {error && (
        <div className="error-overlay">
          <div className="error-message">{error}</div>
        </div>
      )}
      <div className="video-overlay">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="video-title">{clip.title}</h2>
            <p className="video-description">{clip.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleLike(clip)}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isLiked(clip.id) 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              aria-label="Like video"
            >
              <Heart
                className={`w-5 h-5 ${isLiked(clip.id) ? 'fill-white' : ''}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Share video"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}); 