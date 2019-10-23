const express = require('express');
const bodyParser = require('body-parser');

/* express instance */
const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const PORT = 8000;

const requestValidate = require('./routes/requestValidate');
app.use("/requestValidation", requestValidate);

const signature = require('./routes/signature');
app.use("/message-signature/validate", signature);

const sendBlock = require('./routes/sendBlock');
app.use("/block", sendBlock);

const getBlock = require('./routes/getBlock');
app.use("/stars", getBlock);

app.listen(PORT, ()=>{console.log(`Start to listen on port ${PORT}`)});