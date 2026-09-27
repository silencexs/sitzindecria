const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Path to the site files
const sitePath = path.join(__dirname, 'pcesp.duckdns.org');

// Middleware to serve static files
app.use(express.static(sitePath));

// Handle root request - redirect to login page (the entry point)
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Handle /login routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(sitePath, 'login.html'));
});

// Graceful fallback for any missing file or API requests to login.html
// This ensures that backend auth session routes or missing pages don't crash
app.get('*', (req, res) => {
    // If it looks like an API or backend auth request, redirect to login
    if (req.url.startsWith('/api') || req.url.startsWith('/auth')) {
        res.redirect('/login.html');
    } else {
        // We'll map missing routes to their HTML equivalents if possible, otherwise login
        const slug = req.url.split('?')[0].replace(/^\//, '');
        const possibleHtml = path.join(sitePath, slug + '.html');
        
        res.sendFile(possibleHtml, (err) => {
            if (err) {
                res.sendFile(path.join(sitePath, 'login.html'));
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
