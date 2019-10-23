/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');


class Blockchain {

    constructor() {
        this.bd = new LevelSandbox();
        //this.length = 0;
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        // Add your code here
        const genesisBlock = new Block("The Genesis Block - 0");
        genesisBlock.hash = SHA256(genesisBlock.body).toString();
        this.bd.getBlocksCount().then((count)=>{
            if (count===0){
                console.log("Adding Genesis Block...")
                this.bd.addLevelDBData(genesisBlock.height, JSON.stringify(genesisBlock).toString())
            }else{
                console.log("Genesis Block has been added")
                this.bd.getLevelDBData(0)
            }
        }).catch((err)=>console.log(err));
    }

    // function added by myself
    async getNextBlockHeight(){
        try{
            const blocksCount = await this.bd.getBlocksCount();
            return blocksCount;
        } catch (err) {
            console.log(err);
        }
    }

    // Get block height, it is a helper method that return the height of the blockchain
    async getBlockHeight() {
        // Add your code here
        try{
            let blockCount = await this.getNextBlockHeight();
            return(blockCount-1) // excluding genesis block
        } catch(err) {
            //console.log(err);
            reject(err);
        }
    }

    // Add new block
    async addBlock(newBlock) {
        // Add your code here
        try{
            let nextBlockHeight = await this.getNextBlockHeight();
            let preBlockStr = await this.getBlock(nextBlockHeight-1);
            let preBlock = JSON.parse(preBlockStr);
            newBlock.height = nextBlockHeight;
            newBlock.previousHash = preBlock.hash;
            newBlock.hash = SHA256(newBlock.body).toString();
            let result = await this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
            return(JSON.parse(result));
        } catch(err) {
            console.log(err);
        }
    }

    parseBlock(block) {
        //if (block) return(JSON.parse(block));
        if (block) return(block);
        else return ({});
    }

    // Get Block By Height
    async getBlock(height) {
        try {
            return await this.bd.getLevelDBData(height);
        } catch (err) {
            console.log(err);
        }
    }

    // Get Block By Hash
    async getBlockByHash(hash) {
        console.log("getBlockByHash(hash):");
        try {
            let block = await this.bd.getBlockByHash(hash);
            let parsedBlock = this.parseBlock(block);
            console.log("parsedBlock:")
            console.log(parsedBlock);
            return(parsedBlock)
        } catch (err) {
            console.log(err);
        }
        return(blocks)
    }

    // Get Block By Address
    async getBlockByAddress(address) {
        try {
            let block = await this.bd.getBlockByAddress(address);
            let parsedBlock = this.parseBlock(block);
            return(parsedBlock);
        } catch (err) {
            console.log(err);
        }
    }

    // Validate if Block is being tampered by Block Height
    async validateBlock(height) {
        // Add your code here
        try {
            let block = await this.getBlock(height);
            return(block.hash === SHA256(block.body).toString())
        } catch (err) {
            console.log(err)
        }
    }

    // Validate Blockchain
    async validateChain() {
        // Add your code here
        // helper function for generating Promise
        const getNewErrorLogPromise = (errMessage)=>{
            return new Promise((resolve, reject)=>{
                if (errMessage) {
                    resolve(errMessage);
                } else {
                    reject("Error: Nothing passed to Error Message");
                }
            })
        }
        const validateBlock = (blockObj)=>{
            return(blockObj.hash === SHA256(blockObj.body).toString())
        }
        let errors = [];
        let leadBlock;
        let lagBlock;
        let chainCount = await this.getNextBlockHeight();
        // validate genesis block
        const genesisBlock = await this.getBlock(0);
        if (validateBlock(genesisBlock)){
            leadBlock = genesisBlock;
        } else {
            errors.push(getNewErrorLogPromise(`Error: Hash value and data are not matched in Block - 0`))
        }
        for (let i=1;i<chainCount;i++){
            lagBlock = await this.getBlock(i);
            if (leadBlock.hash===lagBlock.previousHash){
                console.log(`Info: Block - ${i-1} hash and Block - ${i} previous hash are matched`);
            } else {
                errors.push(getNewErrorLogPromise(`Error: Block - ${i-1} hash and Block - ${i} previous hash are not matched`));
            }
            leadBlock = lagBlock
        }
        let errorsPromise = await Promise.all(errors);
        return errorsPromise;
    }



    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports = Blockchain;
