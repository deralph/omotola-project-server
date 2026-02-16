import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Award, Target, Calendar } from 'lucide-react';

const studyTimeData = [
  { subject: 'CS', hours: 18 },
  { subject: 'Math', hours: 12 },
  { subject: 'Eng', hours: 8 },
  { subject: 'GNS', hours: 5 },
];

const performanceData = [
  { week: 'W1', score: 65 },
  { week: 'W2', score: 72 },
  { week: 'W3', score: 68 },
  { week: 'W4', score: 78 },
  { week: 'W5', score: 82 },
  { week: 'W6', score: 85 },
];

const radarData = [
  { subject: 'Data Structures', score: 85 },
  { subject: 'Algorithms', score: 70 },
  { subject: 'OS', score: 65 },
  { subject: 'DBMS', score: 80 },
  { subject: 'Calculus', score: 55 },
  { subject: 'Digital Logic', score: 72 },
];

const metrics = [
  { label: 'Average Score', value: '78%', icon: Target, color: 'bg-primary/10 text-primary' },
  { label: 'Completion Rate', value: '92%', icon: Award, color: 'bg-secondary/10 text-secondary' },
  { label: 'Study Consistency', value: '85%', icon: Calendar, color: 'bg-accent/10 text-accent' },
  { label: 'Improvement', value: '+15%', icon: TrendingUp, color: 'bg-secondary/10 text-secondary' },
];

export default function Progress() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Progress & Analytics</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 shadow-card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${m.color}`}>
              <m.icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Study Hours by Subject</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={studyTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quiz Performance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ fill: 'hsl(var(--secondary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Strengths & Weaknesses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Subject Breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Subject Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground text-xs">
                <th className="text-left p-3">Subject</th>
                <th className="text-left p-3">Hours</th>
                <th className="text-left p-3">Avg Score</th>
                <th className="text-left p-3">Quizzes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="p-3 text-foreground">Computer Science</td><td className="p-3">18h</td><td className="p-3 text-secondary font-medium">82%</td><td className="p-3">5</td></tr>
              <tr><td className="p-3 text-foreground">Mathematics</td><td className="p-3">12h</td><td className="p-3 text-accent font-medium">70%</td><td className="p-3">3</td></tr>
              <tr><td className="p-3 text-foreground">Engineering</td><td className="p-3">8h</td><td className="p-3 text-secondary font-medium">75%</td><td className="p-3">2</td></tr>
              <tr><td className="p-3 text-foreground">General Studies</td><td className="p-3">5h</td><td className="p-3 text-secondary font-medium">88%</td><td className="p-3">1</td></tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
