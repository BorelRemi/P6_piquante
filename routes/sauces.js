const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config')


const saucesCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');

router.post('/', auth,multer, saucesCtrl.createSauce);
router.get('/',  auth, saucesCtrl.getAllSauce);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.put('/:id', auth,multer,  saucesCtrl.modifySauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);

module.exports = router;