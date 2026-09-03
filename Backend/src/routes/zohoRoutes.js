const router = require('express').Router();
const verifyToken = require('../middlewares/auth');
const { handleZohoProxy } = require('../controllers/zohoController');

// e.g. GET /api/zoho/zoho_crm/Leads  ->  appKey='zoho_crm', wildcard='Leads'
router.all('/:appKey/*splat', verifyToken, handleZohoProxy);

module.exports = router;
