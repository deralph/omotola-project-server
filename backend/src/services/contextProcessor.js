module.exports = {
  normalizeContext(payload = {}) {
    const isLowBandwidth = ['2g', '3g', 'offline'].includes(payload?.connectivity?.type) || payload?.connectivity?.speed === 'slow';
    return { ...payload, connectivity: { ...(payload.connectivity || {}), isLowBandwidth } };
  }
};
