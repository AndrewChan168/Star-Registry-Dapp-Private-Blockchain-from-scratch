const express = require('express');
const router = express.Router();

const Joi = require('joi');


const Block = require("../blockchain/Block");
let memPool = require("../singleton/MemPool");
let blockchain = require("../singleton/BlockChain");
let displayBlock = require("../blockchain/displayBlock");

function validateRequest(request) {
    const schema = {
        address:Joi.string().required(),
        star:Joi.object({
            dec:Joi.string().required(),
            ra:Joi.string().required(),
            story:Joi.string().max(256).required(),
        }).required()
    }
    return Joi.validate(request, schema);
}

router.get('/:height', async (req,res)=>{
    const height = parseInt(req.params.height);
    if (height===0) return res.status(401).send({Message:"Block with height 0 is then Genesis Block which is not star story."});
    const blockheight = await blockchain.getBlockHeight();
    if (height>blockheight) return res.status(401).send({Message:"Input height is longer than blockchain height"});
    const resultBlock = await blockchain.getBlock(height);
    return res.status(200).send(displayBlock(JSON.parse(resultBlock)));
})

router.post('/', (req, res)=>{
    const { err } = validateRequest(req.body);
    if (err) return res.status(400).send(err.details[0]);
    const address = req.body.address;
    if (!memPool.checkRequestInValidPool(address)) return res.status(401).send({message:"Addess is not validated"})
    const star = req.body.star;
    let data = {
        address:address, 
        star:{
            ra:star.ra,
            dec:star.dec,
            story:Buffer(star.story).toString('hex')
        }
    };
    let newBlock = new Block(data);
    memPool.removeAddressFromMempoolValid(address);
    blockchain.addBlock(newBlock)
        .then((resultBlock)=>res.status(201).send(resultBlock));
});

module.exports = router;