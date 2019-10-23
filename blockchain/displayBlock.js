const hex2ascii = require('hex2ascii');
function displayBlock(block){
    block.body.star["storyDecoded"] = hex2ascii(block.body.star.story)
    return block
}

module.exports = displayBlock;