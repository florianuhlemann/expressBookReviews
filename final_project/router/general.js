const express = require('express');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");

const public_users = express.Router();



/**
 * Get the full book list
 */
public_users.get('/', async (req, res) => {
    try {
        // Simulate an asynchronous operation, such as database retrieval or a complex calculation
        const booksData = await new Promise((resolve) => {
            setTimeout(() => {
                resolve(books); // Return the books object after a delay
            }, 100); // Simulate a small delay (you can adjust or remove this)
        });

        return res.status(200).json(booksData);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books data" });
    }
});

/**
 * Get book details based on ISBN
 */
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const requestedIsbn = req.params.isbn.replace(/-/g, '');
        
        // Simulate asynchronous behavior
        const foundBook = await new Promise((resolve, reject) => {
            const book = Object.values(books).find(book => 
                book.ISBN?.replace(/-/g, '') === requestedIsbn
            );
            
            if (book) {
                resolve(book);
            } else {
                reject(new Error("No book found with this ISBN."));
            }
        });

        return res.status(200).json(foundBook);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

/**
 * Get book details based on author
 */
public_users.get('/author/:author', async (req, res) => {
    try {
        // Simulate asynchronous behavior
        const authorBooks = await new Promise((resolve, reject) => {
            const booksByAuthor = Object.values(books).filter(book => 
                book.author.toLowerCase() === req.params.author.toLowerCase()
            );
            
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject(new Error("No books found by this author."));
            }
        });

        return res.status(200).json(authorBooks);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

/**
 * Get book details based on title
 */
public_users.get('/title/:title', async (req, res) => {
    try {
        // Simulate asynchronous behavior
        const titleBooks = await new Promise((resolve, reject) => {
            const booksByTitle = Object.values(books).filter(book => 
                book.title.toLowerCase() === req.params.title.toLowerCase()
            );
            
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject(new Error("No books found with this title."));
            }
        });

        return res.status(200).json(titleBooks);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

module.exports.general = public_users;
