module.exports = {
  buildRecommendations(context, stats = {}) {
    const recs = [];
    if (context?.connectivity?.isLowBandwidth) recs.push({ type: 'bandwidth', tip: 'Prefer text summaries over videos.' });
    if ((stats.avgScore || 0) < 50) recs.push({ type: 'performance', tip: 'Revise fundamentals and attempt easy quizzes first.' });
    if (!recs.length) recs.push({ type: 'general', tip: 'Keep a daily 30-minute focused revision streak.' });
    return recs;
  }
};
