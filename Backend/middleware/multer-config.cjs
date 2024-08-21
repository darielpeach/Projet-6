const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const { error } = require('console')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.memoryStorage()

const upload = multer({ storage }).single('image')

const optimizeImage = (req, res, next) => {
    if (!req.file) {
        return next()
    }

    const extension = MIME_TYPES[req.file.mimetype]
    const filename = `${req.file.originalname.split(' ').join('_')}${Date.now()}.webp`

    sharp(req.file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFormat(extension)
        .toFile(path.join('images', filename))
        .then(() => {
            req.file.filename = filename
            next()
        })
        
        .catch(error => {
            console.error('Erreur Sharp: ', error)
            res.status(500).json({ error: 'Erreur lors de l\'optimisation de l\'image'})})
}

module.exports = { upload, optimizeImage}