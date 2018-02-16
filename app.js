const express = require('express'),
    app = express(),
    db = require('./database/connection'),
    path = require('path');
    

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.get("/", (req, res) => {
    res.render('index');
})

app.get("/new/*", (req, res) => {
    
    if( db.verifyUrl(req.params[0])) {
        db.create(req.params[0], (err, result) => {
            if (err) return res.send(err);
            res.send(`Access ${result.baseUrl} at https://slice-that-url.herokuapps.com/r/${result.shortUrl}`)
        }); 
    } else {
        res.send(`${req.params[0]} is not a valid Url! Please try again`);
    }
});

app.get("/r/:url", (req, res) => {
    db.redirect(req.params.url, (err, result) => {
        if (err) return res.send(err);
        if (result) {
            res.redirect(result.baseUrl);
        } else {
            res.send(`Url not found. Are you sure ${req.params.url} is the right identifier?`)
        }
        
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port");
})
