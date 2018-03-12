const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');


const app = express();
const apiRouter = require('./api/api.js');
const PORT = (process.env.PORT || 4000);

// body Parser + cors modules
app.use(bodyParser.json());
app.use(cors());
// employees route
app.use('/api', apiRouter);


// app.use errorhandler avant ecoute sur les requetes http
app.use(errorhandler());

app.listen(PORT, err => {
    if (err){
        throw err;
    }
    else {
        console.log(`Le serveur ecoute sur le port ${PORT}`);
    }
});

module.exports= app;