const express = require('express');
const router = express.Router();

/*
const Blockchain = require("../blockchain/BlockChain");
let blockchain = new Blockchain.Blockchain();
*/
let blockchain = require("../singleton/BlockChain");
let display = require("../blockchain/displayBlock");

function isEmptyObject(obj){
    return (Object.getOwnPropertyNames(obj).length === 0);
  }

router.get("/hash::hash", async (req, res)=>{
    const hash = req.params.hash.slice(0);
    let block = {};
    try {
        let result = await blockchain.getBlockByHash(hash);
        if (isEmptyObject(block)) return res.status(404).send({"Message":`Block with hash-${hash} was not found`});
        else return res.status(200).send( display(result));
    } catch(err) {
        console.log(err);
    }
});

router.get("/address::address", (req, res)=>{
    const address = req.params.address.slice(0);
    let blocks = [];
    blockchain.getBlockByAddress(address).then((result)=>{
        //blocks = result.map((block)=>display(block));
        blocks = result.filter((block)=>isEmptyObject(block));
        if (blocks.length==0) return res.status(404).send({"Message":`Block with address-${address} was not found`})
        else return res.status(200).send(blocks.map((block)=>display(block)));
    })
})

module.exports = router;