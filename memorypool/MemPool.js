const bitcoinMessage = require('bitcoinjs-message'); 
const ValidateResult = require("./ValidateResult");

const TimeoutRequestsWindowTime = 5*60*1000;

function calculateRemainTime(request){
    let timeElapse = parseInt(new Date().getTime().toString().slice(0,-3)) - parseInt(request.requestTimeStamp);
    return TimeoutRequestsWindowTime - timeElapse;
}

class MemPool {
    constructor(){
        /**
         * I use Map instead of array
         * key of Map is wallet address and value is the request content
         */
        this.mempool = new Map();
        this.timeoutRequests = new Map();
        this.mempoolValid = [];
    }

    removeAddressFromMempoolValid(address){
        console.log("removeAddressFromMempoolValid(address):");
        try {
            this.mempoolValid = this.mempoolValid.filter((reqObj)=>reqObj.status.address!=address);
            console.log("this.mempoolValid:");
            console.log(this.mempoolValid);
        } catch (err) {
            console.log(err);
        }
    }

    addRequestValidation(address){
        console.log("addRequestValidation(address):");
        console.log(`this.mempool.has(address): ${this.mempool.has(address)}`);
        try {
            if (this.mempool.has(address)){
                let requestObj = this.mempool.get(address);
                requestObj["validationWindow"] = parseInt(calculateRemainTime(requestObj)/1000);
                return requestObj;
            }else{
                let requestObj = {};
                requestObj["address"] = address;
                requestObj["requestTimeStamp"] = (new Date().getTime().toString().slice(0,-3)).toString();
                requestObj["message"] = `${requestObj.address}:${requestObj.requestTimeStamp}:starRegistry`;
                requestObj["validationWindow"] = parseInt(TimeoutRequestsWindowTime/1000);
                this.mempool.set(address,requestObj);
                this.timeoutRequests.set(address,setTimeout(()=>{
                    this.removeValidationRequest(address);
                    console.log(`Remove ${address}`);
                }, TimeoutRequestsWindowTime));
                console.log("this.mempool:");
                console.log(this.mempool);
                console.log("this.mempoolValid:");
                console.log(this.mempoolValid);
                return requestObj;
            }
        } catch(err) {
            console.log(err);
        }
    };

    verifyAddressRequest(address){
        console.log("verifyAddressRequest(address):")
        console.log(this.mempool.has(address))
        return this.mempool.has(address);
    }

    removeValidationRequest(address){
        try{
            if(this.mempool.has(address)){
                this.mempool.delete(address);
                this.timeoutRequests.delete(address);
            }
            console.log("removeValidationRequest(address):");
            console.log("this.mempool:");
            console.log(this.mempool);
            console.log("this.mempoolValid:");
            console.log(this.mempoolValid);
        } catch (err) {
            console.log(err);
        }
    };
    
    validateRequestByWallet(address, signature){
        console.log("validateRequestByWallet(address, signature):");
        console.log(`this.mempool.has(address): ${this.mempool.has(address)}`);
        if (this.mempool.has(address)){
            let requestObj = this.mempool.get(address);
            const isValid = bitcoinMessage.verify(requestObj.message, requestObj.address, signature);
            console.log(`isValid: ${isValid}`);
            requestObj["validationWindow"] = parseInt(calculateRemainTime(requestObj)/1000);
            let valiateResult = new ValidateResult(requestObj, isValid);
            if(isValid){
                this.mempoolValid.push(valiateResult);
                this.removeValidationRequest(address);        
            }
            console.log("validateRequestByWallet(address, signature):")
            console.log("this.mempool:");
            console.log(this.mempool);
            console.log("this.mempoolValid:");
            console.log(this.mempoolValid);
            return valiateResult;
        } else {
            return {};
        }
    };

    checkRequestInValidPool(address){
        console.log("checkRequestInValidPool(address):");
        const filterArray = this.mempoolValid.filter(item=>item.status.address===address);
        console.log("filterArray:");
        console.log(filterArray);
        if (filterArray.length===0) return false;
        else return filterArray[0].status.messageSignature;
    }
};

module.exports = MemPool;
