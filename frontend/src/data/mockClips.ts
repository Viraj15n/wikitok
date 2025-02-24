import { VideoClip, validateVideoClip } from '../types/VideoClip';

// Validate clips at runtime in development
function validateClips(clips: VideoClip[]): void {
  if (process.env.NODE_ENV === 'development') {
    clips.forEach((clip, index) => {
      const errors = validateVideoClip(clip);
      if (errors.length > 0) {
        console.warn(`Validation errors in clip ${index + 1}:`, errors);
      }
    });
  }
}

export const MOCK_CLIPS: VideoClip[] = [
  {
    id: '1',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    startTime: 0,
    endTime: 30,
    title: 'Introduction to Machine Learning',
    description: 'A brief overview of machine learning concepts and applications.'
  },
  {
    id: '2',
    videoUrl: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
    startTime: 120,
    endTime: 180,
    title: 'Python Data Structures',
    description: 'Understanding basic data structures in Python programming.'
  },
  {
    id: '3',
    videoUrl: 'https://www.youtube.com/watch?v=8jLOx1hD3_o',
    startTime: 240,
    endTime: 300,
    title: 'Web Development Basics',
    description: 'Learn the fundamentals of web development and HTML.'
  },
  {
    id: '4',
    videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    startTime: 360,
    endTime: 420,
    title: 'Python for Beginners',
    description: 'Complete Python tutorial for absolute beginners - learn Python in 6 hours!'
  },
  {
    id: '5',
    videoUrl: 'https://www.youtube.com/watch?v=Mus_vwhTCq0',
    startTime: 0,
    endTime: 60,
    title: 'JavaScript Pro Tips',
    description: 'JavaScript Pro Tips - Code This, NOT That'
  },
  {
    id: '6',
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    startTime: 180,
    endTime: 240,
    title: 'Python Full Course',
    description: 'Learn Python - Full Course for Beginners [Tutorial]'
  },
  {
    id: '7',
    videoUrl: 'https://www.youtube.com/watch?v=ok-plXXHlWw',
    startTime: 0,
    endTime: 60,
    title: 'React Hooks Explained',
    description: 'React Hooks explained in 15 minutes'
  },
  {
    id: '8',
    videoUrl: 'https://www.youtube.com/watch?v=yXY3f9jw7fg',
    startTime: 120,
    endTime: 180,
    title: 'Neural Networks',
    description: 'But what is a neural network? | Chapter 1, Deep learning'
  },
  {
    id: '9',
    videoUrl: 'https://www.youtube.com/watch?v=rJesac0_Ftw',
    startTime: 0,
    endTime: 60,
    title: 'GraphQL Tutorial',
    description: 'GraphQL Explained in 100 Seconds'
  },
  {
    id: '10',
    videoUrl: 'https://www.youtube.com/watch?v=DHvZLI7Db8E',
    startTime: 240,
    endTime: 300,
    title: 'TypeScript Crash Course',
    description: 'TypeScript Tutorial for Beginners'
  },
  {
    id: '11',
    videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    startTime: 420,
    endTime: 480,
    title: 'React Course',
    description: 'React Course - Beginner\'s Tutorial for React JavaScript Library [2022]'
  },
  {
    id: '12',
    videoUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    startTime: 300,
    endTime: 360,
    title: 'JavaScript Full Course',
    description: 'Learn JavaScript - Full Course for Beginners'
  }
];

// Validate clips in development
validateClips(MOCK_CLIPS); 