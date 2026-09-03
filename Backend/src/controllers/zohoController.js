const { Role, Permission } = require('../models');
const { proxyZohoRequest } = require('../services/zohoProxyService');
const { logAction } = require('../services/auditService');

// GET/POST /api/zoho/:appKey/*
// Verifies the logged-in user's role actually has permission for this appKey
// BEFORE forwarding anything to Zoho — this is the core RBAC enforcement point.
async function handleZohoProxy(req, res) {
  const { appKey } = req.params;
  const subPath = '/' + (req.params[0] || '');

  try {
    const role = await Role.findOne({
      where: { name: req.user.role },
      include: Permission,
    });

    const hasAccess = role?.Permissions?.some((p) => p.appKey === appKey);
    if (!hasAccess) {
      await logAction(
        req.user.id,
        'ACCESS_DENIED',
        `Role ${req.user.role} tried to access ${appKey}`,
        req.ip
      );
      return res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
    }

    const data = await proxyZohoRequest(appKey, subPath, req.method, req.body, req.query);

    await logAction(
      req.user.id,
      'ZOHO_PROXY_CALL',
      `${req.user.email} (${req.user.role}) called ${appKey}${subPath}`,
      req.ip
    );

    res.json(data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(502).json({ message: 'Zoho request failed' });
  }
}

module.exports = { handleZohoProxy };
