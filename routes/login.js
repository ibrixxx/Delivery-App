var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

const maxAge = 3*24*60*60;
const createToken = (id, email, name, city) => {
    return jwt.sign({id, email, name, city}, 'ibro super sicret', {
        expiresIn: maxAge
    });
}



router.get('/user', function(req, res, next) {
    res.render('login',{users: true, delv: false, rest: false});
});

router.get('/delivery', function(req, res, next) {
    res.render('login',{users: false, delv: true, rest: false});
});

router.get('/restaurant', function(req, res, next) {
    res.render('login',{users: false, delv: false, rest: true});
});


router.post('/user/auth', function(req, res, next) {
    let email = req.body.inputEmail;
    console.log(email);
    pool.connect(function (err, client, done){
        let pass = req.body.pswrd;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT id, lozinka, ime, grad FROM korisnik WHERE email = $1;`,
            [email], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    console.log(pass);
                    let a = result.rows;
                    const myPlaintextPassword = req.body.pswrd;
                    const hash = a[0].lozinka;
                    let user_id = a[0].id;
                    let name = a[0].ime;
                    let grad = a[0].grad;
                    bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
                        if(result){
                            pool.connect(function (err, client2, done){
                                if(err){
                                    res.end('{"error":"Error","status":500 }');
                                }
                                client2.query(`UPDATE korisnik SET logovan = true WHERE id = $1;`,
                                    [user_id], function (err, result){
                                        done();
                                        if(err){
                                            console.log(err);
                                            res.sendStatus(500);
                                        }
                                        else{
                                            const token = createToken(user_id, email, name, grad);
                                            res.cookie('korisnik', token, {maxAge: maxAge*1000});
                                            res.redirect('/korisnik/home');
                                        }
                                    });
                            });
                        }
                        else {
                            res.redirect('/login/user');
                        }
                    });
                }
            });
    });
});


router.post('/delivery/auth', function(req, res, next) {
    let email = req.body.emd;
    console.log(email);
    pool.connect(function (err, client, done){
        let pass = req.body.passd;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT id, lozinka, ime, grad FROM dostavljac WHERE email = $1;`,
            [email], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    console.log(pass);
                    let a = result.rows;
                    const myPlaintextPassword = pass;
                    const hash = a[0].lozinka;
                    let user_id = a[0].id;
                    const name = a[0].ime;
                    let grad = a[0].grad;
                    bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
                        if(result){
                            pool.connect(function (err, client2, done){
                                if(err){
                                    res.end('{"error":"Error","status":500 }');
                                }
                                client2.query(`UPDATE dostavljac SET logovan = true WHERE id = $1;`,
                                    [user_id], function (err, result){
                                        done();
                                        if(err){
                                            console.log(err);
                                            res.sendStatus(500);
                                        }
                                        else{
                                            const token = createToken(user_id, email, name, grad);
                                            res.cookie('dostavljac', token, {maxAge: maxAge*1000});
                                            res.redirect('/delivery/home');
                                        }
                                    });
                            });
                        }
                        else {
                            res.redirect('/login/delivery');
                        }
                    });
                }
            });
    });
});


router.post('/restaurant/auth', function(req, res, next) {
    let email = req.body.emr;
    console.log(email);
    pool.connect(function (err, client, done){
        let pass = req.body.psr;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT id, lozinka, ime_admina, grad FROM restoran WHERE email = $1;`,
            [email], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    console.log(pass);
                    let a = result.rows;
                    const myPlaintextPassword = pass;
                    const hash = a[0].lozinka;
                    let user_id = a[0].id;
                    const name = a[0].ime_admina;
                    let grad = a[0].grad;
                    bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
                        if(result){
                            pool.connect(function (err, client2, done){
                                if(err){
                                    res.end('{"error":"Error","status":500 }');
                                }
                                client2.query(`UPDATE restoran SET logovan = true WHERE id = $1;`,
                                    [user_id], function (err, result){
                                        done();
                                        if(err){
                                            console.log(err);
                                            res.sendStatus(500);
                                        }
                                        else{
                                            const token = createToken(user_id, email, name, grad);
                                            res.cookie('restoran', token, {maxAge: maxAge*1000});
                                            res.redirect('/restaurant/home');
                                        }
                                    });
                            });
                        }
                        else {
                            res.redirect('/login/restaurant');
                        }
                    });
                }
            });
    });
});


module.exports = router;
