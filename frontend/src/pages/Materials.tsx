import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, Filter, FileText, Trash2, Play, X, CloudUpload } from 'lucide-react';
import { mockMaterials, type Material } from '@/lib/mock-data';

const fileTypeColors: Record<string, string> = {
  pdf: 'bg-destructive/10 text-destructive',
  docx: 'bg-primary/10 text-primary',
  txt: 'bg-muted text-muted-foreground',
  image: 'bg-accent/10 text-accent',
};

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const subjects = ['All', ...new Set(materials.map((m) => m.subject))];
  const filtered = materials.filter(
    (m) =>
      (filterSubject === 'All' || m.subject === filterSubject) &&
      m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Materials</h1>
        <button onClick={() => setShowUpload(!showUpload)}
          className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition">
          <Upload className="h-4 w-4" /> Upload
        </button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); }}>
          <CloudUpload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-medium">Drag & drop files here</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, Images — Max 10MB</p>
          <button className="mt-4 px-6 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition">
            Browse Files
          </button>
        </motion.div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)}
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

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((mat, i) => (
          <motion.div key={mat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 shadow-card space-y-3">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase ${fileTypeColors[mat.fileType] || 'bg-muted text-muted-foreground'}`}>
                {mat.fileType}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{mat.title}</p>
                <p className="text-xs text-muted-foreground">{mat.subject}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{mat.uploadDate}</span>
              <span>{mat.size}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${mat.status === 'ready' ? 'bg-secondary/10 text-secondary' : mat.status === 'processing' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                {mat.status === 'processing' ? '⏳ Processing' : mat.status === 'ready' ? '✓ Ready' : '✗ Error'}
              </span>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground" title="Generate Quiz">
                  <Play className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive" title="Delete"
                  onClick={() => setMaterials((prev) => prev.filter((m) => m.id !== mat.id))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-foreground font-medium">No materials found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
