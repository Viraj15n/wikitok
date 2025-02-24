export interface VideoClip {
  id: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  title: string;
  description: string;
}

export function validateVideoClip(clip: VideoClip): string[] {
  const errors: string[] = [];
  
  // Validate ID
  if (!clip.id || typeof clip.id !== 'string') {
    errors.push('Invalid ID format');
  }

  // Validate URL
  const youtubePattern = /^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}$/;
  if (!youtubePattern.test(clip.videoUrl)) {
    errors.push('Invalid YouTube URL format');
  }

  // Validate time range
  if (typeof clip.startTime !== 'number' || clip.startTime < 0) {
    errors.push('Invalid start time');
  }
  if (typeof clip.endTime !== 'number' || clip.endTime <= clip.startTime) {
    errors.push('Invalid end time');
  }
  if (clip.endTime - clip.startTime > 600) { // Max 10 minutes
    errors.push('Video clip too long');
  }

  // Validate title and description
  if (!clip.title || typeof clip.title !== 'string' || clip.title.length < 3) {
    errors.push('Invalid title');
  }
  if (!clip.description || typeof clip.description !== 'string') {
    errors.push('Invalid description');
  }

  return errors;
} 