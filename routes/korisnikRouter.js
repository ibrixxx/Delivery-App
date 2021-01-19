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
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);

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
        console.log(id);
        console.log(grad);
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
                        client2.query(`SELECT * FROM kategorija_hrane_lkp;`,
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
                                        client3.query(`SELECT * FROM grupni_meni g INNER JOIN restoran r on r.id = g.restoran_id
                                         WHERE r.grad = $1 LIMIT 3;`,
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
                                                        client4.query(`SELECT * FROM artikli a INNER JOIN restoran r on r.id = a.restoran_id
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
                                                                        client5.query(`SELECT * FROM artikli a INNER JOIN 
                                                                        restoran r on r.id = a.restoran_id WHERE r.grad = $1 
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

module.exports = router;
