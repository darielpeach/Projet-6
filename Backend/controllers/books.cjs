const bookSchema = require("../models/Books.cjs");
const fs = require('fs')
const mongoose = require('mongoose')
const { applyAverage, calculateAverageRating } = require('../middleware/averageRating.cjs')


const createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId
    const book = new bookSchema({
        ... bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    book.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !'})})
        .catch(error => { res.status(400).json({ error })})
};

const modifyBook = (req, res, next) => {
   const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body }

   delete bookObject._userId
   bookSchema.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message : 'Non-autorisé' })
        } else {
            bookSchema.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message : 'Objet modifié !'}))
                .catch(error => res.status(401).json({ error }))
        }
    })
    .catch((error) => res.status(400).json({ error}))
};

const rateBook = (req, res, next) => {
    const userId = req.auth.userId;
    const { grade } = req.body;
    const bookId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }

    if (!grade || typeof grade !== 'number' || grade < 1 || grade > 5) {
        return res.status(400).json({ error: 'Invalid grade. Must be a number between 1 and 5.' });
    }

    console.log("ID du livre:", bookId);
    console.log("ID de l'utilisateur:", userId);
    console.log("Note donnée:", grade);

    bookSchema.findOne({ _id: bookId })
        .then(book => {
            if (!book) {
                console.log("Livre non trouvé");
                return res.status(404).json({ message: 'Livre non trouvé' });
            }

            const existingRating = book.ratings.find(rating => rating.userId === userId);

            if (existingRating) {
                existingRating.grade = grade;
            } else {
                book.ratings.push({ userId, grade });
            }

            book.averageRating = calculateAverageRating(book.ratings);

            book.save()
                .then(() => {
                    res.status(200).json({ message: 'Note enregistrée !' });
                })
                .catch(error => {
                    res.status(400).json({ error });
                });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};



const deleteBook = (req, res, next) => {
    bookSchema.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé !'})
            } else {
                const filename = book.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    bookSchema.deleteOne({ _id: req.params.id})
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }))
                })
            }
        })
        .catch(error => res.status(500).json({ error }))
};

const getOneBook = (req, res, next) => {
    bookSchema.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
};

const getAllBooks = (req, res, next) => {
    bookSchema.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

const getBestRateBooks = (req, res, next) => {
    bookSchema.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }))
}

module.exports = {
    createBook,
    modifyBook,
    deleteBook,
    getOneBook,
    getAllBooks,
    getBestRateBooks,
    rateBook
};
