const bcrypt = require('bcryptjs');
const { User, Role, AuditLog } = require('../models');
const { logAction } = require('../services/auditService');

// GET /api/admin/users
async function listUsers(req, res) {
  const users = await User.findAll({ include: Role, attributes: { exclude: ['passwordHash'] } });
  res.json({ users });
}

// POST /api/admin/users  { name, email, password, roleName }
async function createUser(req, res) {
  try {
    const { name, email, password, roleName } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const role = await Role.findOne({ where: { name: roleName } });
    if (role) await user.addRole(role);

    await logAction(req.user.id, 'USER_CREATED', `Created ${email} with role ${roleName}`, req.ip);
    res.status(201).json({ id: user.id, name, email });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not create user' });
  }
}

// PUT /api/admin/users/:id/role  { roleName }
async function updateUserRole(req, res) {
  const { id } = req.params;
  const { roleName } = req.body;

  const user = await User.findByPk(id);
  const role = await Role.findOne({ where: { name: roleName } });
  if (!user || !role) return res.status(404).json({ message: 'User or role not found' });

  await user.setRoles([role]); // single-role model
  await logAction(req.user.id, 'ROLE_ASSIGNED', `Set ${user.email} to ${roleName}`, req.ip);
  res.json({ message: 'Role updated' });
}

// GET /api/admin/audit-logs
async function getAuditLogs(req, res) {
  const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
  res.json({ logs });
}

module.exports = { listUsers, createUser, updateUserRole, getAuditLogs };
