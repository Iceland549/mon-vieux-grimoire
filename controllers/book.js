const Book = require('../models/book');
const fs = require('fs');
const sharp = require('sharp');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const originalName = req.file.originalname.split(' ').join('_');
    const fileName = originalName + Date.now() + '.webp';

    sharp(req.file.buffer)
        .webp({ quality: 80 }) 
        .toFile(`images/${fileName}`)
        .then(() => {
            const book = new Book({
                ...bookObject,
                userId: req.auth.userId,
                imageUrl: `${req.protocol}://${req.get('host')}/images/${fileName}`
            });

            book.save()
                .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
                .catch(error => {
                    fs.unlink(`images/${fileName}`, () => {}); 
                    res.status(400).json({ error });
                });
        })
        .catch(error => res.status(500).json({ error: "Erreur lors du traitement de l'image" }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body};

    delete bookObject._userId;
    delete bookObject.ratings; // Empêcher la modification des notes
    delete bookObject.averageRating; // Empêcher la modification de la note
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non-autorisé '});
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié !'}))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé !'}))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getBestRatingBooks = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 }) 
        .limit(3) 
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.rateBook = async (req, res, next) => {
    try {
        const { userId, rating } = req.body;
        const bookId = req.params.id;
        console.log('Received bookId:', bookId); 

        // Vérification de la validité de la note
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
        }

        // Recherche du livre par ID
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé.' });
        }

        // Vérification si l'utilisateur a déjà noté ce livre
        if (book.hasUserRated(userId)) {
            return res.status(400).json({ error: 'Vous avez déjà noté ce livre.' });
        }

        // Ajout de la nouvelle évaluation
        book.ratings.push({ userId, grade: rating });

        // Calcul de la nouvelle note moyenne
        book.averageRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length;

        // Sauvegarde du livre mis à jour
        await book.save();

        // Réponse avec le livre mis à jour
        res.status(200).json(book);
    } catch (error) {
        console.error('Rate book error:', error); 
        res.status(500).json({ error: error.message });
    }
};



