import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Bookmark, BookmarkCheck, ExternalLink, Search, Video, FileText, File } from 'lucide-react';
import { mockResources, type Resource } from '@/lib/mock-data';

const typeIcons = { Video: Video, Article: FileText, PDF: File };

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');

  const subjects = ['All', ...new Set(resources.map((r) => r.subject))];
  const filtered = resources.filter(
    (r) => (filterSubject === 'All' || r.subject === filterSubject) && r.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBookmark = (id: string) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, bookmarked: !r.bookmarked } : r)));
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Resources Hub</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {subjects.map((s) => (
            <button key={s} onClick={() => setFilterSubject(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${filterSubject === s ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((res, i) => {
          const Icon = typeIcons[res.type];
          return (
            <motion.div key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-5 shadow-card space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{res.title}</p>
                    <p className="text-xs text-muted-foreground">{res.subject} · {res.duration}</p>
                  </div>
                </div>
                <button onClick={() => toggleBookmark(res.id)} className="text-accent hover:scale-110 transition-transform">
                  {res.bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-accent">
                  <Star className="h-3.5 w-3.5 fill-current" /> {res.rating}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{res.type}</span>
              </div>
              <a href={res.url} target="_blank" rel="noopener noreferrer"
                className="w-full py-2 rounded-lg border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted transition">
                <ExternalLink className="h-4 w-4" /> Open Resource
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
