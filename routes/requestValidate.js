const express = require('express');
const router = express.Router();

const Joi = require('joi');

//const memPool = global.memPool;
let memPool = require("../singleton/MemPool");

function validateRequest(request) {
    const schema = {
        address:Joi.string().required()
    }
    return Joi.validate(request, schema);
}

router.post('/', (req, res)=>{
    const { err } = validateRequest(req.body);
    if (err) {
        return res.status(400).send(err.details[0])
    } else {
        const address = req.body.address;
        return res.status(201).send(memPool.addRequestValidation(address));
    }
});

module.exports = router;