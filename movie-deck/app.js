const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const querymen = require('querymen');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const mongoose = require('mongoose');
//comment
const app = express();

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect('mongodb://localhost/movie-deck',
// {useMongoClient: true}
)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// Load Movie Model
require('./models/Movie');
const Movie = mongoose.model('movies');

// handlebars-Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json

// override with POST having ? method-DELETE - Middleware
app.use(methodOverride('_method'));

// Express session Middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Flash Middleware
app.use(flash());

// Global Variables - Messages
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('console.error_msg');
    // res.locals.error = req.flash('error');
    next();
});

// ********************************

// Index - Route
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
        title: title
    });
});

// about - Route
app.get('/about', (req, res) => {
    res.render('about');
});

// Add a Movie - Form Route
app.get('/movies/add', (req, res) => {
    res.render('movies/add');
});

// Process movie Form - Route
app.post('/movies/add', (req, res) => {
    // form validation
    let errors = [];
    if(!req.body.title){
        errors.push({text:'Please add a movie title'});
    }
    if(!req.body.year){
        errors.push({number:'Please add movie realese year'});
    }
    if(!req.body.genre){
        errors.push({text:'Please add movie genre'});
    }
    if(!req.body.description){
        errors.push({text:'Please add movie description'});
    }

    if(errors.length > 0){
        res.render('movies/add', {
            errors: errors,
            title: req.body.title,
            year: req.body.year,
            genre: req.body.genre,
            description: req.body.description
        });
        // Save information database
    } else {
        const newMovie = {
            title: req.body.title,
            year: req.body.year,
            genre: req.body.genre,
            description: req.body.description
        }
        // create a new movie with our "Movie" schema
        new Movie(newMovie)
        .save()
        .then(movie => {
            // flash Msg
            req.flash('success_msg', 'Movie has been added')
            res.redirect('/movies');
        })
    }
});

// Edit Movie Form - Route
app.get('/movies/edit/:id', (req, res) => {
    Movie.findOne({
        _id: req.params.id
    }).then(movie => {
        res.render('movies/edit', {
            movie:movie
        });
    });
});

// Edit Form process
app.put('/movies/:id', (req, res) => {
    Movie.findOne({
    _id: req.params.id
    }).
    then(movie => {
        // new values
        movie.title = req.body.title;
        movie.year = req.body.year;
        movie.genre = req.body.genre;
        movie.description = req.body.description;

        movie.save()
            .then(movie => {
                // flash msg
                req.flash('success_msg', 'Movie info has been updated')
                res.redirect('/movies');
            })
    });
});


// Movies - Route - all
app.get('/movies', (req, res) => {
    Movie.find({})
    .sort({date:'desc'})
    .then(movies => {
        res.render('movies/index', {
            movies:movies
        });
    });
});

// Search route - change route (***************same as serch*************)
app.post('/movies', urlencodedParser, (req, res) => {
    const input = req.body.search;
    console.log(input);
    console.log(typeof input);
    // number convertion
    // const num = parseInt(input);
    // console.log(typeof num);

    Movie.find({
        $text: { $search: input}
        // $year: { $search: input}
    })
    .then(movies => {
        console.log({movies:movies});
        res.render('movies/index', {
            movies:movies
        });
    });
});

// filter category
app.get('/movies/:genre', (req, res) => {
    Movie.find({
        genre: req.params.genre
    })
    .then(movies => {
        res.render('movies/index', {
            movies:movies
        });
    });
});


// Delete-Movie - Route
app.delete('/movies/:id', (req, res) => {
    Movie.remove({_id: req.params.id})
        .then(() => {
            // flash msg
            req.flash('success_msg', 'Movie has been removed')
            res.redirect('/movies')
        });


});

// ****************************************

// Register - Route
app.get('/register', (req, res) => {
    res.send('Register')
})

// LogIn - Route
app.get('/login', (req, res) => {
    res.send('LOGIN')
})


// *****************************************





// *****************************************

const port = 5000;

app.listen(port, () => {
console.log(`Server is listening on port ${port}`);
});
