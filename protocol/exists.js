module.exports = function (logger, inherits, Request, Response, ZKErrors, ZnodeStat) {

	function Exists(path, watcher, xid) {
		Request.call(this, 3, xid, ExistsResponse)
		this.path = path
		this.watcher = watcher ? 1 : 0
	}
	inherits(Exists, Request)

	Exists.prototype.toBuffer = function () {
		var pathlen = Buffer.byteLength(this.path)
		var data = new Buffer(4 + 4 + 4 + pathlen + 1)
		data.writeUInt32BE(this.xid, 0)
		data.writeUInt32BE(this.type, 4)
		data.writeUInt32BE(pathlen, 8)
		data.write(this.path, 12)
		data.writeUInt8(this.watcher, data.length - 1)
		return data
	}

	function ExistsResponse(xid, cb) {
		Response.call(this, xid, cb)
		this.znodeStat = null
	}
	inherits(ExistsResponse, Response)

	ExistsResponse.prototype.parse = function (errno, buffer) {
		if (errno === ZKErrors.NONODE) {
			return this.cb(null, false)
		}
		else if (errno) {
			return this.cb(errno)
		}
		this.znodeStat = ZnodeStat.parse(buffer)
		this.cb(null, true, this.znodeStat)
	}

	return Exists
}
