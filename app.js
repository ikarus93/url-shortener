const express = require('express'),
    app = express(),
    path = require('path'),
    routes = require('./routes');
    

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(routes);

app.use((err, req, res, next) => {
    res.status(err.status);
    res.send(`Error: ${err.status}, ${err.message}`)
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port");
})
