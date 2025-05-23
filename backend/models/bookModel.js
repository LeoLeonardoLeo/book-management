const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            default: "N/A"
        },
        author: {
            type: String,
            required: true,
            default: "N/A"
        },
        yearPublished: {
            type: String, //set to string bc I want default to be N/A
            required: true,
            default: "N/A"
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        genre: {
            type: [String], //array of strings since books can have multple genres,
            //also no required in case there isn't a genre
            default: ["N/A"]
        },
        borrowedBy: [{ type: String }]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Book", bookSchema)