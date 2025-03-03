const express = require('express');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");

const public_users = express.Router();



/**
 * Get the full book list
 */
public_users.get('/', (req, res) => {
    return res.status(200).json(books);
});

/**
 * Get book details based on ISBN
 */
public_users.get('/isbn/:isbn', (req, res) => {
    const requestedIsbn = req.params.isbn.replace(/-/g, '');
    
    const foundBook = Object.values(books).find(book => 
        book.ISBN?.replace(/-/g, '') === requestedIsbn
    );

    return foundBook 
        ? res.status(200).json(foundBook) 
        : res.status(404).json({ message: "No book found with this ISBN." });
});

/**
 * Get book details based on author
 */
public_users.get('/author/:author', (req, res) => {
    const authorBooks = Object.values(books).filter(book => 
        book.author.toLowerCase() === req.params.author.toLowerCase()
    );

    return authorBooks.length 
        ? res.status(200).json(authorBooks) 
        : res.status(404).json({ message: "No books found by this author." });
});

/**
 * Get book details based on title
 */
public_users.get('/title/:title', (req, res) => {
    const titleBooks = Object.values(books).filter(book => 
        book.title.toLowerCase() === req.params.title.toLowerCase()
    );

    return titleBooks.length 
        ? res.status(200).json(titleBooks) 
        : res.status(404).json({ message: "No books found with this title." });
});

module.exports.general = public_users;
