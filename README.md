# watchman
监视服务器运行情况

## Usage
```js
var man = Watchman();
man.task(80, 'localhost');
man.task(27017, 'example.com', function(point){
	console.log(point);
});
man.start(3000);
```

## License
MIT