
var net = require('net');
var EventProxy = require('eventproxy');

function Watchman(){

	if(!(this instanceof Watchman)) { 
		return new Watchman();
	}

	this._man = new EventProxy();
	this._task = [], this._timer;

	this._man.on('ok', function(point){
		console.log(point);
	});

	this._man.on('fail', function(point){
		console.log(point);
	});
}

Watchman.prototype = {

	task: function(port, host, fn){
		host = host || "127.0.0.1";
		fn = fn || function(){};
		this._task.push([port, host, fn])
	},

	check: function(PORT, HOST, fn){

		var client = new net.Socket();
		var _this = this;

		client.connect(PORT, HOST, function(){
			_this._man.emit('ok', { host:HOST, port:PORT, status:'connected' });
			client.destroy();
		});

		client.on('error', function(err){
			switch(err.code) {
				case "ECONNREFUSED" :
					_this._man.emit('fail', { host:HOST, port:PORT, status:'refuse' });
					fn();
					break;
				case "ENOTFOUND" :
					_this._man.emit('fail', { host:HOST, port:PORT, status:'host not found' });
					fn();
					break;
				default:
					console.log(err);
			}
			client.destroy();
		});
	},

	start: function(interval){
		var _this = this;
		this._timer = setInterval(function(){
			_this._task.forEach(function(point){
				_this.check.apply(_this, point);
			});
		}, interval||5000);
	},

	stop: function(){
		if (this._timer) {
			clearInterval(this._timer);
		}
	}

};


var man = Watchman();
man.task(80, 'huangque.info');
man.task(81, 'tvrcgo.org', function(){
	console.log('sth wrong');
});
man.task(27017, 'localhost', function(){
	console.log('YES');
});

man.start(3000);

//