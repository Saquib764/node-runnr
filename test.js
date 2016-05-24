var Runner = require('./node-runners');

var S = new Runner();
// S.initJob(f)
// var ii = S.addIntervalJob(['1'], function(){console.log('daily')});
var ii = S.addIntervalJob(['1'], function(){
	var c = S.get('hey');
	console.log('hey', c.next-c.last)
}, 'hey');

// S.addIntervalJob(['1'], function(){
// 	var c = S.get('hey1');
// 	console.log('hey1', c.next-c.last)
// }, 'hey1');

setTimeout(function(){
	console.log(S.reschedule('hey1', ['2']))
// console.log(S.getAll())
},4000)
// setTimeout(function(){
// 	S.startAll(ii)
// // console.log(S.getAll())
// },6000)