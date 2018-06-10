const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const MoviesSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    genre:{
        type: String,
        required: true
    },
    year:{
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Text index
MoviesSchema.index({
    title: 'text',
    year: 'text'
}, {
    weights: {
        name: 5,
        year: 1,
    },
});

// Number index
// MoviesSchema.index({
//     year: 'text'
// }, {
//     weights: {
//         name: 5,
//         year: 1,
//     },
// });

mongoose.model('movies', MoviesSchema);
