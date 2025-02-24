import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { VideoClip } from "../types/VideoClip";
import { Heart } from "lucide-react";
import '../assets/heartAnimation.css';

interface LikedClipsContextType {
    likedClips: VideoClip[];
    toggleLike: (clip: VideoClip) => void;
    isLiked: (id: string) => boolean;
}

const LikedClipsContext = createContext<LikedClipsContextType | undefined>(undefined);

export function LikedClipsProvider({ children }: { children: ReactNode }) {
    const [likedClips, setLikedClips] = useState<VideoClip[]>(() => {
        const saved = localStorage.getItem("likedClips");
        return saved ? JSON.parse(saved) : [];
    });

    const [showHeart, setShowHeart] = useState(false);

    useEffect(() => {
        localStorage.setItem("likedClips", JSON.stringify(likedClips));
    }, [likedClips]);

    const toggleLike = (clip: VideoClip) => {
        setLikedClips((prev) => {
            const alreadyLiked = prev.some((c) => c.id === clip.id);
            if (alreadyLiked) {
                return prev.filter((c) => c.id !== clip.id);
            } else {
                setShowHeart(true);
                setTimeout(() => setShowHeart(false), 800);
                return [...prev, clip];
            }
        });
    };

    const isLiked = (id: string) => {
        return likedClips.some((clip) => clip.id === id);
    };

    return (
        <LikedClipsContext.Provider value={{ likedClips, toggleLike, isLiked }}>
            {children}
            {showHeart && (
                <div className="heart-animation">
                    <Heart size={200} strokeWidth={0} className="fill-white"/>
                </div>
            )}
        </LikedClipsContext.Provider>
    );
}

export function useLikedClips() {
    const context = useContext(LikedClipsContext);
    if (!context) {
        throw new Error("useLikedClips must be used within a LikedClipsProvider");
    }
    return context;
} 