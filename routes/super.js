var express = require('express');
var router = express.Router();
var pg = require("pg");
var nodemailer = require('nodemailer');
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



async function mainMail(data) {
    // Only needed if you don't have a real mail account for testing
    //let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ponesidotcom@gmail.com',
            pass: '***'
        }
    });

    let info = await transporter.sendMail({
        from: 'Ponesi.com <noreply.ponesidotcom@gmail.com>', // sender address
        to: 'ibrahinmesan@gmail.com', // list of receivers
        subject: "Ponesi Order ✔", // Subject line
        text: "Order is noted!", // plain text body
        html: `<h1>Report</h1>
                <h3>Data by restaurant: ${JSON.stringify(data)}</h3>`, // html body
    });

    //console.log("Message sent to: " + email);
}


router.get('/', function(req, res, next) {
    let rest = {};
    let g = {};
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query("SELECT id, naziv, kategorija, grad, email FROM restoran WHERE aktivan = true;", [], function (err, result){
            done();
            if(err){
                console.log(err);
                res.sendStatus(500);
            }
            else{
                rest = result.rows;
                pool.connect(function (err, client2, done){
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
                            pool.connect(function (err, client3, done){
                                if(err){
                                    res.end('{"error":"Error","status":500 }');
                                }
                                client3.query("SELECT id, naziv FROM kategorija_hrane_lkp WHERE aktivan = true;", [], function (err, result){
                                    done();
                                    if(err){
                                        console.log(err);
                                        res.sendStatus(500);
                                    }
                                    else{
                                        res.render('superAdmin', {data: rest, gr: g, hrana: result.rows});
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


router.post('/delete/:id', function(req, res, next) {
    pool.connect(function (err, client, done){
        let id = req.params.id;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`UPDATE restoran SET aktivan = false WHERE id = $1;`, [id], function (err, result){
            done();
            if(err){
                console.info(id);
                res.sendStatus(500);
            }
            //else{
            //    console.log(id);
            //}
        });
    });
});

router.post('/delete/city/:id', function(req, res, next) {
    pool.connect(function (err, client, done){
        let id = req.params.id;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`UPDATE grad_lkp SET aktivan = false WHERE id = $1;`, [id], function (err, result){
            done();
            if(err){
                console.info(id);
                res.sendStatus(500);
            }
            //else{
            //    console.log(id);
            //}
        });
    });
});

router.post('/delete/food/:id', function(req, res, next) {
    pool.connect(function (err, client, done){
        let id = req.params.id;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`UPDATE kategorija_hrane_lkp SET aktivan = false WHERE id = $1;`, [id], function (err, result){
            done();
            if(err){
                console.info(id);
                res.sendStatus(500);
            }
            //else{
            //    console.log(id);
            //}
        });
    });
});

router.post('/addFood', function(req, res, next) {
    pool.connect(function (err, client, done){
        let fname = req.body.fname;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`INSERT INTO kategorija_hrane_lkp(naziv) VALUES ($1);`,
            [fname], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                //else{
                //    console.log(fname);
                //}
            });
    });
});

router.post('/addCity', function(req, res, next) {
    pool.connect(function (err, client, done){
        let fname = req.body.CityName;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`INSERT INTO grad_lkp(naziv) VALUES ($1);`,
            [fname], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                // else{
                //
                // }
            });
    });
});


router.post('/report', function(req, res, next) {
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`select o.restoran_id, r.naziv, count(*) as "number of orders", sum(a.cijena) as "profit (KM)" from orders o
                    inner join artikli a on a.id = o.artikal_id
                    inner join restoran r on o.restoran_id = r.id
                    group by o.restoran_id, r.naziv order by "number of orders"`,
            [], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    mainMail(result.rows);
                    res.redirect('/super/')
                }
            });
    });
});


module.exports = router;
