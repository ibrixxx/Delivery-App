var express = require('express');
var router = express.Router();
const auth = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
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
async function mainMail(email, today, month, deliv) {
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
        html: `<h1>Report</h1><p>#Orders today: <b>${today}</b></p>
                <p>#Orders this month: ${month}</p>
                <p>#Orders by dilivery person: ${JSON.stringify(deliv)}</p>`, // html body
    });

    //console.log("Message sent to: " + email);
}


router.get('/home', auth.restaurantAuth, function(req, res, next) {
    const token = req.cookies.restoran;
    let username = " ";
    let id = 2;
    let grad;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        id = decodedToken.id;
        grad = decodedToken.city;
    });
    pool.connect(function (err, client, done){
        let podaci = { };
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM restoran WHERE id = $1;`,
            [id], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    podaci = result.rows;
                    pool.connect(function (err, client, done){
                        if(err){
                            res.end('{"error":"Error","status":500 }');
                        }
                        client.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result){
                                done();
                                if(err){
                                    console.log(err);
                                    res.sendStatus(500);
                                }
                                else{
                                    let kat = result.rows;
                                    pool.connect(function (err, client, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client.query(`SELECT * FROM orders WHERE dostavljac_id is null AND dostavljeno = false AND restoran_id = $1;`,
                                            [id], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    let order = result.rows;
                                                    pool.connect(function (err, client, done){
                                                        if(err){
                                                            res.end('{"error":"Error","status":500 }');
                                                        }
                                                        client.query(`SELECT * FROM dostavljac WHERE logovan = true AND aktivan = true AND grad = $1;`,
                                                            [grad], function (err, result){
                                                                done();
                                                                if(err){
                                                                    console.log(err);
                                                                    res.sendStatus(500);
                                                                }
                                                                else{
                                                                    let dos = result.rows;
                                                                    pool.connect(function (err, client, done){
                                                                        let da = new Date();
                                                                        let datum = `${da.getUTCFullYear()}-${da.getUTCMonth() + 1}-${da.getUTCDate()}`;
                                                                        if(err){
                                                                            res.end('{"error":"Error","status":500 }');
                                                                        }
                                                                        client.query(`select o.dostavljeno, o.placeno, d.ime, d.prezime, k.latituda, k.longituda from orders o
                                                                                        inner join korisnik k on k.id = o.korisnik_id
                                                                                        inner join dostavljac d on d.id = o.dostavljac_id
                                                                                        WHERE restoran_id = $1 and o.datum = $2;`,
                                                                            [id, datum], function (err, result){
                                                                                done();
                                                                                if(err){
                                                                                    console.log(err);
                                                                                    res.sendStatus(500);
                                                                                }
                                                                                else{
                                                                                    let apiKey = "***";
                                                                                    let mapa = result.rows;
                                                                                    res.render('resAdmin', {key: apiKey, username: username, data: podaci, ctg: kat, ord: order, dos: dos, mapa: JSON.stringify(mapa), otv: false});
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



router.post('/filter/map', auth.restaurantAuth, function(req, res, next) {
    const token = req.cookies.restoran;
    let username = " ";
    let id = 2;
    let grad;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        username = decodedToken.name;
        id = decodedToken.id;
        grad = decodedToken.city;
    });
    let dostavljacc = req.body.mapDost;
    console.log(dostavljacc);
    pool.connect(function (err, client, done){
        let podaci = { };
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`SELECT * FROM restoran WHERE id = $1;`,
            [id], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    podaci = result.rows;
                    pool.connect(function (err, client, done){
                        if(err){
                            res.end('{"error":"Error","status":500 }');
                        }
                        client.query(`SELECT * FROM kategorija_hrane_lkp WHERE aktivan = true;`,
                            [], function (err, result){
                                done();
                                if(err){
                                    console.log(err);
                                    res.sendStatus(500);
                                }
                                else{
                                    let kat = result.rows;
                                    pool.connect(function (err, client, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client.query(`SELECT * FROM orders WHERE dostavljac_id is null AND dostavljeno = false AND restoran_id = $1;`,
                                            [id], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    let order = result.rows;
                                                    pool.connect(function (err, client, done){
                                                        if(err){
                                                            res.end('{"error":"Error","status":500 }');
                                                        }
                                                        client.query(`SELECT * FROM dostavljac WHERE logovan = true AND aktivan = true AND grad = $1;`,
                                                            [grad], function (err, result){
                                                                done();
                                                                if(err){
                                                                    console.log(err);
                                                                    res.sendStatus(500);
                                                                }
                                                                else{
                                                                    let dos = result.rows;
                                                                    pool.connect(function (err, client, done) {
                                                                        let da = req.body.dan;
                                                                        console.log(da);
                                                                        let datum = da;
                                                                        if(da == 0) {
                                                                            da = new Date();
                                                                            datum = `${da.getUTCFullYear()}-${da.getUTCMonth() + 1}-${da.getUTCDate()}`;
                                                                        }//console.log(datum);
                                                                        if (err) {
                                                                            res.end('{"error":"Error","status":500 }');
                                                                        }
                                                                        if (dostavljacc == -1) {
                                                                            client.query(`select o.dostavljeno, o.placeno, d.ime, d.prezime, k.latituda, k.longituda from orders o
                                                                                        inner join korisnik k on k.id = o.korisnik_id
                                                                                        inner join dostavljac d on d.id = o.dostavljac_id
                                                                                        WHERE restoran_id = $1 and o.datum = $2;`,
                                                                                [id, datum], function (err, result) {
                                                                                    done();
                                                                                    if (err) {
                                                                                        console.log(err);
                                                                                        res.sendStatus(500);
                                                                                    } else {
                                                                                        let apiKey = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDpYkaWmLinGl0jEtfNru5zUwbSJ9zgpbg&callback=initMap&libraries=&v=weekly";
                                                                                        let mapa = result.rows;
                                                                                        console.log(mapa);
                                                                                        res.render('resAdmin', {
                                                                                            key: apiKey,
                                                                                            username: username,
                                                                                            data: podaci,
                                                                                            ctg: kat,
                                                                                            ord: order,
                                                                                            dos: dos,
                                                                                            mapa: JSON.stringify(mapa),
                                                                                            otv: true
                                                                                        });
                                                                                    }
                                                                                });
                                                                        }
                                                                        else {
                                                                            client.query(`select o.dostavljeno, o.placeno, d.ime, d.prezime, k.latituda, k.longituda from orders o
                                                                                        inner join korisnik k on k.id = o.korisnik_id
                                                                                        inner join dostavljac d on d.id = o.dostavljac_id
                                                                                        WHERE restoran_id = $1 and o.datum = $2 and o.dostavljac_id = $3;`,
                                                                                [id, datum, dostavljacc], function (err, result) {
                                                                                    done();
                                                                                    if (err) {
                                                                                        console.log(err);
                                                                                        res.sendStatus(500);
                                                                                    } else {
                                                                                        let apiKey = "";
                                                                                        let mapa = result.rows;
                                                                                        console.log(mapa);
                                                                                        res.render('resAdmin', {
                                                                                            key: apiKey,
                                                                                            username: username,
                                                                                            data: podaci,
                                                                                            ctg: kat,
                                                                                            ord: order,
                                                                                            dos: dos,
                                                                                            mapa: JSON.stringify(mapa),
                                                                                            otv: true
                                                                                        });
                                                                                    }
                                                                                });
                                                                        }
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
    let name = ' ';
    let data;
    if(req.files != null) {
        name = req.files.slika.name;
        data = req.files.slika.data;
    }
    else{
        data = '/images/default.jpg';
    }
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
        naziv.trim();
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
                    res.redirect('/restaurant/home');
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


router.post('/assign/order/:id/:dostavljac', auth.restaurantAuth, function(req, res, next) {
    let restID;
    const token = req.cookies.restoran;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        restID = decodedToken.id;
    });
    pool.connect(function (err, client, done){
        let dos = req.params.dostavljac;
        let ord = req.params.id;
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`UPDATE orders SET dostavljac_id = $1 WHERE id = $2;`,
            [dos, ord], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    console.log("dodano");
                }
            });
    });
});



router.post('/report', auth.restaurantAuth, function(req, res, next) {
    let restID;
    let email;
    const token = req.cookies.restoran;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        restID = decodedToken.id;
        email = decodedToken.email;
    });
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`select count(*) as br from orders where restoran_id = $1 and datum = $2;`,
            [restID, new Date()], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    let ordToday = result.rows;
                    pool.connect(function (err, client, done){
                        if(err){
                            res.end('{"error":"Error","status":500 }');
                        }
                        client.query(`select count(*) as br from orders where restoran_id = $1 and extract(month from datum) = $2;`,
                            [restID, new Date().getMonth()+1], function (err, result){
                                done();
                                if(err){
                                    console.log(err);
                                    res.sendStatus(500);
                                }
                                else{
                                    let ordMonth = result.rows;
                                    console.log(ordMonth[0].br);
                                    pool.connect(function (err, client, done){
                                        if(err){
                                            res.end('{"error":"Error","status":500 }');
                                        }
                                        client.query(`select o.dostavljac_id, d.prezime, count(*) as "orders taken" from orders o inner join dostavljac d on d.id = o.dostavljac_id 
                                        where o.restoran_id = $1 and o.dostavljac_id is not null group by o.dostavljac_id, d.prezime;`,
                                            [restID], function (err, result){
                                                done();
                                                if(err){
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }
                                                else{
                                                    mainMail(email, ordToday[0].br, ordMonth[0].br, result.rows);
                                                    res.redirect('/restaurant/home');
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



router.post('/auto_assign', auth.restaurantAuth, function(req, res, next) {
    let restID;
    let grad;
    const token = req.cookies.restoran;
    jwt.verify(token, 'ibro super sicret', (err, decodedToken) => {
        restID = decodedToken.id;
        grad = decodedToken.city;
    });
    pool.connect(function (err, client, done){
        if(err){
            res.end('{"error":"Error","status":500 }');
        }
        client.query(`select id from orders where restoran_id = $1 and dostavljac_id is null;`,
            [restID], function (err, result){
                done();
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                }
                else{
                    let prazno = result.rows;
                    pool.connect(function (err, client, done){
                        if(err){
                            res.end('{"error":"Error","status":500 }');
                        }
                        client.query(`select id from dostavljac where aktivan = true and logovan = true and grad = $1;`,
                            [grad], function (err, result){
                                done();
                                if(err){
                                    console.log(err);
                                    res.sendStatus(500);
                                }
                                else{
                                    let dost = result.rows;
                                    let a = dost.length;
                                    for(let i = 0; i<prazno.length; i++) {
                                        pool.connect(function (err, client, done){
                                            if(err){
                                                res.end('{"error":"Error","status":500 }');
                                            }
                                            client.query(`UPDATE orders SET dostavljac_id = $1 WHERE id = $2;`,
                                                [dost[i%a].id, prazno[i].id], function (err, result){
                                                    done();
                                                    if(err){
                                                        console.log(err);
                                                        res.sendStatus(500);
                                                    }
                                                    else{
                                                        console.log("dodano");
                                                        //client.end();
                                                        //pool.end();
                                                        if(i == prazno.length-1)
                                                            res.redirect('/restaurant/home');
                                                    }
                                                });
                                        });
                                    }
                                }
                            });
                    });
                }
            });
    });
});





module.exports = router;
