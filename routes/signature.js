const express = require('express');
const router = express.Router();

const Joi = require('joi');

//const memPool = global.memPool;
let memPool = require("../singleton/MemPool");

function validateRequest(request) {
    const schema = {
        address:Joi.string().required(),
        signature:Joi.string().required()
    }
    return Joi.validate(request, schema);
}

function isEmptyObject(obj){
    return (Object.getOwnPropertyNames(obj).length === 0);
  }

router.post('/', (req, res)=>{
    const { err } = validateRequest(req.body);
    if (err) return res.status(400).send(err.details[0]);
    const address = req.body.address;
    const signature = req.body.signature;
    let validateRresult = memPool.validateRequestByWallet(address, signature)
    if (isEmptyObject(validateRresult)) {
        return res.status(404).send({Message:`Address-${address} not found`});
    } else {
        return res.status(200).send(validateRresult);
    }
});

module.exports = router;