import { motion } from 'framer-motion';
import { Flame, Clock, BookOpen, Trophy, Upload, Play, MessageSquare, BarChart3, Wifi, WifiOff, Smartphone, Monitor, Zap, ChevronRight } from 'lucide-react';
import { mockUser, mockMaterials } from '@/lib/mock-data';
import { Link } from 'react-router-dom';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const statsCards = [
  { label: 'Study Hours', value: '48.5', icon: Clock, color: 'bg-primary/10 text-primary' },
  { label: 'Materials', value: '12', icon: BookOpen, color: 'bg-secondary/10 text-secondary' },
  { label: 'Quizzes Done', value: '8', icon: Trophy, color: 'bg-accent/10 text-accent' },
  { label: 'Level', value: `${mockUser.level}`, icon: Zap, color: 'bg-primary/10 text-primary' },
];

const quickActions = [
  { label: 'Upload Material', icon: Upload, to: '/materials', color: 'gradient-primary' },
  { label: 'Start Quiz', icon: Play, to: '/quizzes', color: 'gradient-secondary' },
  { label: 'Ask AI', icon: MessageSquare, to: '/chat', color: 'gradient-accent' },
  { label: 'View Progress', icon: BarChart3, to: '/progress', color: 'gradient-hero' },
];

const recentActivity = [
  { text: 'Completed "Data Structures Basics" quiz', time: '2 hours ago', type: 'quiz' },
  { text: 'Uploaded "Operating Systems Notes"', time: '5 hours ago', type: 'upload' },
  { text: 'Studied for 45 minutes', time: 'Yesterday', type: 'study' },
  { text: 'AI generated summary for Calculus II', time: 'Yesterday', type: 'ai' },
];

export default function Dashboard() {
  const isOnline = navigator.onLine;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          {getGreeting()}, {mockUser.name.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm">Ready to learn something new today?</p>
      </motion.div>

      {/* Study Streak */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="gradient-primary rounded-2xl p-5 text-primary-foreground flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Current Study Streak</p>
          <p className="text-3xl font-bold">{mockUser.studyStreak} days</p>
          <p className="text-xs opacity-75 mt-1">Keep going! You&apos;re on fire 🔥</p>
        </div>
        <div className="text-5xl">
          <Flame className="h-14 w-14 opacity-90" />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
            className="bg-card rounded-xl p-4 shadow-card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Context Indicator */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {typeof window !== 'undefined' && window.innerWidth < 768 ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          <span>{typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Desktop'}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className={`flex items-center gap-2 ${isOnline ? 'text-secondary' : 'text-destructive'}`}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Best time: Evening</span>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.05 }}>
              <Link to={action.to}
                className={`${action.color} rounded-xl p-4 text-center flex flex-col items-center gap-2 text-primary-foreground hover:opacity-90 transition-opacity`}>
                <action.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Activity</h2>
        <div className="bg-card rounded-xl shadow-card divide-y divide-border">
          {recentActivity.map((item, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <p className="text-sm text-foreground">{item.text}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Uploaded */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Materials</h2>
          <Link to="/materials" className="text-sm text-primary font-medium flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mockMaterials.slice(0, 4).map((mat) => (
            <div key={mat.id} className="bg-card rounded-xl p-4 shadow-card flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                {mat.fileType}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{mat.title}</p>
                <p className="text-xs text-muted-foreground">{mat.subject} · {mat.size}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${mat.status === 'ready' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'}`}>
                {mat.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
