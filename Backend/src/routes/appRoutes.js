const router = require('express').Router();
const verifyToken = require('../middlewares/auth');
const { getMyApps } = require('../controllers/appsController');

router.get('/', verifyToken, getMyApps);

module.exports = router;
