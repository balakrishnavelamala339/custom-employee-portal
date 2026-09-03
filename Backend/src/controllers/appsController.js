const { Role, Permission } = require('../models');

// GET /api/apps  (protected by verifyToken only — any logged-in user)
async function getMyApps(req, res) {
  try {
    const role = await Role.findOne({
      where: { name: req.user.role },
      include: Permission,
    });

    if (!role) return res.json({ apps: [] });

    const apps = role.Permissions.map((p) => ({ key: p.appKey, label: p.label }));
    res.json({ apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch apps' });
  }
}

module.exports = { getMyApps };
