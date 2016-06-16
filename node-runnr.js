const DAILY = 24*3600*1000;
const WEEKLY = 7*DAILY;

module.exports = function(delay){
	delay = delay || 100;
	var jobs = [];
	var self = this;
	this._getDays = function(date){
		/*	Get number of days in a month
			parameter: date -> Date object
			return: Number
		*/
		return new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
	}
	this._getInterval = function(intervals){
		/*	Converts interval string to milliseconds
			parameter: intervals -> Array/string
			return: Array of number
		*/
		if(typeof(intervals) != 'object')
			intervals = [intervals];

		var _intervals =[];
		for(var j=0; j<intervals.length; j++){
			var interval = intervals[j].split(':');
			var t = interval.length;
			for(var i = 0; i<4; i++){
				if(i >= t)
					interval.unshift(0);
				else
					interval[i] = parseFloat(interval[i])
			}
			t = interval.length - 1;
			_intervals.push((interval[t-3]*DAILY + interval[t-2]*3600 + interval[t-1]*60 + interval[t])*1000)
		}
		return _intervals;
	}
	this._getTime = function(intervals){
		/*	Converts schedule string to milliseconds
			parameter: intervals -> Array/string
			return: Array of number
		*/
		if(typeof(intervals) != 'object')
			intervals = [intervals];

		var _intervals =[];
		for(var j=0; j<intervals.length; j++){
			var interval = intervals[j].split(':');
			var t = interval.length;
			for(var i = 0; i<4; i++){
				if(i >= t)
					interval.unshift(0);
				else
					interval[i] = parseFloat(interval[i])
			}
			t = interval.length - 1;
			if(interval[t-3] !=0)
				interval[t-3]--;
			_intervals.push((interval[t-3]*24*3600 + interval[t-2]*3600 + interval[t-1]*60 + interval[t])*1000)
		}
		return _intervals;
	}
	this._generateName = function(){
		/*	Create a random name. Starts with T
			return: String
		*/
		var name = 'T';
		for(var i = 0; i<6; i++)
			name += Math.floor(Math.random()*9);
		return name;
	}
	this._get = function(name){
		/*	Get Job
			parameter: name -> name of job
			return: Object/Boolean
		*/
		for(var i=0; i<jobs.length; i++){
			if(jobs[i].name == name)
				return jobs[i];
		}
		return false
	}


	/*
	job(exit, next)
	*/
	var res = function(name, job){
		return {
			name: name,
			job: function(_job){
				job.task = _job;
				return this;
			},
			then: function(_cb, _cbname){
				job.callbacks.push({
					name: name+': '+_cbname,
					callback: _cb,
				});
				return this;
			},
			exit: function(_exit){
				job.exit = _exit;
				return this;
			},
		}
	}
	this.interval = function(name, _interval, details){
		/*	Create an Interval Job
			parameter: 	interval -> interval
						details: Object
			return: Object
		*/
		var interval =  this._getInterval(_interval);
		name = name || this._generateName();
		var job = {
			type: 'interval',
			_interval: _interval,
			interval: interval,
			task: null,
			name: name,
			nextIndex: 0,
			next: Date.now() + interval[0],
			pause: false,
			details: details || {},
			callbacks: [],
			currentCallback: 0,
			exit: null
		}
		jobs.push(job);
		return res(name, job);
	}
	this.daily = function(name, _time, details){
		/*	Create an Daily Job
			parameter: 	task -> function
						details: Object
			return: String -> name of job
		*/
		var time =  this._getInterval(_time);
		name = name || this._generateName();
		var job = {
			type: 'daily',
			_time: _time,
			time: time,
			task: null,
			name: name,
			nextIndex: 0,
			pause: false,
			details: details || {},
			callbacks: [],
			currentCallback: 0,
			exit: null
		}
		var now = Date.now();
		var today = Math.floor(now/DAILY)*DAILY;
		job.next = today + time[0];
		var day = 0;
		while(job.next < now){
			job.nextIndex++;
			day = Math.floor(job.nextIndex/job.time.length);
			job.nextIndex %= job.time.length;
			job.next = today +day*DAILY + job.time[job.nextIndex];
		}
		jobs.push(job);
		return res(name, job);
	}
	this.weekly = function(name, _time, details){
		/*	Create an Weekly Job
			parameter: 	task -> function
						details: Object
			return: String -> name of job
		*/
		var time =  this._getTime(_time);
		name = name || this._generateName();
		var job = {
			type: 'weekly',
			_time: _time,
			time: time,
			task: null,
			name: name,
			nextIndex: 0,
			pause: false,
			details: details || {},
			callbacks: [],
			currentCallback: 0,
			exit: null
		}
		var now = Date.now();
		var weekStart = Math.floor(now/WEEKLY)*WEEKLY + 3*DAILY;
		job.next = weekStart + time[0];
		var week = 0;
		while(job.next < now){
			job.nextIndex++;
			week = Math.floor(job.nextIndex/job.time.length);
			job.nextIndex %= job.time.length;
			job.next = weekStart + week*WEEKLY + job.time[job.nextIndex];
		}
		jobs.push(job);
		return res(name, job);
	}
	this.monthly = function(name, _time, details){
		/*	Create an Monthly Job
			parameter: 	task -> function
						details: Object
			return: String -> name of job
		*/
		var time =  this._getTime(_time);
		name = name || this._generateName();
		var job = {
			type: 'monthly',
			_time: _time,
			time: time,
			task: null,
			name: name,
			nextIndex: 0,
			pause: false,
			details: details || {},
			callbacks: [],
			currentCallback: 0,
			exit: null
		}
		var now = Date.now();
		var date = new Date(now);
		var monthStart = now - now%DAILY - (date.getDate()-1)*DAILY;
		job.next = monthStart + time[0];
		var month = 0;
		while(job.next < now){
			job.nextIndex++;
			month = Math.floor(job.nextIndex/job.time.length);
			job.nextIndex %= job.time.length;
			job.next = monthStart + month*this._getDays(date)*DAILY + job.time[job.nextIndex];
		}
		jobs.push(job);
		return res(name, job);
	}

	this.get = function(name){
		var job = this._get(name)
		if(!job)
			return false;
		return {
			name: name,
			last: job.last,
			next: job.next,
			pause: job.pause,
			type: job.type,
			_schedule: job._time || job._interval,
			schedule: job.time || job.interval,
			details: job.details,
		};
	}
	this.getAll = function(){
		var _jobs = {};
		jobs.forEach(function(job){
			_jobs[job.name] = {
				name: job.name,
				last: job.last,
				next: job.next,
				pause: job.pause,
				type: job.type,
				_schedule: job._time || job._interval,
				schedule: job.time || job.interval,
				details: job.details,
			}
		})
		return _jobs;
	}
	this.stopAll = function(){
		jobs.forEach(function(job){
			job.pause = true;
		})
		return true;
	}
	this.stop = function(name){
		var job = this._get(name);
		if(!job)
			return false;
		job.pause = true;
		return true;
	}
	this.startAll = function(){
		jobs.forEach(function(job){
			job.pause = false;
		})
		return true;
	}
	this.start = function(name){
		var job = this._get(name);
		if(!job)
			return false;
		job.pause = false;
		return true;
	}
	this.kill = function(name){
		/*	Kill a job
			parameter: 	name -> name of job
			return: Boolean
		*/
		for(var i=0; i<jobs.length; i++){
			if(jobs[i].name == name){
				jobs.splice(i, 1)
				return true;
			}
		}
		return false

	}
	// this.reschedule = function(name, time){
	// 	/*	Reschedule a job
	// 		parameter: 	name -> name of job
	// 		return: Boolean/String
	// 	*/
	// 	var job = this._get(name);
	// 	if(!job)
	// 		return false;
	// 	var task = job.task;
	// 	this.kill(name)
	// 	switch(job.type){
	// 		case 'interval': return this.addIntervalJob(time, job.task, name);
	// 		case 'daily': return this.addDailyJob(time, job.task, name);
	// 		case 'weekly': return this.addWeeklyJob(time, job.task, name);
	// 		case 'monthly': return this.addMonthlyJob(time, job.task, name);
	// 	}
	// }

	this.start = function(){
		var exit = function(job, data){
			job.currentCallback = 0;
			if(job.exit)
				job.exit(data)
		}
		var next = function(job, data){
			var c = job.currentCallback++;
			var cb = job.callbacks[c] || false
			if(cb){
				cb.callback(data, function(data){
								exit(job, data)
							}, function(data){
								next(job, data)
							})
			}else{
				exit(job, data)
			}
		}
		var Loop = setInterval(function() {
			var now = Date.now();
			var today = Math.floor(now/DAILY)*DAILY;
			var weekStart = Math.floor(now/WEEKLY)*WEEKLY + 3*DAILY;

			var date = new Date(now);
			var monthStart = now - now%DAILY - (date.getDate()-1)*DAILY;

			jobs.forEach(function(job){
				// console.log(date)
				setTimeout(function(){
					if(job.pause)
						return 0;
					var diff = Math.abs(job.next - now);
					if(job.next<now){
						setTimeout(function(){
							job.task(null, function(data){
								exit(job, data)
							}, function(data){
								next(job, data)
							})
						}, 0);
						job.last = job.next;
						switch(job.type){
							case 'interval':
								job.nextIndex++;
								job.nextIndex %= job.interval.length;
								job.next = now + job.interval[job.nextIndex];
							break;
							case 'daily':
								job.nextIndex++;
								var day = Math.floor(job.nextIndex/job.time.length);
								job.nextIndex %= job.time.length;
								job.next = today + day*DAILY + job.time[job.nextIndex];
							break;
							case 'weekly':
								job.nextIndex++;
								var week = Math.floor(job.nextIndex/job.time.length);
								job.nextIndex %= job.time.length;
								job.next = weekStart + week*WEEKLY + job.time[job.nextIndex];
							break;
							case 'monthly':
								job.nextIndex++;
								var month = Math.floor(job.nextIndex/job.time.length);
								job.nextIndex %= job.time.length;
								job.next = monthStart + month*self._getDays(date)*DAILY + job.time[job.nextIndex];
							break;
						}
					}
				},0)
			})
		}, delay);
	}
}
