var express = require('express');
var router = express.Router();
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

router.get('/data', function(req, res, next) {
  let dost = {};
  let usr = {};
  pool.connect(function (err, client, done){
    if(err){
      //console.log('ewe');
      res.end('{"error":"Error","status":500 }');
    }
    client.query('SELECT * FROM dostavljac;', [], function (err, result){
      done();
      if(err){
        console.log(err);
        res.sendStatus(500);
      }
      else{
        dost = result.rows;
        pool.connect(function (err, client2, done){
          if(err){
            res.end('{"error":"Error","status":500 }');
          }
          client2.query('SELECT * FROM korisnik;', [], function (err, result){
            done();
            if(err){
              console.log(err);
              res.sendStatus(500);
            }
            else{
              usr = result.rows;
              res.render('data', {delivery: dost, kor: usr});
            }
          });
        });
      }
    });
  });
});


router.post('/delete/delivery/:id', function(req, res, next) {
  pool.connect(function (err, client, done){
    let id = req.params.id;
    if(err){
      res.end('{"error":"Error","status":500 }');
    }
    client.query(`UPDATE dostavljac SET aktivan = false WHERE id = $1;`, [id], function (err, result){
      done();
      if(err){
        //console.info(id);
        res.sendStatus(500);
      }
      else{
        //console.log(id);
      }
    });
  });
});


router.post('/delete/article/:id', function(req, res, next) {
  pool.connect(function (err, client, done){
    let id = req.params.id;
    if(err){
      res.end('{"error":"Error","status":500 }');
    }
    client.query(`UPDATE artikli SET aktivan = false WHERE id = $1;`, [id], function (err, result){
      done();
      if(err){
        //console.info(id);
        res.sendStatus(500);
      }
      //else{
        //console.log(id);
      //}
    });
  });
});


router.get('/korisnik/logout',function(req, res, next) {
  res.clearCookie('korisnik');
  res.redirect('/');
});

router.get('/restaurant/logout',function(req, res, next) {
  res.clearCookie('restoran');
  res.redirect('/');
});

router.get('/delivery/logout/:id',function(req, res, next) {
  let id = req.params.id;
  res.clearCookie('dostavljac');
  pool.connect(function (err, client, done){
    if(err){
      res.end('{"error":"Error","status":500 }');
    }
    client.query(`UPDATE dostavljac SET logovan = false WHERE id = $1;`, [id], function (err, result){
      done();
      if(err){
        //console.info(id);
        res.sendStatus(500);
      }
      else{
        res.redirect('/');
      }
    });
  });
});


module.exports = router;
