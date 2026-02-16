import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Clock, CheckCircle, ChevronRight, ArrowLeft, ArrowRight, Timer } from 'lucide-react';
import { mockQuizzes, mockQuizQuestions, type QuizQuestion } from '@/lib/mock-data';

export default function Quizzes() {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = mockQuizQuestions;

  if (activeQuiz && !submitted) {
    const q = questions[currentQ];
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
            <span className="flex items-center gap-1 text-accent font-medium"><Timer className="h-4 w-4" /> 15:00</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Question */}
        <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl p-6 shadow-card space-y-4">
          <p className="text-lg font-semibold text-foreground">{q.question}</p>
          {q.type === 'short-answer' ? (
            <textarea placeholder="Type your answer..." value={answers[q.id] || ''} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              className="w-full p-3 rounded-lg border border-input bg-background text-sm text-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring" />
          ) : (
            <div className="space-y-2">
              {q.options?.map((opt) => (
                <button key={opt} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition ${answers[q.id] === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-muted'}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground disabled:opacity-40 hover:bg-muted transition">
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ((p) => p + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => setSubmitted(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition">
              Submit <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    const score = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-card rounded-2xl p-8 shadow-card space-y-4">
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold ${pct >= 70 ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'}`}>
            {pct}%
          </div>
          <h2 className="text-2xl font-bold text-foreground">{pct >= 70 ? 'Great Job! 🎉' : 'Keep Practicing! 💪'}</h2>
          <p className="text-muted-foreground">{score} of {questions.length} correct</p>
        </motion.div>

        <div className="space-y-3">
          {questions.map((q, i) => {
            const correct = answers[q.id] === q.correctAnswer;
            return (
              <div key={q.id} className={`bg-card rounded-xl p-4 shadow-card border-l-4 ${correct ? 'border-secondary' : 'border-destructive'}`}>
                <p className="text-sm font-medium text-foreground">{q.question}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">Your answer:</span> <span className={correct ? 'text-secondary' : 'text-destructive'}>{answers[q.id] || '(no answer)'}</span></p>
                {!correct && <p className="text-xs text-secondary mt-1">Correct: {q.correctAnswer}</p>}
                <p className="text-xs text-muted-foreground mt-2 italic">{q.explanation}</p>
              </div>
            );
          })}
        </div>

        <button onClick={() => { setActiveQuiz(null); setSubmitted(false); setAnswers({}); setCurrentQ(0); }}
          className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition">
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mockQuizzes.map((quiz, i) => (
          <motion.div key={quiz.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{quiz.title}</p>
                <p className="text-xs text-muted-foreground">{quiz.subject}</p>
              </div>
              {quiz.bestScore !== undefined && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                  Best: {quiz.bestScore}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {quiz.questionCount} questions</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {quiz.duration} min</span>
            </div>
            <button onClick={() => { setActiveQuiz(quiz.id); setCurrentQ(0); setAnswers({}); setSubmitted(false); }}
              className="w-full py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
              <Play className="h-4 w-4" /> {quiz.status === 'completed' ? 'Retake' : 'Start Quiz'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
