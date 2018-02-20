const express = require('express'),
    app = express(),
    db = require('./database/connection'),
    path = require('path');
    

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.get("/", (req, res) => {
    res.render('index');
})

app.get("/new/*", (req, res, next) => {
    
    if( db.verifyUrl(req.params[0])) {
        db.create(req.params[0], (err, result) => {
            if (err) {
                let err = new Error('Database Error');
                err.status = 500;
                next(err);
            }
            res.send(`Access ${result.baseUrl} at https://slice-that-url.herokuapps.com/r/${result.shortUrl}`)
        }); 
    } else {
        let err = new Error(`${req.params[0]} is not a valid Url! Please try again`);
        err.status = 400;
        next(err);
        
    }
});

app.get("/r/:url", (req, res, next) => {
    db.redirect(req.params.url, (err, result) => {
        if (err) {
            let err = new Error('Database Error');
            err.status = 500;
            next(err);
        }
        if (result) {
            res.redirect(result.baseUrl);
        } else {
            let err = new Error(`Url not found. Are you sure ${req.params.url} is the right identifier?`)
            err.status = 412;
            next(err);
        }
        
    })
})

app.use((err, req, res, next) => {
    res.status(err.status);
    res.send(`Error: ${err.status}, ${err.message}`)
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port");
})
