var Runnr = require('./node-runnr');

var Run = new Runnr();

Run.interval('test', ['5', '1'])
.job(function(data, exit, next){
	console.log('i')
	next('next')
})
.then(function(data, exit, next){
	console.log(1, data);
	exit('g')
})
.then(function(data, exit, next){
	console.log(2, data);
	next('g')
})
.exit(function(data){
	console.log('exit')
})


Run.start()

