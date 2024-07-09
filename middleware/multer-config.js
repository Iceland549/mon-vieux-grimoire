const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    if (Object.keys(MIME_TYPES).includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Type de fichier non supporté'), false);
    }
};

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
}).single('image');
