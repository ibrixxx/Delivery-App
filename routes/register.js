var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
// const map = require('./register');
var pg = require("pg");
var config = {
    user: 'kdypkdwr', //env var: PGUSER
    database: 'kdypkdwr', //env var: PGDATABASE
    password: 'fRvdrdjOB4EvxSoSVkVTdA4EeBAAmvmX', //env var: PGPASSWORD
    host: 'kandula.db.elephantsql.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 100, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);


router.get('/', function(req, res, next) {
    res.render('register');
});

/* GET home page. */
router.post('/user', function(req, res, next) {
    pool.connect(function (err, client, done){
        let name = req.body.name, surname = req.body.surname, email = req.body.email,
            pass = req.body.pswrd, address = req.body.adrs, floor = req.body.flr,
            cityy = req.body.cityy, country = req.body.cntry;
        let lat = req.body.lat, lng = req.body.lng;
        const saltRounds = 10;
        const myPlaintextPassword = pass;
        bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
            client.query(`INSERT INTO korisnik(ime,prezime,email,lozinka,adresa,sprat,latituda,longituda,grad,drzava)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
            [name, surname, email, hash, address, floor, lat, lng, cityy, country], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    res.redirect('/login/user');
                }
            });
        });
        //console.log(pass);
        // console.log(lat);
        // console.log(lng);
        if(err){
            res.end('{"error":"Error","status":500 }');
        }

    });
});


router.post('/restaurant', function(req, res, next) {
    pool.connect(function (err, client, done){
        let resName = req.body.name, adminName = req.body.surname, email = req.body.email,
            pass = req.body.pswrd, address = req.body.adrs, rating = req.body.flr,
            cityy = req.body.cityy, category = req.body.categ;
        let lat = req.body.lat, lng = req.body.lng;
        const saltRounds = 10;
        const myPlaintextPassword = pass;
        bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
            client.query(`INSERT INTO restoran(naziv,ime_admina,email,lozinka,adresa,latituda,longituda,grad,kategorija,rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
                [resName, adminName, email, hash, address, lat, lng, cityy, category, rating], function (err, result){
                    done();
                    if(err){
                        console.log(err);
                        res.sendStatus(500);
                    }
                    else{
                        res.redirect('/login/restaurant');
                    }
                });
        });
        // console.log(pass);
        // console.log(lat);
        // console.log(lng);
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
    });
});


/* GET home page. */
router.post('/delivery', function(req, res, next) {
    pool.connect(function (err, client, done){
        let name = req.body.name1, surname = req.body.surname1, email = req.body.email1,
            pass = req.body.pswrd1, cityy = req.body.grad;
        const saltRounds = 10;
        const myPlaintextPassword = pass;
        bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
            client.query(`INSERT INTO dostavljac(ime,prezime,email,lozinka,grad)
         VALUES ($1, $2, $3, $4, $5);`,
                [name, surname, email, hash, cityy], function (err, result){
                    done();
                    if(err){
                        // console.log(cityy);
                        // console.log(name);
                        // console.log(email);
                        // console.log(hash);

                        console.log(err);
                        res.sendStatus(500);
                    }
                    else{
                        res.redirect('/super/');
                    }
                });
        });
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
    });
});


module.exports = router;
