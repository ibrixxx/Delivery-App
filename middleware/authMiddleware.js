const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
    const token = req.cookies.korisnik;
    if(token) {
        jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.redirect('/login/user');
            }
            else {
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect('/login/user');
    }
}

const deliveryAuth = (req, res, next) => {
    const token = req.cookies.dostavljac;
    if(token) {
        jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.redirect('/login/delivery');
            }
            else {
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect('/login/delivery');
    }
}

const restaurantAuth = (req, res, next) => {
    const token = req.cookies.restoran;
    if(token) {
        jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.redirect('/login/restaurant');
            }
            else {
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect('/login/restaurant');
    }
}


module.exports = {
    userAuth,
    deliveryAuth,
    restaurantAuth
}