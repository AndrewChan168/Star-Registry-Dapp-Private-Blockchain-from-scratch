class Status{
    constructor(address, requestTimeStamp, message,validationWindow, isValid){
        this.address=address;
        this.requestTimeStamp=requestTimeStamp;
        this.message=message;
        this.validationWindow=validationWindow;
        this.messageSignature=isValid;
    }
}

class ValidateResult{
    constructor(request, isValid){
        this.registerStar = true;
        this.status = new Status(
            request.address,
            request.requestTimeStamp,
            request.message,
            request.validationWindow,
            isValid
        )
    }
}

module.exports = ValidateResult;