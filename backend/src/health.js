const express = require('express');
const { log, errLog } = require('./utils');

const router = express.Router();

/**
 * Simple health endpoint used by Kubernetes readiness/liveness probes
 */
router.get('/health', async (req, res) => {
  try {
    const uptime = process.uptime();
    const now = new Date().toISOString();
    log('Health check OK');
    res.json({ status: 'ok', uptime, now });
  } catch (err) {
    errLog('Health check error:', err);
    res.status(500).json({ status: 'error' });
  }
});

module.exports = router;
