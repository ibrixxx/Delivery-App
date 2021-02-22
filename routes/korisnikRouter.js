var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');
var nodemailer = require('nodemailer');
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

//radi kad se dopusti pristup
//https://myaccount.google.com/lesssecureapps
async function mainMail(email) {
    // Only needed if you don't have a real mail account for testing
    //let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ponesidotcom@gmail.com',
            pass: 'Matematika999+'
        }
    });

    let info = await transporter.sendMail({
        from: 'Ponesi.com <noreply.ponesidotcom@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Ponesi Order ✔", // Subject line
        text: "Order is noted!", // plain text body
        html: "<b>Hello world 👻</b>", // html body
    });

    //console.log("Message sent to: " + email);
}

/* GET home page. */
router.get('/home', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done){
        let podaci = {};
        let kateg = {};
        let menu = {};
        let akc = {};
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    podaci = result.rows;
                    pool.connect(function (err, client2, done){
                        if(err){
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result){
                                done();
                                if(err){
                                    console.log(err);
                                    res.sendStatus(500);
                                }
                                else{
                                    kateg = result.rows;
                                    pool.connect(function (err, client3, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client3.query(`SELECT g.naziv, g.artikli, g.id, g.cijena, r.id as re, g.img_data FROM grupni_meni g INNER JOIN restoran r on r.id = g.restoran_id
                                         WHERE r.grad = $1 and g.aktivan = true LIMIT 3;`,
                                            [grad], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    menu = result.rows;
                                                    pool.connect(function (err, client4, done){
                                                        if(err){
                                                            res.end('{"error":"Error","status":500 }');
                                                        }
                                                        client4.query(`SELECT a.id, a.naziv, r.naziv as sastojci, a.cijena, a.cijena_akcija, a.img_data 
                                                        FROM artikli a INNER JOIN restoran r on r.id = a.restoran_id
                                                            WHERE r.grad = $1 AND a.akcija = true LIMIT 4; `,
                                                            [grad], function (err, result){
                                                                done();
                                                                if(err){
                                                                    console.log(err);
                                                                    res.sendStatus(500);
                                                                }
                                                                else{
                                                                    akc = result.rows;
                                                                    pool.connect(function (err, client5, done){
                                                                        if(err){
                                                                            res.end('{"error":"Error","status":500 }');
                                                                        }
                                                                        client5.query(`SELECT a.id, a.naziv, r.naziv as sastojci, a.cijena, a.broj_narudzbi, a.img_data
                                                                         FROM artikli a INNER JOIN restoran r on r.id = a.restoran_id WHERE r.grad = $1 
                                                                        ORDER BY a.broj_narudzbi DESC LIMIT 4;`,
                                                                            [grad], function (err, result){
                                                                                done();
                                                                                if(err){
                                                                                    console.log(err);
                                                                                    res.sendStatus(500);
                                                                                }
                                                                                else{
                                                                                    res.render('korisnik', {username: username, info: podaci, menu: menu, ctg: kateg, action: akc, best: result.rows });
                                                                                }
                                                                            });
                                                                    });
                                                                }
                                                            });
                                                    });
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.get('/onsale', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT a.id, a.naziv, a.sastojci, a.cijena, a.cijena_akcija, a.img_data FROM artikli a INNER JOIN 
                                           restoran r on r.id = a.restoran_id WHERE r.grad = $1 AND a.akcija = true AND a.aktivan = true;`,
                                            [grad], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    console.log(result.rows);
                                                    res.render('artikli', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.post('/search', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        let item = '%'+req.body.searchx+'%';
        item = item.toLowerCase();
        item = item.trim();
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT a.id, a.naziv, a.sastojci, a.cijena, a.cijena_akcija, a.img_data FROM artikli a INNER JOIN 
                                           restoran r on r.id = a.restoran_id WHERE r.grad = $1 AND lower(a.naziv) LIKE $2 AND a.aktivan = true;`,
                                            [grad, item], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    console.log(result.rows);
                                                    res.render('artikli', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.get('/menu', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        let datum = new Date();
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT a.id, a.naziv, a.artikli, a.cijena, a.img_data, a.traje_do FROM grupni_meni a INNER JOIN 
                                           restoran r on r.id = a.restoran_id WHERE r.grad = $1 AND a.traje_do > $2;`,
                                            [grad, datum], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    console.log(result.rows);
                                                    res.render('menu', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});



router.get('/category/:ctg', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        let kategorija = req.params.ctg;
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT a.id, a.naziv, a.sastojci, a.cijena, a.cijena_akcija, a.img_data, a.kategorija FROM artikli a INNER JOIN 
                                           restoran r on r.id = a.restoran_id WHERE r.grad = $1 AND a.kategorija = $2 AND a.aktivan = true;`,
                                            [grad, kategorija], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    console.log(result.rows);
                                                    res.render('artikli', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.get('/history', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT a.id, a.naziv, a.sastojci, a.cijena, a.cijena_akcija, a.img_data, o.artikal_id
                                         FROM artikli a, orders o WHERE o.artikal_id = a.id AND a.aktivan = true;`,
                                            [], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    console.log(result.rows);
                                                    res.render('artikli', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.get('/restorani', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT * FROM restoran WHERE grad = $1 AND aktivan = true;`,
                                            [grad], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    console.log(result.rows);
                                                    res.render('restorani', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.get('/restoran/:id', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        let rest = req.params.id;
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT a.id, a.naziv, a.sastojci, a.cijena, a.cijena_akcija, a.img_data FROM artikli a INNER JOIN 
                                           restoran r on r.id = a.restoran_id WHERE r.grad = $1 AND a.restoran_id = $2 AND a.aktivan = true;`,
                                            [grad, rest], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    console.log(result.rows);
                                                    res.render('artikli', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.get('/artikal/:id', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        let artikal = req.params.id;
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT a.id, a.naziv, a.sastojci, a.cijena, a.cijena_akcija, a.img_data, r.naziv as restor, r.id as resid
                                          FROM artikli a, restoran r WHERE a.id = $1 AND r.id = a.restoran_id;`,
                                            [artikal], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    console.log(result.rows);
                                                    res.render('order', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.post('/order/article/:id/:re', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let id;
    let r1 = req.body.pla;
    let placeno = false;
    if(r1)
        placeno = true;
    let email;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
        email = decodedToken.email;
    });
    pool.connect(function (err, client, done) {
        let artikal = req.params.id;
        let restoran = req.params.re;
        let note = req.body.notes;
        let qua = req.body.kol;
        note = note.trim();
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`insert into orders (restoran_id, korisnik_id, datum, artikal_id, kvantitet, napomena, placeno) 
        values($1, $2, $3, $4, $5, $6, $7);`,
            [restoran, id, new Date(), artikal, qua, note, placeno], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    pool.connect(function (err, client5, done){
                        if(err){
                            res.end('{"error":"Error","status":500 }');
                        }
                        client5.query(`UPDATE artikli SET broj_narudzbi = broj_narudzbi + $2 WHERE id = $1;`,
                            [artikal, qua], function (err, result){
                                done();
                                if(err){
                                    console.log(err);
                                    res.sendStatus(500);
                                }
                                else{
                                    mainMail(email);
                                    res.redirect('/korisnik/home');
                                }
                            });
                    });
                }
            });
    });
});


router.get('/menu/:id', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let grad;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done) {
        let podaci = {};
        let kateg = {};
        let menu = req.params.id;
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM korisnik WHERE id = $1;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    podaci = result.rows;
                    pool.connect(function (err, client2, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client2.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    kateg = result.rows;
                                    pool.connect(function (err, client5, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client5.query(`SELECT g.id, g.naziv, g.artikli as sastojci, g.cijena, g.img_data, r.naziv as restor, r.id as resid
                                          FROM grupni_meni g, restoran r WHERE g.id = $1 AND r.id = g.restoran_id;`,
                                            [menu], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    res.render('groupOrder', {username: username, info: podaci, ctg: kateg, art: result.rows});
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
            });
    });
});


router.post('/order/menu/:id/:re', auth.userAuth,function(req, res, next) {
    const token = req.cookies.korisnik;
    let username = " ";
    let id;
    let r1 = req.body.pla;
    let placeno = false;
    if(r1)
        placeno = true;
    let email;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        grad = decodedToken.city;
        id = decodedToken.id;
        email = decodedToken.email;
    });
    pool.connect(function (err, client, done) {
        let menu = req.params.id;
        let restoran = req.params.re;
        let note = req.body.notes;
        let qua = req.body.kol;
        note = note.trim();
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`insert into orders (restoran_id, korisnik_id, datum, artikal_id, kvantitet, napomena, placeno, menu_id) 
        values($1, $2, $3, $4, $5, $6, $7, $8);`,
            [restoran, id, new Date(), 0, qua, note, placeno, menu], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    mainMail(email);
                    res.redirect('/korisnik/home');
                }
            });
    });
});



module.exports = router;
