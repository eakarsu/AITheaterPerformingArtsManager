// Compatibility shim: batch08 routes require '../middleware/auth' as a function.
// Re-export the authenticateToken middleware from routes/auth.js so legacy imports work.
const { authenticateToken } = require('../routes/auth');
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
