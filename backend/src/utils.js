// Simple logging helpers extracted from index.js
const now = () => new Date().toISOString();
const log = (...args) => console.log(now(), '-', ...args);
const errLog = (...args) => console.error(now(), '-', ...args);

module.exports = { log, errLog };
