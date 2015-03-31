
var net = require('net');
var EventProxy = require('eventproxy');

module.exports = Watchman;

function Watchman(){

	if(!(this instanceof Watchman)) { 
		return new Watchman();
	}

	this._man = new EventProxy();
	this._task = {}, this._timer;
	var pointStatus = {}, _this = this;

	this._man.on('ok', function(point){
		var _point = point.host+':'+point.port;
		if (pointStatus[_point] === false) {
			_this._task[_point].forEach(function(fn){
				fn(point);
			});
		}
		pointStatus[_point] = true;
	});

	this._man.on('fail', function(point){
		var _point = point.host+':'+point.port;
		if (pointStatus[_point] === undefined || pointStatus[_point]) {
			_this._task[_point].forEach(function(fn){
				fn(point);
			});
		}
		pointStatus[_point] = false;
	});
}

Watchman.prototype = {

	watch: function(port, host, fn){

		if ( typeof host === 'function' ) {
			fn = host;
			host = "127.0.0.1";
		}

		fn = fn || function(){};
		var _point = host+':'+port;
		if (!this._task[_point]) { this._task[_point] = []; }
		this._task[_point].push(fn);
	},

	check: function(POINT){

		POINT = POINT.split(':');
		var HOST = POINT[0], PORT = POINT[1];

		var client = new net.Socket();
		var _this = this;

		client.connect(PORT, HOST, function(){
			_this._man.emit('ok', { host:HOST, port:PORT, status:'OK' });
			client.destroy();
		});

		client.on('error', function(err){
			_this._man.emit('fail', { host:HOST, port:PORT, status:'FAIL', err:err.code });
			client.destroy();
		});
	},

	start: function(interval){
		var _this = this;
		this._timer = setInterval(function(){
			for (var point in _this._task) {
				_this.check(point);
			}
		}, interval||5000);
	},

	stop: function(){
		if (this._timer) {
			clearInterval(this._timer);
		}
	}

};
