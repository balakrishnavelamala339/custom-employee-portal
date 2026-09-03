const router = require('express').Router();
const verifyToken = require('../middlewares/auth');
const verifyRole = require('../middlewares/rbac');
const {
  listUsers,
  createUser,
  updateUserRole,
  getAuditLogs,
} = require('../controllers/adminController');

router.use(verifyToken, verifyRole(['Admin']));

router.get('/users', listUsers);
router.post('/users', createUser);
router.put('/users/:id/role', updateUserRole);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
