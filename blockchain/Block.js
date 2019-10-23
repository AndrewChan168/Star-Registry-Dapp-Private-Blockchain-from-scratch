/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		// Add your Block properties
		// Example: this.hash = "";
		this.height = 0;
		this.timeStamp = new Date().getTime();
    	this.body = data;
    	this.previousHash = '0x';
    	this.hash = '';
	}
}

module.exports = Block;