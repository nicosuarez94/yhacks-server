var http = require('http'),
    express = require('express'),
    path = require('path'),
    braintree = require('braintree');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "2czxrzx8q7s5sp22",
  publicKey: "52kd7hx3pd9cbh7x",
  privateKey: "e617a7c608395a1ad7f1e75a7efe2c16"
});

var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
    // Create your schemas and models here.
});

mongoose.connect('mongodb://yhacks:secret123@ds051524.mongolab.com:51524/yhack');

var userSchema = new mongoose.Schema({
    fbId: { type: String },
    paypalId: String
});
var Users = mongoose.model('Users', userSchema);

var goalSchema = new mongoose.Schema({
    fbId: { type: String },
    goalName: String,
    goalDescription: String,
    goalDate: String
});
var Goals = mongoose.model('Goals', goalSchema);

var charitySchema = new mongoose.Schema({
    fbId: { type: String },
    charity: String
});

var Charity = mongoose.model('charity', charitySchema);

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views')); //A
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/user', function (req, res) {
    var q = req.body;

    var user = new Users({
        fbId: q.fbId,
        paypalId: q.paypalId
    });

    user.save(function(err, awns) {
        if (err){
            res.status(500);
            console.error(err);
            res.send();
            return;
        } else {
            res.status(200);
            res.send(awns)
        }
         console.dir(err);
    });
});

app.get('/user', function (req, res) {
    var q = req.query;

    Users.findOne({ fbId: q.fbId }, function(err, awns) {
        if (err){
            res.status(500);
            console.error(err);
            res.send();
            return;
        } else {
            res.send(awns);
        }
        console.dir(awns);
    });

});

app.post('/charityUser', function (req, res) {
    var q = req.body;

    var charity = new Charity({
        fbId: q.fbId,
        charity: q.charity
    });

    charity.save(function(err, awns) {
        if (err){
            res.status(500);
            console.error(err);
            res.send();
            return;
        } else {
            res.status(200);
            res.send(awns)
        }
        console.dir(err);
    });
});

app.get('/charityUser', function (req, res) {
    var q = req.query;

    Charity.find({ fbId: q.fbId }, function(err, awns) {
        if (err){
            res.status(500);
            console.error(err);
            res.send();
            return;
        } else {
            res.send(awns);
        }
        console.dir(awns);
    });

});



app.post('/goals', function (req, res) {
    var q = req.body;

    var goal = new Goals({
        fbId: q.fbId,
        goalName: q.goalName,
        goalDescription: q.goalDescription,
        goalDate: q.goalDate
    });

    goal.save(function(err, awns) {
        if (err){
            res.status(500);
            console.error(err);
            res.send();
            return;
        } else {
            res.status(200);
            res.send(awns)
        }
        console.dir(err);
    });
});

app.get('/goals', function (req, res) {
    var q = req.query;

    Goals.findOne({ _id: q._id }, function(err, awns) {
        if (err){
            res.status(500);
            console.error(err);
            res.send();
            return;
        } else {
            res.send(awns);
        }
        console.dir(awns);
    });

});

app.get('/userGoals', function (req, res) {
    var q = req.query;

    Goals.find({ fbId: q.fbId }, function(err, awns) {
        if (err){
            res.status(500);
            console.error(err);
            res.send();
            return;
        } else {
            res.send(awns);
        }
        console.dir(awns);
    });

});

app.get("/client_token", function (req, res) {
  console.log('recieved get request!');
  gateway.clientToken.generate({}, function (err, response) {
    res.send(response.clientToken);
  });
});

app.post("/create_customer", function (req, res) {
  var nonceFromTheClient = req.body.payment_method_nonce;

  gateway.customer.create({
    //TODO: should we add name?
    firstName: "Charity",
    lastName: "Smith",
    paymentMethodNonce: nonceFromTheClient
  }, function (err, result) {
    if (result.success) {
      res.send(result.customer.id);
      // e.g 160923
    }
    //result.customer.paymentMethods[0].token;
    // e.g f28wm
  });
});

app.post("/make_sale", function (req, res) {
  var theCustomerId = req.body.customer_payment_id;
  
  gateway.transaction.sale({
    customerId: theCustomerId,
    merchantId: merchantId,
    amount: "1.5"
  }, function (err, result) {
    if (err) {
	console.log("didn't work :/" + err);
    } else {
        console.log("success" + result);
    }
  });
});

app.get('/', function (req, res) {

    res.send('<html><body><h1>Hello World</h1></body></html>');
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
