var express = require('express'),
    bodyParser = require('body-parser');
var cors = require('cors');
var request=require('request');
var router = express.Router();
var CryptoJS= require('crypto-js/sha256');
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

        var buffS;
        /////////
        var origin=req.body.origin;
        var destination=req.body.destination;
        var thirdpart=req.body.thirdpart;
         sharedKey=req.body.key;
        var modulus= bigInt(req.body.modulus);
        var publicE=req.body.publicE;
        /////////
        var sigmessage=bigInt(req.body.signature);
        var signature=sigmessage.modPow(publicE,modulus);
        buffS=Buffer.from(signature.toString(16),'hex').toString();
        //////////
        var string=origin+"."+thirdpart+"."+destination+"."+sharedKey;
        var hash=CryptoJS(string);

        if(hash==buffS){

            string=thirdpart+"."+origin+"."+destination+"."+sharedKey;
            hash=CryptoJS(string);
            var buff=Buffer.from(hash.toString(),'utf8');
            var message=bigInt(buff.toString('hex'),16);
            var enmessage=message.modPow(d,n);
            data = {
                thirdpart:thirdpart,
                origin:origin,
                destination:destination,
                key:req.body.key,
                signature: enmessage,
                modulusTTP:n,
                TTPE:e
            };
            console.log("colgando la clave para A y B")
                res.send(data);
        }
        else {
            res.send("ERROR")
        }

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
