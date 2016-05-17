# node-runner

`node-runner` is easy to use task master. Execute set of predefined tasks at a given time/times and at certain interval/s.


## Usage
### Install using bower: 
```script
bower install dna-router
```
### Overview
'node-runner' can execute an arbitrary task at multiple intervals and time. Unlike cron, input time format are in Human readable form. You can run jobs daily, weekly or monthly at multiple time/date. It exposes few APIs through which all jobs can be reschedules/stopped/start via front-end (You need to make a front-endfor that.)

It have just one clock to monitor all jobs thus no need to re-evaluate jobs at every cycle, hence, its very lightweight. By default, clock cycle is 100ms i.e check and ecxecute task at every 100ms. However, custom cycle can be passed while creating a `runner` object. 

### Jobs and scheduling

Require `node-runner`.
```script
var Runner = require('node-runner');
var Jobs = new Runner();
```
For custom job cycle.
```script
var Jobs = new Runner(200);
```

Time format looks as follow:

`Day:Hour:Min:Sec`

For example, '2: 12:30: 10' would run a job at every 2 days, 12 hour, 30 min and 10 seconds if its an interval job.

If its a monthly job, it will execute job on 2nd of every month at 12:30:10.

If its a weekly job, Monday, 12:30:10 every week. 

To execute job at every 5 min, time string would be just `5:0`, and just `5` for every 5 sec and so on.

`node-runner` exposes four functions to create a job. All functions returns the name of job created.

1. 	Creating an Interval job:

	```script
	var interval = Jobs.addIntervalJob('10:20', function(){...}, 'myjob', details);
	console.log(interval); 		// Output -> myjob
	// typeof 'details' is should be object
	```
	This will create a job named 'myjob' and execute at every 10 min and 20 seconds. We can set multiple intervals.

	```script
	var interval = Jobs.addIntervalJob(['5', '10', '20'], function(){...}, 'myjob', details);
	console.log(interval); 		// Output -> myjob
	```

	This will execute job at 5 min, then 10 min after last execyte time, then 20 min after last time and then 5, and so on.
