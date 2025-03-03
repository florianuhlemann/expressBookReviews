const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if a user with the given username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Authenticate user login
const authenticatedUser = async (username, password) => {
    let user = users.find(user => user.username === username);
    if (user) {
        return await bcrypt.compare(password, user.password);
    }
    return false;
};

// Register a new user with hashed password
regd_users.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    return res.status(201).json({ message: "User successfully registered. You can now log in." });
});

// Only registered users can login
regd_users.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (await authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password." });
    }
});

// Logout user
regd_users.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Logout failed." });
        }
        return res.status(200).json({ message: "Logout successful." });
    });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn.replace(/-/g, '');
    const review = req.query.review;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not authenticated." });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    let foundBook = Object.values(books).find(book => book.ISBN.replace(/-/g, '') === isbn);

    if (!foundBook) {
        return res.status(404).json({ message: "No book found with this ISBN." });
    }

    foundBook.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        book: foundBook.title,
        review,
        user: username
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn.replace(/-/g, '');
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not authenticated." });
    }

    let foundBook = Object.values(books).find(book => book.ISBN.replace(/-/g, '') === isbn);

    if (!foundBook) {
        return res.status(404).json({ message: "No book found with this ISBN." });
    }

    // Check if the user has a review for this book
    if (!foundBook.reviews[username]) {
        return res.status(404).json({ message: "No review found from this user to delete." });
    }

    // Delete the user's review
    delete foundBook.reviews[username];

    return res.status(200).json({
        message: "Your review has been deleted successfully.",
        book: foundBook.title
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


