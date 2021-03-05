var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');
var pg = require("pg");
var config = {
    user: 'kdypkdwr', //env var: PGUSER
    database: 'kdypkdwr', //env var: PGDATABASE
    password: 'fRvdrdjOB4EvxSoSVkVTdA4EeBAAmvmX', //env var: PGPASSWORD
    host: 'kandula.db.elephantsql.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 100, // max number of clients in the pool
    idleTimeoutMillis: 300, // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);
var io = null;

function manji(a, b) {
    if(a<b)
        return a;
    return b;
}

function veci(a, b) {
    if(a>b)
        return a;
    return b;
}

/* GET home page. */
router.get('/home', auth.deliveryAuth, function(req, res, next) {
    const token = req.cookies.dostavljac;
    let username;
    let id;
    let grad;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        id = decodedToken.id;
        grad = decodedToken.city;
    });
    //io = null;
    pool.connect(function (err, client, done) {
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT o.id, o.placeno, o.kvantitet, a.naziv as artNaziv, k.ime, k.prezime,
                    k.adresa, k.sprat, r.naziv as resNaziv, a.cijena, a.cijena_akcija,
                     gm.naziv as menuNaziv, gm.cijena as cGm, gm.id as flag, k.latituda, k.longituda
                    FROM orders o
                    INNER JOIN artikli a on a.id = o.artikal_id
                    INNER JOIN korisnik k on k.id = o.korisnik_id
                    INNER JOIN restoran r on r.id = o.restoran_id
                    INNER JOIN grupni_meni gm on gm.id = o.menu_id
                    WHERE o.dostavljac_id = $1 AND o.dostavljeno = false;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    let ord = result.rows;
                    pool.connect(function (err, client, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client.query(`SELECT * FROM dostavljac WHERE grad = $1 AND aktivan = true;`,
                            [grad], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    if(!io) {
                                        io = require('socket.io')(req.connection.server);

                                        io.sockets.on('connection', socket => {
                                            socket.join('dostavljaci');
                                            socket.on('chatMes', mes => {
                                                io.to('dostavljaci').emit('poruka', mes, username);
                                            })
                                            socket.on('disconnect', function () {
                                                socket.leave('dostavljaci');
                                                console.log('disconnected');
                                            })
                                        });
                                    }
                                    const apiKey = "***";
                                    res.render('dostavljac', {key: apiKey, username: username, data: ord, dos: result.rows, ajdi: id, ime: ''});
                                }
                            });
                    });
                }
            });
    });
});


router.get('/chat/:name', auth.deliveryAuth, function(req, res, next) {
    const token = req.cookies.dostavljac;
    let username;
    let id;
    let grad;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        id = decodedToken.id;
        grad = decodedToken.city;
    });
    let prvi = null;
    let ime_sagovornika = req.params.name;
    pool.connect(function (err, client, done) {
        if (err) {
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM orders WHERE dostavljac_id = $1 AND dostavljeno = false;`,
            [id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    let ord = result.rows;
                    pool.connect(function (err, client, done) {
                        if (err) {
                            res.end('{"error":"Error","status":500 }');
                        }
                        client.query(`SELECT * FROM dostavljac WHERE grad = $1 AND aktivan = true;`,
                            [grad], function (err, result) {
                                done();
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    if(!prvi) {
                                    //    io = require('socket.io')(req.connection.server);
                                        io.sockets.on('connection', socket => {
                                            prvi = socket.id;
                                            let soba = ''+ manji(username, ime_sagovornika)+veci(username,ime_sagovornika);
                                            socket.join(soba);
                                            console.log(soba);
                                            socket.on('chatMessage', mes => {
                                                io.to(soba).emit('message', mes, '');
                                            })
                                            socket.on('disconnect', function () {
                                                socket.leave(soba);
                                                console.log('disconnected');
                                            })
                                        });
                                    }
                                    let apiKey = "***";
                                    res.render('dostavljac', {key: apiKey, username: username, data: ord, dos: result.rows, ajdi: id, ime: ime_sagovornika});
                                }
                            });
                    });
                }
            });
    });
});


router.post('/confirm/order/:id',auth.deliveryAuth, function(req, res, next) {
    let id = req.params.id;
    console.log(id);
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`UPDATE orders SET dostavljeno = true, placeno = true WHERE id = $1;`,
            [id], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    console.log("dodano prolsl");
                }
            });
    });
});


router.post('/abort/order/:id', auth.deliveryAuth, function(req, res, next) {
    let id = req.params.id;
    console.log(id);
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`UPDATE orders SET dostavljeno = true WHERE id = $1;`,
            [id], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    console.log("dodano abort");
                }
            });
    });
});

module.exports = router;
