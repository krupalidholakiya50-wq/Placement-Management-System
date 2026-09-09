const express = require('express');
const router = express.Router();
const { injectDemoData } = require('../controllers/seederController');

router.post('/inject-demo', injectDemoData);

module.exports = router;
