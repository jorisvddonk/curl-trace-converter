# Curl trace converter

This is a simple tool which allows you to convert [curl](https://curl.haxx.se/) trace files (produced by the `--trace` option) into other formats.

# Usage

`curl-trace-converter TRACEFILE`

STDOUT is always used to output the result of the conversion.

# Output formats

The following output formats are supported. You can supply these via the `--out` commandline attribute.

| Format | Description | more info |
| ------ | ----------- | --------- |
| send   | Return all data that's sent to the remote server | (default) |
| recv   | Return all data that's received from the remote server |  |
| host_port | Return the host and port that's being connected to, as a space-separated string |

# Rationale

Curl's trace files are neat, but it would be cool if you could use them to form your own requests to different (or the same) server, or validate that some program you're working on is functioning correctly. With curl-trace-converter, you can do things like:

`curl-trace-converter trace | nc $(curl-trace-converter trace --out=host_port)`

to repeat a request contained inside a trace file via [netcat](https://en.wikipedia.org/wiki/Netcat).
