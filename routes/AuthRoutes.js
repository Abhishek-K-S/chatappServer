const {Router} = require('express');
const router = Router();
const {login, signup, logout, verify} = require('../controler/authControler.js')

router.post('/signup', signup)

router.post('/login', login)

router.get('/logout', logout)

router.get('/verifyuser', verify )

module.exports = router;