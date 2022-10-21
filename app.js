const express = require("express");
const path = require("path");
var mongoose = require('mongoose');
var config = require('./config/database');
var mongodb = require("mongodb");
var session = require("express-session")
var expressValidator = require("express-validator")
var morgan = require("morgan")
var fileUpload = require('express-fileupload')

//init the app
app = express();

//connect to database
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'new connection error:'));
db.once('open', function(){
    console.log('connected to mongodb')
});

// View engine setup
app.set('views', path.join(__dirname,'views')); //views folder
app.set('view engine', 'ejs');

//set the public folder to use static files
app.use(express.static(path.join(__dirname, 'public')));

//Set global errors Variable
app.locals.errors = null;

//express fileupload midddleware
app.use(fileUpload({
    createParentPath: true,
}));

//express body parser middleware
//parse application /x-www-form-urlencoded
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Morgan middleware
app.use(morgan('tiny'))

//Express session middleware
app.use(session({
    secret: "Secret", 
    resave:true,
    saveUninitialized:true,
   // cookie: { secure : true}
}))

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter : function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
        },
        customValidators: {
            isImage: function(value, filename){
                var extension = (path.extname(filename)).toLowerCase();
                switch(extension){
                    case '.jpg':
                        return '.jpg';
                    case '.jpeg':
                        return '.jpeg';
                    case '.png':
                        return '.png';
                    case '.jpg':
                        return '.jpg';
                    case '.jfif':
                        return '.jfif';
                    default:
                        return false;
                }
            }
        }
}))
//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req,res, next) {
    res.locals.messages = require("express-messages")(req,res);
    next();
})

//seting routes
var pages = require('./routes/pages.js')
var adminPages = require('./routes/admin_pages.js')
var adminCategories = require('./routes/admin_categories.js')
var adminProducts = require('./routes/admin_products.js')

app.use('/', pages);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);

//start the server
var port = 3000
app.listen(port, function(){
    console.log(`sever is working on port ${port}`)
})

