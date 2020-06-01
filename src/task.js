
(function(global){
	var microTasks=[];
	var macroTasks=[];
	var timeTasks=[];
	global.queueMicrotask=function(callback){
		microTasks.push({
			callback:callback
		});
	};
	process.nextTick=function(callback){
		var task={
			callback:callback
		};
		if(arguments.length>1){
			var args=Array.prototype.slice.call(arguments);
			args.shift();
			task.args=args;
		}
		microTasks.push(task);
	};
	var timer=1;
	function insertTimeTask(task){
		if(timeTasks.length){
			var last=timeTasks.length-1;
			for(var i=0;i<=last;i++){
				var t=timeTasks[i];
				if(t.timestamp>task.timestamp){
					timeTasks.splice(i-1,0,task);
				}else if(i===last){
					timeTasks.push(task);
				}
			}
		}else{
			timeTasks.push(task);
		}
	}
	function setDelayTask(task,delay){
		var now=new Date();
		var timestamp=now.getTime()+Number(delay);
		task.timestamp=timestamp;
		insertTimeTask(task);
		now=null;
	}
	global.setTimeout=function(callback,delay){
		var task={
			callback:callback,
			timer:timer
		};
		if(arguments.length>2){
			var args=Array.prototype.slice.call(arguments);
			args.splice(0,2);
			task.args=args;
		}
		setDelayTask(task,delay);
		return timer++;
	}
	global.clearTimeout=global.clearInterval=function(timer){
		var len=timeTasks.length;
		for(var i=0;i<len;i++){
			var t=timeTasks[i];
			if(t.timer===timer){
				timeTasks.splice(i,1);
				return ;
			}
		}
	};
	global.setInterval=function(callback, delay){
		var task={
			timer:timer
		};
		if(arguments.length>2){
			var args=Array.prototype.slice.call(arguments);
			args.splice(0,2);
			task.args=args;
		}
		task.callback=function(){
			call(callback,arguments);
			setDelayTask(task,delay);
		};
		setDelayTask(task,delay);
		return timer++;
	};
	global.setImmediate=function(callback){
		var task={
			callback:callback
		};
		if(arguments.length>1){
			var args=Array.prototype.slice.call(arguments);
			args.shift();
			task.args=args;
		}
		macroTasks.push(task);
	};
	process.doEvents=function(){
		while(true){
			if(microTasks.length+macroTasks.length===0){
				if(timeTasks.length===0){
					break ;
				}else{
					sleepToNext();
				}
			}else{
				doMicroTasks();
			}
			doTimeTasks();
			doMicroTasks();
			doMacroTasks();
		}
	};
	function doMicroTasks(){
		if(microTasks.length){
			var task=microTasks.shift();
			doTask(task);
			doMicroTasks();
		}
	}
	function doTimeTasks(){
		var i=timeTasks.length;
		if(i){
			var now=new Date();
			var timestamp=now.getTime();
			now=null;
			var timeOutTasks=[];
			while(i-->0){
				var task=timeTasks[i];
				if(task.timestamp<=timestamp){
					timeOutTasks.push(task);
					timeTasks.splice(i,1);
				}
			}
			i=timeOutTasks.length;
			while(i-->0){
				doTask(timeOutTasks[i]);
			}
			timeOutTasks=null;
		}
	}
	function doMacroTasks(){
		if(macroTasks.length){
			var tasks=macroTasks;
			macroTasks=[];
			for(var i=0;i<tasks.length;i++){
				doTask(tasks[i]);
			}
			tasks=null;
		}
	}
	function doTask(task){
		call(task.callback,task.args);
	}
	function call(func,args){
		try{
			if(args){
				func.apply(global,args);
			}else{
				func(global);
			}
		}catch(e){
			console.error(e.message);
			if(e.stack){
				console.log(e.stack);
			}
			console.log(func);
		}
	}
	function sleepToNext(){
		var now=new Date();
		var timestamp=now.getTime();
		now=null;
		var ms=timeTasks[0].timestamp-timestamp;
		if(ms>0){
			WScript.Sleep(ms);
		}
	}
})(this);