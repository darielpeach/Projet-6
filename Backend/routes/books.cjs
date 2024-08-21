const express = require('express');
const { createBook, modifyBook, deleteBook, getOneBook, getAllBooks, getBestRateBooks, rateBook } = require('../controllers/books.cjs');
const router = express.Router();
const auth = require('../middleware/auth.cjs')
const { upload, optimizeImage} = require('../middleware/multer-config.cjs')

router.get('/bestrating', getBestRateBooks)
router.post('/', auth, upload, optimizeImage, createBook);
router.put('/:id', auth, upload, optimizeImage, modifyBook);
router.post('/:id/rating', auth, rateBook)
router.delete('/:id',auth, deleteBook);
router.get('/:id', getOneBook);
router.get('/', getAllBooks);


module.exports = router;
