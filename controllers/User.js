const bcrypt = require('bcrypt');
console.log('bcrypt:', bcrypt);
console.log('bcrypt version:', bcrypt.version);
console.log('bcrypt is a function:', typeof bcrypt === 'function');
console.log('bcrypt.hash is a function:', typeof bcrypt.hash === 'function');
console.log('bcrypt.compare is a function:', typeof bcrypt.compare === 'function');

const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
    console.log('Signup request received:', req.body.email);
    console.log('Password to hash:', req.body.password);
    try {
        console.log('About to hash password');
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                console.log('Hashed password:', hash);
                const user = new User({
                    email: req.body.email,
                    password: hash
                });
                console.log('User object created:', user);
                user.save()
                    .then(() => {
                        console.log('User saved successfully');
                        res.status(201).json({ message: 'Utilisateur créé !'})
                    })
                    .catch(error => {
                        console.error('Error saving user:', error);
                        if (error.name === 'ValidationError' && error.errors.email && error.errors.email.kind === 'unique') {
                            res.status(400).json({ error: 'Cet email est déjà utilisé.' });
                        } else {
                            res.status(400).json({ error: error.message });
                        }
                    });
            })
            .catch(error => {
                console.error('Error hashing password:', error);
                res.status(500).json({ error: error.message });
            });
    } catch (error) {
        console.error('Unexpected error in signup:', error);
        res.status(500).json({ error: "Une erreur inattendue s'est produite" });
    }
};

exports.login = (req, res, next) => {
    console.log('Login request received:', req.body.email);
    try {
        User.findOne({email: req.body.email})
            .then(user => {
                if (user === null) {
                    console.log('User not found');
                    res.status(401).json({message: 'Paire identifiant/mot de passe incorrect'});
                } else {
                    console.log('User found:', JSON.stringify(user, null, 2));
                    console.log('Password to compare:', req.body.password);
                    console.log('Stored hashed password:', user.password);
                    bcrypt.compare(req.body.password, user.password)
                        .then(valid => {
                            console.log('Password comparison result:', valid);
                            console.log('Provided password:', req.body.password);
                            console.log('Stored hashed password:', user.password);
                            if (!valid) {
                                console.log('Invalid password');
                                res.status(401).json({message: 'Paire identifiant/mot de passe incorrect'});
                            } else {
                                console.log('Password valid, generating token');
                                res.status(200).json({
                                    userId: user._id,
                                    token: jwt.sign(
                                        { userId: user._id },
                                        'RANDOM_TOKEN_SECRET',
                                        { expiresIn: '24h' }
                                    )
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error comparing passwords:', error);
                            res.status(500).json({ error: error.message });
                        })
                }
            })
            .catch(error => {
                console.error('Error finding user:', error);
                res.status(500).json({ error: error.message });
            })
    } catch (error) {
        console.error('Unexpected error in login:', error);
        res.status(500).json({ error: "Une erreur inattendue s'est produite" });
    }
};
