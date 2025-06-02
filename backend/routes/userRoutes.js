const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("../models/userModel")

router.post("/signup", async (req, res) => {
    try{
        const { username, email, password, role } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser){
            return res.status(400).json({ message: "Email already in use"})
        }

        const hashedPword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            username, 
            email, 
            password: hashedPword, 
            role: "user" //forces only user, no more admin
        })

        res.status(201).json({ message: `User ${newUser.username} created` })
    }
    catch (error){
        res.status(500).json({ message: error.message })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body 

        const user = await User.findOne({ email })
        if(!user){
            return res.status(404).json({ message: "Account not found" })
        }

        const validPass = await bcrypt.compare(password, user.password)
        if(!validPass){
            return res.status(401).json({ message: "Invalid login credentials "})
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h"}
        )

        res.json({ token })
    }
    catch (error){
        res.status(500).json({ message: error.message })
    }
        
})

module.exports = router