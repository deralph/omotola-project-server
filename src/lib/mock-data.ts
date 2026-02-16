// Mock data and types for the Study Companion app

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  university: string;
  avatar?: string;
  studyStreak: number;
  level: number;
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'image';
  uploadDate: string;
  status: 'processing' | 'ready' | 'error';
  size: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  references?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
  duration: number;
  bestScore?: number;
  status: 'available' | 'completed' | 'in-progress';
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Recommendation {
  id: string;
  topic: string;
  subject: string;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  recurrence: 'daily' | 'weekly' | 'custom' | 'once';
  enabled: boolean;
  condition?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Video' | 'Article' | 'PDF';
  subject: string;
  rating: number;
  duration: string;
  url: string;
  bookmarked: boolean;
}

export const mockUser: User = {
  id: '1',
  name: 'Adebayo Ogunlade',
  email: 'adebayo@unilag.edu.ng',
  department: 'Computer Science',
  year: '300 Level',
  university: 'University of Lagos',
  studyStreak: 12,
  level: 7,
};

export const mockMaterials: Material[] = [
  { id: '1', title: 'Data Structures & Algorithms', subject: 'Computer Science', fileType: 'pdf', uploadDate: '2025-02-14', status: 'ready', size: '2.4 MB' },
  { id: '2', title: 'Operating Systems Notes', subject: 'Computer Science', fileType: 'pdf', uploadDate: '2025-02-13', status: 'ready', size: '5.1 MB' },
  { id: '3', title: 'Calculus II Summary', subject: 'Mathematics', fileType: 'docx', uploadDate: '2025-02-12', status: 'processing', size: '1.8 MB' },
  { id: '4', title: 'Digital Electronics', subject: 'Engineering', fileType: 'pdf', uploadDate: '2025-02-10', status: 'ready', size: '3.2 MB' },
  { id: '5', title: 'Technical Writing Guide', subject: 'General Studies', fileType: 'txt', uploadDate: '2025-02-09', status: 'ready', size: '0.5 MB' },
  { id: '6', title: 'Database Management Systems', subject: 'Computer Science', fileType: 'pdf', uploadDate: '2025-02-08', status: 'ready', size: '4.7 MB' },
];

export const mockQuizzes: Quiz[] = [
  { id: '1', title: 'Data Structures Basics', subject: 'Computer Science', questionCount: 15, duration: 20, bestScore: 85, status: 'completed' },
  { id: '2', title: 'OS Process Management', subject: 'Computer Science', questionCount: 10, duration: 15, status: 'available' },
  { id: '3', title: 'Calculus Integration', subject: 'Mathematics', questionCount: 12, duration: 25, bestScore: 70, status: 'completed' },
  { id: '4', title: 'Digital Logic Gates', subject: 'Engineering', questionCount: 20, duration: 30, status: 'available' },
];

export const mockQuizQuestions: QuizQuestion[] = [
  { id: '1', question: 'What is the time complexity of binary search?', type: 'multiple-choice', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 'O(log n)', explanation: 'Binary search halves the search space each iteration.' },
  { id: '2', question: 'A stack follows LIFO principle.', type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Stack is Last-In-First-Out.' },
  { id: '3', question: 'What data structure uses FIFO?', type: 'multiple-choice', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctAnswer: 'Queue', explanation: 'Queue follows First-In-First-Out.' },
  { id: '4', question: 'What is the worst-case time complexity of quicksort?', type: 'multiple-choice', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], correctAnswer: 'O(n²)', explanation: 'When pivot is always the smallest or largest element.' },
  { id: '5', question: 'Define a linked list in one sentence.', type: 'short-answer', correctAnswer: 'A linear data structure where elements are stored in nodes connected by pointers.', explanation: 'Each node contains data and a reference to the next node.' },
];

export const mockRecommendations: Recommendation[] = [
  { id: '1', topic: 'Binary Trees Traversal', subject: 'Computer Science', estimatedTime: '30 min', difficulty: 'Medium', reason: 'You scored low on tree questions', priority: 'high' },
  { id: '2', topic: 'Integration by Parts', subject: 'Mathematics', estimatedTime: '45 min', difficulty: 'Hard', reason: 'Upcoming exam in 5 days', priority: 'high' },
  { id: '3', topic: 'SQL Joins Review', subject: 'Computer Science', estimatedTime: '20 min', difficulty: 'Easy', reason: 'Complete your DBMS module', priority: 'medium' },
  { id: '4', topic: 'Flip-Flops & Registers', subject: 'Engineering', estimatedTime: '35 min', difficulty: 'Medium', reason: 'Strengthen weak area', priority: 'low' },
];

export const mockReminders: Reminder[] = [
  { id: '1', title: 'Morning Study Session', time: '07:00 AM', recurrence: 'daily', enabled: true },
  { id: '2', title: 'DSA Practice', time: '04:00 PM', recurrence: 'weekly', enabled: true, condition: 'Only on WiFi' },
  { id: '3', title: 'Review Calculus Notes', time: '09:00 PM', recurrence: 'once', enabled: false },
];

export const mockResources: Resource[] = [
  { id: '1', title: 'Introduction to Algorithms - MIT OCW', type: 'Video', subject: 'Computer Science', rating: 4.8, duration: '1h 20m', url: '#', bookmarked: true },
  { id: '2', title: 'Understanding Big-O Notation', type: 'Article', subject: 'Computer Science', rating: 4.5, duration: '15 min read', url: '#', bookmarked: false },
  { id: '3', title: 'Calculus Made Easy', type: 'PDF', subject: 'Mathematics', rating: 4.6, duration: '200 pages', url: '#', bookmarked: true },
  { id: '4', title: 'Database Design Tutorial', type: 'Video', subject: 'Computer Science', rating: 4.3, duration: '45 min', url: '#', bookmarked: false },
  { id: '5', title: 'Digital Electronics Fundamentals', type: 'Article', subject: 'Engineering', rating: 4.1, duration: '25 min read', url: '#', bookmarked: false },
];

export const mockChatMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Explain the concept of recursion in simple terms', timestamp: '10:30 AM' },
  { id: '2', role: 'ai', content: 'Recursion is when a function calls itself to solve a problem by breaking it into smaller, similar sub-problems. Think of it like Russian nesting dolls — each doll contains a smaller version of itself until you reach the smallest one.\n\n**Example:** To calculate factorial of 5:\n- factorial(5) = 5 × factorial(4)\n- factorial(4) = 4 × factorial(3)\n- ...and so on until factorial(1) = 1\n\nEvery recursive function needs a **base case** (the stopping condition) to prevent infinite loops.', timestamp: '10:30 AM', references: ['Data Structures & Algorithms'] },
  { id: '3', role: 'user', content: 'Can you give me a code example?', timestamp: '10:32 AM' },
  { id: '4', role: 'ai', content: '```python\ndef factorial(n):\n    # Base case\n    if n <= 1:\n        return 1\n    # Recursive case\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # Output: 120\n```\n\nThe key parts are:\n1. **Base case:** `if n <= 1: return 1` — stops the recursion\n2. **Recursive call:** `factorial(n - 1)` — breaks the problem down', timestamp: '10:32 AM', references: ['Data Structures & Algorithms'] },
];
