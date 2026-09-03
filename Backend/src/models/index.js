const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// ---- Users ----
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// ---- Roles ----
const Role = sequelize.define('Role', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }, // Admin, HR, Sales, Support, Finance
});

// ---- Permissions (maps to a Zoho app) ----
const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  appKey: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. 'zoho_people'
  label: { type: DataTypes.STRING, allowNull: false }, // e.g. 'Zoho People'
});

// ---- Join tables ----
const UserRole = sequelize.define('UserRole', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
});

const RolePermission = sequelize.define('RolePermission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
});

// ---- Audit Logs ----
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false }, // e.g. 'LOGIN', 'ZOHO_PROXY_CALL', 'ROLE_ASSIGNED'
  detail: { type: DataTypes.TEXT, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true },
});

// ---- Associations ----
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  AuditLog,
};
