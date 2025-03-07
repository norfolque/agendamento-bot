// filepath: /home/erick-thinkpad/Documentos/Códigos/testes/app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflowRoutes = require('./routes/dialogflowRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Middleware
const corsOptions = {
    origin: '*', 
    methods: 'GET',
    allowedHeaders: 'Content-Type,Authorization,ngrok-skip-browser-warning'
};

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.use(dialogflowRoutes);
app.use('/api', apiRoutes);

// Inicia o servidor
const listener = app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log("Your app is listening on port " + listener.address().port);
});