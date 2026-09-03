require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Role, Permission } = require('./src/models');

async function seed() {
  await sequelize.sync({ force: false });

  // ---- Roles ----
  const roleNames = ['Admin', 'HR', 'Sales', 'Support', 'Finance'];
  const roles = {};
  for (const name of roleNames) {
    const [role] = await Role.findOrCreate({ where: { name } });
    roles[name] = role;
  }

  // ---- Permissions (one per Zoho app) ----
  const permissionDefs = [
    { appKey: 'zoho_people', label: 'Zoho People' },
    { appKey: 'zoho_crm', label: 'Zoho CRM' },
    { appKey: 'zoho_desk', label: 'Zoho Desk' },
    { appKey: 'zoho_books', label: 'Zoho Books' },
  ];
  const permissions = {};
  for (const def of permissionDefs) {
    const [perm] = await Permission.findOrCreate({ where: { appKey: def.appKey }, defaults: def });
    permissions[def.appKey] = perm;
  }

  // ---- Role -> Permission mapping ----
  await roles.HR.setPermissions([permissions.zoho_people]);
  await roles.Sales.setPermissions([permissions.zoho_crm]);
  await roles.Support.setPermissions([permissions.zoho_desk]);
  await roles.Finance.setPermissions([permissions.zoho_books]);
  await roles.Admin.setPermissions(Object.values(permissions)); // Admin sees everything

  // ---- Default admin user ----
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@company.com' },
    defaults: { name: 'Admin', passwordHash },
  });
  await admin.setRoles([roles.Admin]);

  console.log('Seed complete. Login with admin@company.com / Admin@123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
