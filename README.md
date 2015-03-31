# watchman
监视服务器运行情况

## Usage
监视指定的主机端口运行是否正常，不指定主机时监听本机端口。

```js
var man = Watchman();
man.watch(80, function(point){
	// localhost:80 state change
});
man.watch(27017, 'example.com', function(point){
	// example.com:27017 state change
});
man.start(3000); // check interval 3000ms
```

同一个主机端口可绑定多个回调。

```js
var man = Watchman();
man.watch(80, 'example.com', function(point){
	// example.com:80 state change handler
});
man.watch(80, 'example.com', function(point){
	// example.com:80 state change handler 2
});
man.start(3000);
```

## License
MIT