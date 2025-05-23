const express = require("express")
const router = express.Router()
const Book = require('../models/bookModel')
const { verifyToken, isAdmin } = require("../middleware/authMiddleware")

//creating a book
//ADMIN ONLY
//http://localhost:3000/api/books/books
router.post("/books", verifyToken, isAdmin, async (req, res) => {
    try{
        const { title, author, yearPublished, quantity, genre } = req.body

        if (!title || !author || !yearPublished) {
            return res.status(400).send({ message: "Title, author and yearPublished are required" })
        }

        const newBook = await Book.create({
            title, author, yearPublished, quantity, genre
        })

        res.status(201).json(newBook)
    
    }
    catch(error){
        console.log(error.message)
        res.status(500).send({ message: error.message })
    }
})

//get all books from db
//http://localhost:3000/api/books/all-books
router.get('/all-books', async (req, res) => {
    try{
        const books = await Book.find({})

        return res.status(200).json(books)
    }
    catch (error){
        console.log(error.message)
        res.status(500).send({ message: error.message})
    }
})

//get by title
//http://localhost:3000/api/books/search?title=xxxxxxxxx
router.get('/search', async (req, res) => {
  try {
    const { title } = req.query

        if (!title) {
            return res.status(400).json({ message: "Title is required" })
        }
        //allows for semi matches
        const books = await Book.find({ title: { $regex: title, $options: 'i' } })

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found with the title", title })
        }

        return res.status(200).json(books)
  } 
  catch (error) {
    console.log(error.message)
    return res.status(500).json({ error: "Server error" });
  }
});

//update by id
//http://localhost:3000/api/books/update-book/xxxx
//ADMIN ONLY
router.put('/update-book/:id', verifyToken, isAdmin, async (req, res) => {
  try{
    //if the params are empty then sends a message
    if (!req.body.title || !req.body.author || !req.body.yearPublished || !req.body.quantity || !req.body.genre){
      return res.status(400).send({ message: "All fields must be filled"})
    }
    
    //using the built in thing, we can use findByIdAndUpdate by the specific id
    const { id } = req.params
    const result = await Book.findByIdAndUpdate(id, req.body)

    if (!result){
      return res.status(404).json({ message: "Book not found"})
    }
    
    return res.status(200).send({ message: "Book updated successfully" })
  }
  catch (error){
    console.log(error.message)
    res.status(500).send({ message: error.message })
  }
})

//delete by id
//http://localhost:3000/api/books/delete-book/xxxxx
//ADMIN ONLY
router.delete('/delete-book/:id', verifyToken, isAdmin, async (req, res) => {
   try{
    const { id } = req.params
    const result = await Book.findByIdAndDelete(id)

    if (!result){
      return res.status(404).sendFile({ message: "Book not found"})
    }

    return res.status(200).send({ message: "Book deleted successfully" })
  }

  catch (error){
    console.log(error.message)
    res.status(500).send({ message: error.message })
  }
})

//borrow book 
//must be logged in as user
//http://localhost:3000/api/books/borrow/xxxxxx
router.post('/borrow/:id', verifyToken, async (req, res) => {
  try{
    const { id } = req.params
    const userEmail = req.user.email

    const book = await Book.findById(id)

    if (!book){
      return res.status(404).json({ message: "Book not found" })
    }

    if (book.quantity <= 0){
      return res.status(400).json({ message: "No copies of book available" })
    }

    book.quantity -= 1
    book.borrowedBy.push(userEmail) //pushes the userEmail into borrowedBy array in bookModel
    await book.save() //save to db

    return res.status(200).json({message: `${book.title} borrowed successfully`})
  }
  catch (error){
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
})

//http://localhost:3000/api/books/return/xxxxxxx
router.post('/return/:id', verifyToken, async (req, res) => {
  try{
    const { id } = req.params
    const userEmail = req.user.email

    const book = await Book.findById(id)

    if(!book){
      return res.status(404).json({ message: "Book not found" })
    }

    if(!book.borrowedBy.includes(userEmail)){
      return res.status(400).json({ message: "You have not borrowed this book" })
    }
    
    //removes book from email
    book.borrowedBy = book.borrowedBy.filter(email => email !== userEmail)
    book.quantity +=1
    await book.save()

    return res.status(200).json({ message: `${book.title} returned successfully`})

  }
  catch (error){
    console.log(error.message)
    res.status(500).json({message: "server error"})
  }
})

module.exports = router
