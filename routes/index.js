var express = require('express'),
    bodyParser = require('body-parser');
var cors = require('cors');
var request=require('request');
var router = express.Router();
var nonRep = require('./nonRepudiation');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
var app = express();


var bigInt = require("big-integer");
var p=bigInt.zero;
var q=bigInt.zero;
var n=bigInt.zero;
var d=bigInt.zero;
var e= bigInt(65537);
var sharedKey = 0;
var data = 0;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin",  "*");
    res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', "Content-Type, Authorization, Content-Length, X-Requested-With,X-Custom-Header,Origin");
    res.header('Access-Control-Allow-Credentials',"true");
    next();
});

function genNRSA() {

    console.log("Calculadas claves privada y publica");

    var base=bigInt(2);
    var prime=false;

    while (!prime) {
        p = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
        prime = bigInt(p).isPrime()

    }
    prime = false;
    while (!prime) {
        q = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
        prime = bigInt(q).isPrime()
    }
    var phi = p.subtract(1).multiply(q.subtract(1));
    n = p.multiply(q);
    d = e.modInv(phi);

};


app.post('/repudiationThirdPart',function (req,res) {

    nonRep.checkPayloadTTP(req.body.origin,req.body.destination,req.body.thirdpart,req.body.key,req.body.modulus,req.body.publicE,req.body.signature,function (buff) {

        if (buff === 1){

            nonRep.shareKey(req.body.origin,req.body.destination,req.body.thirdpart,d,n,e,req.body.key,function (buff2) {

                data = buff2;
                sharedKey = buff2.key;
                res.send(data);


            });
        }
        else {
            res.send("ERROR")
        }
    });
});

app.get('/getKey',function (req,res) {

    if((sharedKey==0)&&(data==0)){
        console.log("Que clave? Io no sabo");
        res.send("0")
    }
    else{
        console.log("La tengo!");
        res.send(data);
    }

});

app.listen(3600, function () {

    genNRSA();
    console.log('App listening on port 3600!!')
});
module.exports = router;
// Retrieve
