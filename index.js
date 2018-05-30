var fs = require("fs");

var handle = function(argv) {
  var trace_lines = fs
    .readFileSync(argv._[0])
    .toString()
    .replace(/\r\n/g, "\n")
    .split("\n");

  // parse chunks of trace into separate data structures
  var info_chunks = [];
  var send_chunks = [];
  var recv_chunks = [];
  var currentlyParsing = "none";
  trace_lines.forEach(function(line) {
    if (line.length >= 2) {
      if (line.charCodeAt(0) == 61 && line.charCodeAt(1) == 62) {
        currentlyParsing = "send";
        send_chunks.push({
          header: line,
          lines: []
        });
        return;
      }
      if (line.charCodeAt(0) == 60 && line.charCodeAt(1) == 61) {
        currentlyParsing = "recv";
        recv_chunks.push({
          header: line,
          lines: []
        });
        return;
      }
      if (line.charCodeAt(0) == 61 && line.charCodeAt(1) == 61) {
        currentlyParsing = "info";
        info_chunks.push({
          header: line,
          lines: []
        });
        return;
      }
    }
    if (line.length >= 1) {
      var firstChar = line.charCodeAt(0);
      if (
        !(
          (firstChar >= 48 && firstChar <= 57) ||
          (firstChar >= 97 && firstChar <= 102)
        )
      ) {
        return;
      }
    }
    if (currentlyParsing === "send") {
      send_chunks[send_chunks.length - 1].lines.push(line);
    } else if (currentlyParsing === "recv") {
      recv_chunks[recv_chunks.length - 1].lines.push(line);
    }
  });

  var chunkToBuffer = function(chunk) {
    return Buffer.from(
      chunk.lines
        .map(function(line) {
          return line.substr(6, 47).replace(/[^0-9a-f]/g, "");
        })
        .join(""),
      "hex"
    );
  };

  var chunksToBuffer = function(chunks) {
    return Buffer.concat(chunks.map(chunkToBuffer));
  };

  var send_buffer = chunksToBuffer(send_chunks);
  var recv_buffer = chunksToBuffer(recv_chunks);

  if (argv.out == "send") {
    process.stdout.write(send_buffer);
  } else if (argv.out == "recv") {
    process.stdout.write(recv_buffer);
  }
};

const argv = require("yargs")
.describe('out', 'specify output format')
.choices('out', ['send', 'recv'])
.default('out', 'send')
  .command("*", "parse trace file", {}, handle)
  .help().argv;
