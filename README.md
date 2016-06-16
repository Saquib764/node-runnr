# node-runnr

`node-runnr` is easy to use task master. Execute set of predefined tasks at a given time/times and at certain interval/s.


## Usage
### Install using npm: 
```javascript
npm install node-runnr
```
### Overview
'node-runnr' can execute an arbitrary task at multiple intervals and time. Unlike cron, input time format are in Human readable form. You can run jobs daily, weekly or monthly at multiple time/date. It exposes few APIs through which all jobs can be reschedules/stopped/start via front-end (You need to make a front-endfor that.)

It have a universal timer to monitor all jobs thus no need to re-evaluate jobs at every cycle, hence, its very lightweight. By default, clock cycle is 100ms i.e check and ecxecute task at every 100ms. However, custom cycle can be passed while creating a `runnr` object.

For documentation of v1.0.1, see `REAMMEv1.0.1.md` file.

### Whats new in[and after] v1.1.0 ?

2.	Multiple callbacks/sub-jobs added. Results of job or previous sub-job can be passed on to next sub-job
1.	Simplified declaration of jobs.

### Jobs and scheduling

Require `node-runnr`.
```javascript
var Runnr = require('node-runnr');
var Jobs = new Runnr();
```
For custom job cycle.
```javascript
var Jobs = new Runnr(200);
```

Time format looks as follow:

`Day:Hour:Min:Sec`

For example, '2: 12:30: 10' would run a job at every 2 days, 12 hour, 30 min and 10 seconds if its an interval job.

If its a monthly job, it will execute job on 2nd of every month at 12:30:10.

If its a weekly job, Monday, 12:30:10 every week. 


To execute job at every 5 min, time string would be just `5:0`, and just `5` for every 5 sec and so on.

###	Structure.

	Basically, there are four parts for all job declaration.
	1.	Setting job name, interval/time/schedule and details if any `[compulsory]`.
	2.	Passing a job `[complusory]`.
	3.	Sequence of callbacks `[optional]`.
	4.	Exit callback. It get executed at the end of job and callbacks `[optional]`.

	Example,

	```javascript
	var interval = Jobs.interval('myjob', '10:20', details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```

	All `job` and `callback` functions have three parameters.
	`data` 	:	Data object passed from job aur previous sub-job. Its null for job.
	`next`	:	Its a function that envokes next `callback`. If its last callback it automatically invokes `exit`.
	`exit`	:	It exits job, right away, without calling next callbacks.

	```javascript
	var callback = function(data, next, exit){
		if(all well)
			next();
		else
			exit()
	}
	```


### Creating Jobs.
`node-runnr` exposes four functions to create a job. All functions returns the name of job created.

1. 	Creating an Interval job:

	```javascript
	var interval = Jobs.interval('myjob', '10:20', details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```
	This will create a job named 'myjob' and execute at every 10 min and 20 seconds. We can set multiple intervals.

	```javascript
	var interval = Jobs.interval('myjob', ['5:0', '10'], details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```

	This will execute job at 5 min, then 10 seconds after last execyte time, then 20 min after last time and then 5 min, and so on.

2.	Creating a daily job:
	
	```javascript
	var daily = Jobs.daily('myjob', '10:20', details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```
	This will create a job at 00:10:20(00hr 10min 20sec). To create a job at 9:25 PM, enter `21:25:00`.

	To execute a job at multiple time, i.e 9AM, 3PM, 10:30PM do as follow.

	```javascript
	var daily = Jobs.daily('myjob', ['9:0:0', '15:0:0', '22:30:0'], details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```

3.	Creating a weekly job:
	Day: 1-7, 1-Sunday, 7-Saturday
	
	```javascript
	var weekly = Jobs.weekly('myjob', '2:0:10:20', details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```
	This will create a job on Monday,  at 00:10:20(00hr 10min 20sec).

	To execute a job at multiple days, i.e Sunday 9AM, Tuesday 3PM, Friday 10:30PM do as follow.

	```javascript
	var weekly = Jobs.weekly('myjob', ['1:9:0:0', '3:15:0:0', '6:22:30:0'], details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```

4.	Creating a monthly job:
	Date: 1-31 (If month have 30 days, 31st job will be done on 1st of coming month)
	
	```javascript
	var monthly = Jobs.monthly('myjob', '2:0:10:20', details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```
	This will create a job on 2nd, at 00:10:20(00hr 10min 20sec) of every month.

	To execute a job at multiple dates, i.e 1st 9AM, 15th 3PM, 25th 10:30PM do as follow.

	```javascript
	var monthly = Jobs.monthly('myjob', ['1:9:0:0', '15:15:0:0', '25:22:30:0'], details)
					.job(job)
					.then(callback)
					.then(anotherCallback)
					.exit(exitCallback)
	```

	`Note:` Name must be unique for all job.


### Stop/cancel a job:

```javascript
var stopped = Jobs.stop('myjob')
console.log(stopped);		// true or false
```

To stop all running jobs.

```javascript
var stopped = Jobs.stopAll()
console.log(stopped);		// true
```

To remove a job forever -

```javascript
var kill = Jobs.kill('myjob')
console.log(kill);		// true / false
```

### Start a stopped job

```javascript
var start = Jobs.start('myjob')
console.log(start);		// true or false
```

To stop all running jobs.

```javascript
var start = Jobs.startAll()
console.log(start);		// true
```
	
### Rescheduele a job

`Warning`: This is not working on current version. Will fix this in comming update.

```javascript
var job = Jobs.reschedule(interval, '20:10');
console.log(job);		// myjob. (interval = 'myjob')
```

### Get job

```javascript
var job = Jobs.get(daily);
console.log(job);
/* Output
{
	name: 'myjob',
	last: Number,	// Last run timestamp
	next: Number,	// Next scheduled run timestamp
	pause: Boolean,	// Stopped or running
	type: 'daily',
	_schedule: String,	// entered time/interval string
	schedule: Array,	// Evaluated timestamp or interval in ms
	details: Object,	// Whatever object was entered during job creation
}
*/
```
