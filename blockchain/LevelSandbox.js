/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        /* why Pythonic? */
        //let self = this;
        return new Promise((resolve, reject) => {
            // Add your code here, remember in Promises you need to resolve() or reject()
            this.db.get(key, (error, value)=>{
                if(error){
                    reject(error);
                }else{
                    resolve(value);
                }
            })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        //let self = this;
        return new Promise((resolve, reject) => {
            // Add your code here, remember in Promises you need to resolve() or reject() 
            this.db.put(key, value, (error)=>{
                if (error) {
                    console.log('Block ' + key + ' submission failed', error);
                    reject(error);
                }
                console.log('Block '+key+' submission succeed ');
                resolve(value);
            })
        });
    }

    // Method that return the height
    getBlocksCount() {
        //let self = this;
        let i = 0;
        //let height;
        return new Promise((resolve, reject) => {
            // Add your code here, remember in Promises you need to resolve() or reject()
            this.db.createReadStream().on('data', (data)=>{
                i++;
            }).on('error', (error)=>{
                console.log('Unable to read data stream!', error);
                reject(error);
            }).on('close', (data)=>{
                resolve(i);
            })
        });
    }

    // method added by myself
    // a promise of a list of blocks
    getAllBlocks() {
        return new Promise((resolve, reject)=>{
            let allBlocks = [];
            this.db.createReadStream()
                .on('data',(data)=>allBlocks.push(data.value))
                .on('error', (error)=>reject(error))
                .on('close', (data)=>resolve(allBlocks));
                //.on('close', ()=>resolve(allBlocks.sort((a,b) => parseInt(a.height) - parseInt(b.height))));
        })
    }
    
    getBlockByHash(hash){
        return new Promise((resolve, reject)=>{
            let block = null;
            this.db.createReadStream()
                .on('data', (data)=>{
                    const value = JSON.parse(data.value);
                    const streamHash = value.hash;
                    if (streamHash === hash) block=value
                })
                .on('error', (err)=>{reject(err)})
                .on('close', ()=>{
                    resolve(block)
                })
        })
    }

    getBlockByAddress(address){
        return new Promise((resolve, reject)=>{
            let blocks = [];
            this.db.createReadStream()
                .on('data', (data)=>{
                    const value = JSON.parse(data.value);
                    const streamAddress = value.body.address;
                    if (streamAddress === address) blocks.push(value)
                })
                .on('error', (err)=>{reject(err)})
                .on('close', ()=>{resolve(blocks)})
        })
    }
}

module.exports = LevelSandbox;
