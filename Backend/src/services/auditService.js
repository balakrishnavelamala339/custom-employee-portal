const { AuditLog } = require('../models');

async function logAction(userId, action, detail = '', ipAddress = '') {
  try {
    await AuditLog.create({ userId, action, detail, ipAddress });
  } catch (err) {
    // Never let logging failures break the main request
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAction };
