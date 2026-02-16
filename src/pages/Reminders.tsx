import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, Clock, Repeat } from 'lucide-react';
import { mockReminders, type Reminder } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState<Reminder['recurrence']>('once');

  const toggleReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const addReminder = () => {
    if (!title.trim() || !time) return;
    const newR: Reminder = { id: Date.now().toString(), title, time, recurrence, enabled: true };
    setReminders((prev) => [...prev, newR]);
    setTitle(''); setTime(''); setRecurrence('once'); setShowForm(false);
    toast.success('Reminder created!');
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl p-5 shadow-card space-y-3">
          <input type="text" placeholder="Reminder title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Reminder['recurrence'])}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
          <button onClick={addReminder} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
            Create Reminder
          </button>
        </motion.div>
      )}

      <div className="space-y-3">
        {reminders.map((rem, i) => (
          <motion.div key={rem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-card rounded-xl p-4 shadow-card flex items-center gap-4 ${!rem.enabled ? 'opacity-50' : ''}`}>
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{rem.title}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {rem.time}</span>
                <span className="flex items-center gap-1"><Repeat className="h-3 w-3" /> {rem.recurrence}</span>
                {rem.condition && <span>{rem.condition}</span>}
              </div>
            </div>
            <button onClick={() => toggleReminder(rem.id)}
              className={`w-11 h-6 rounded-full transition-colors relative ${rem.enabled ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${rem.enabled ? 'translate-x-5' : ''}`} />
            </button>
            <button onClick={() => setReminders((prev) => prev.filter((r) => r.id !== rem.id))}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition">
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {reminders.length === 0 && (
        <div className="text-center py-16">
          <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-foreground font-medium">No reminders set</p>
          <p className="text-sm text-muted-foreground mt-1">Create one to stay on track!</p>
        </div>
      )}
    </div>
  );
}
