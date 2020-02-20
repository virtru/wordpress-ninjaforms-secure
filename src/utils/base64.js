var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

var InvalidCharacterError = function(message) {
    this.message = message;
};
InvalidCharacterError.prototype = new Error;
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

// encoder
// [https://gist.github.com/999166] by [https://github.com/nignag]
function encode(input) {
    if (typeof window != 'undefined') {
        return window.btoa(input);
    }

    for (
        // initialize result and counter
        var block, charCode, idx = 0, map = chars, output = '';
        // if the next input index does not exist:
        //   change the mapping table to "="
        //   check if d has no fractional digits
        input.charAt(idx | 0) || (map = '=', idx % 1);
        // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
        charCode = input.charCodeAt(idx += 3/4);
        if (charCode > 0xFF) throw new InvalidCharacterError('Invalid input.');
        block = block << 8 | charCode;
    }
    return output;
}

function decodeFallback(input) {
    input = input.replace(/=+$/, '');
    if (input.length % 4 === 1) throw new InvalidCharacterError('Invalid input.');
    for (
        // initialize result and counters
        var bc = 0, bs, buffer, idx = 0, output = '';
        // get next character
        buffer = input.charAt(idx++);
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
            // and if not first of each 4 characters,
            // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
        // try to find character in table (0-63, not found => -1)
        buffer = chars.indexOf(buffer);
    }
    return output;
}

function decode(s) {
    try {
        if (typeof window != 'undefined') {
            return window.atob(s);
        }
        return decodeFallback(s);
    } catch (err) {
        // When unicode isn't endoed correctly sometimes atob can fail, if this is the
        // case try decoding in JS as a failsafe measure
        if (err.name === 'InvalidCharacterError' && err.message.indexOf('atob') > 0) {
            return decodeFallback(s);
        }
        throw err;
    }
}

exports.encode = encode;
exports.decode = decode;
