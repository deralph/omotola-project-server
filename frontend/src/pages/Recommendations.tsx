import { motion } from 'framer-motion';
import { Lightbulb, Clock, Zap, Play, Calendar } from 'lucide-react';
import { mockRecommendations } from '@/lib/mock-data';

const difficultyColors = { Easy: 'bg-secondary/10 text-secondary', Medium: 'bg-accent/10 text-accent', Hard: 'bg-destructive/10 text-destructive' };
const priorityColors = { high: 'border-destructive/40', medium: 'border-accent/40', low: 'border-border' };

export default function Recommendations() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Study Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalized suggestions based on your performance</p>
      </div>

      <div className="space-y-3">
        {mockRecommendations.map((rec, i) => (
          <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-card rounded-xl p-5 shadow-card border-l-4 ${priorityColors[rec.priority]} space-y-3`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{rec.topic}</p>
                <p className="text-xs text-muted-foreground">{rec.subject}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[rec.difficulty]}`}>{rec.difficulty}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {rec.estimatedTime}</span>
              <span className="flex items-center gap-1"><Lightbulb className="h-3 w-3" /> {rec.reason}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
                <Play className="h-4 w-4" /> Start Now
              </button>
              <button className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted transition">
                <Calendar className="h-4 w-4" /> Schedule
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
