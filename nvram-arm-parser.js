// Generated by IcedCoffeeScript 1.8.0-d
(function() {
  var NvramArmParser, buffertools, fs;

  fs = require('fs');

  buffertools = require('buffertools');

  NvramArmParser = (function() {
    function NvramArmParser() {}

    NvramArmParser.error = function(e) {
      return console.error("error: " + e);
    };

    NvramArmParser.header = "HDR2";

    NvramArmParser.is = function(buf) {
      return buffertools.equals(buf.slice(0, 4), this.header);
    };

    NvramArmParser.decode = function(buf, autocb) {
      var filelen, filelenptr, i, lastgarbage, rand, randptr, _i, _ref;
      if (!(buf instanceof Buffer)) {
        buf = fs.readFileSync(buf);
        if (!this.is(buf)) {
          autocb(this.error("invalid header, expected HDR2"));
          return;
        }
      }
      filelenptr = this.header.length;
      filelen = buf.readUInt32BE(filelenptr, 3);
      randptr = filelenptr + 3;
      rand = buf[randptr];
      for (i = _i = 8, _ref = filelen + 7; 8 <= _ref ? _i <= _ref : _i >= _ref; i = 8 <= _ref ? ++_i : --_i) {
        if (buf[i] > (0xfd - 0x1)) {
          if (i === lastgarbage + 1) {
            autocb(buf.slice(0, +(i - 1) + 1 || 9e9));
            return;
          }
          buf[i] = 0x0;
          lastgarbage = i;
        } else {
          buf[i] = 0xff + rand - buf[i];
        }
      }
      autocb(buf);
      return;
    };

    NvramArmParser.get_rand = function() {
      return Math.round(Math.random() * 0xff);
    };

    NvramArmParser.encode = function(pairs, autocb) {
      var byte, count, filelen, filelenbuf, footer, header, i, pairsbuf, rand, _i, _j, _len, _len1;
      pairsbuf = buffertools.concat.apply(buffertools, pairs);
      count = pairsbuf.length;
      filelen = count + (1024 - count % 1024);
      rand = this.get_rand() % 30;
      filelenbuf = new Buffer(3);
      filelenbuf.writeUInt32BE(filelen, 0, 3);
      header = buffertools.concat(this.header, filelenbuf, new Buffer([rand]));
      footer = new Buffer(filelen - count);
      for (_i = 0, _len = footer.length; _i < _len; _i++) {
        i = footer[_i];
        footer[i] = 0xfd + this.get_rand() % 3;
      }
      for (i = _j = 0, _len1 = pairsbuf.length; _j < _len1; i = ++_j) {
        byte = pairsbuf[i];
        if (byte === 0x0) {
          pairsbuf[i] = 0xfd + this.get_rand() % 3;
        } else {
          pairsbuf[i] = 0xff - pairsbuf[i] + rand;
        }
      }
      autocb(buffertools.concat(header, pairsbuf, footer));
      return;
    };

    return NvramArmParser;

  })();

  module.exports = NvramArmParser;

}).call(this);
