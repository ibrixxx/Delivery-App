var express = require('express');
var router = express.Router();
const auth = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
var fileUpload = require('express-fileupload');
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


router.get('/home', auth.restaurantAuth, function(req, res, next) {
    const token = req.cookies.restoran;
    let username;
    let id;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        id = decodedToken.id;
    });
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM restoran WHERE id = $1`,
            [id], function (err, result){
                done();
                if(err){
                    res.sendStatus(500);
                }
                else{
                    res.render('resAdmin', {username: username, data: result.rows});
                }
            });
    });

});


router.get('/data', auth.restaurantAuth, function(req, res, next) {
    let restID;
    const token = req.cookies.restoran;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        restID = decodedToken.id;
    });
    let artikli = {};
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM artikli WHERE aktivan = true AND restoran_id = $1;`,
            [restID], function (err, result){
                done();
                if(err){

                    res.sendStatus(500);
                }
                else{
                    artikli = result.rows;
                    pool.connect(function (err, client2, done){
                        if(err){
                            res.end('{"error":"Error","status":500 }');
                        }
                        client.query(`SELECT * FROM grupni_meni WHERE restoran_id = $1;`,
                            [restID], function (err, result){
                                done();
                                if(err){
                                    res.sendStatus(500);
                                }
                                else{
                                    res.render('resData', {art: artikli, gr: result.rows});
                                }
                            });
                    });
                }
            });
    });
});


router.post('/article', auth.restaurantAuth, function(req, res, next) {
    let name = req.files.slika.name;
    let data = req.files.slika.data;
    console.log(name);
    console.log(data);
    let restID;
    const token = req.cookies.restoran;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        restID = decodedToken.id;
    });

    pool.connect(function (err, client, done){
        let akc = req.body.sale, naziv = req.body.name1, sastojci = req.body.ing,
            cijena1 = req.body.price1, cijena2 = req.body.price2, datum1 = req.body.date1, datum2 = req.body.date2;
        cijena1 *= 1.0;
        cijena2 *= 1.0;
        let akcija;
        if(akc == "false")
            akcija = false;
        else
            akcija = true;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        if(akcija) {
            client.query(`INSERT INTO artikli(naziv,restoran_id,sastojci,cijena,akcija,
            cijena_akcija,pocetak_akcije,kraj_akcije,img_name,img_data) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
                [naziv,restID,sastojci,cijena1,akcija,cijena2,datum1,datum2,name,data], function (err, result){
                done();
                if(err){
                    console.info(err);
                    res.sendStatus(500);
                }
                else{
                    console.log(data);
                }
            });
        }
        else {
            client.query(`INSERT INTO artikli(naziv,restoran_id,sastojci,cijena,
            img_name,img_data) VALUES($1,$2,$3,$4,$5,$6);`,
            [naziv,restID,sastojci,cijena1,name,data], function (err, result){
                done();
                if(err){
                    console.info(err);
                    res.sendStatus(500);
                }
                else{
                    console.log(data);
                }
            });
        }
    });
});


router.post('/menu', auth.restaurantAuth, function(req, res, next) {
    let name = req.files.menuimg.name;
    let data = req.files.menuimg.data;
    console.log(name);
    console.log(data);
    let restID;
    const token = req.cookies.restoran;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        restID = decodedToken.id;
    });
    pool.connect(function (err, client, done){
        let naziv = req.body.name11, artikli = req.body.art, cijena = req.body.price11,
            od = req.body.date11, dod = req.body.date22;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`INSERT INTO grupni_meni(naziv,artikli,cijena,traje_od,traje_do,restoran_id,
            img_name,img_data) VALUES($1,$2,$3,$4,$5,$6,$7,$8);`,
            [naziv,artikli,cijena,od,dod,restID,name,data], function (err, result){
            done();
            if(err){
                //console.info(id);
                res.sendStatus(500);
            }
            else{
                console.log("dodano");
            }
        });
    });
});


router.post('/edit', auth.restaurantAuth, function(req, res, next) {
    let restID;
    const token = req.cookies.restoran;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        restID = decodedToken.id;
    });
    pool.connect(function (err, client, done){
        let naziv = req.body.namex, ime = req.body.surnamex, email = req.body.emailx,
            ctg = req.body.categx;

        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`UPDATE restoran SET naziv = $1, ime_admina = $2, email = $3, kategorija = $4,
                        radi_od = $6, radi_do = $7 WHERE id = $5;`,
            [naziv,ime,email,ctg,restID,req.body.fromx,req.body.to], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    console.log("dodano");
                    //res.ok();
                }
            });
    });
});



module.exports = router;
