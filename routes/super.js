var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = {
    user: 'kdypkdwr', //env var: PGUSER
    database: 'kdypkdwr', //env var: PGDATABASE
    password: '-', //env var: PGPASSWORD
    host: 'kandula.db.elephantsql.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 100, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);
var pool2 = new pg.Pool(config);

router.get('/', function(req, res, next) {
    let rest = {};
    let g = {};
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query("SELECT naziv, kategorija, grad, email, ime_admina FROM restoran WHERE aktivan = true;", [], function (err, result){
            done();
            if(err){
                console.log(err);
                res.sendStatus(500);
            }
            else{
                rest = result.rows;
                pool2.connect(function (err, client2, done){
                    if(err){
                        res.end('{"error":"Error","status":500 }');
                    }
                    client2.query("SELECT id, naziv FROM grad_lkp WHERE aktivan = true;", [], function (err, result){
                        done();
                        if(err){
                            console.log(err);
                            res.sendStatus(500);
                        }
                        else{
                            g = result.rows;
                            res.render('superAdmin', {data: rest, gr: g});
                        }
                    });
                });
            }
        });
    });



});

module.exports = router;
