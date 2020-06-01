var global=this;
var console={
	log:function(){
		var arr=[];
		for(var i=0;i<arguments.length;i++){
			var s,arg=arguments[i];
			try{
				s=new String(arg);
			}catch(e){
				try{
					s=Object.prototype.toString.call(arg);
				}catch(e){
					s=typeof arg;
				}
			}
			arr.push(s);
		}
		WScript.Echo(arr.join(" "));
	},
	error:function(){
		WScript.StdOut.Write("\x1b[31m");
		console.log.apply(this,arguments);
		WScript.StdOut.Write("\x1b[0m");
	},
	info:function(msg){
		WScript.StdOut.Write("\x1b[34m");
		console.log.apply(this,arguments);
		WScript.StdOut.Write("\x1b[0m");
	},
	warn:function(msg){
		WScript.StdOut.Write("\x1b[33m");
		console.log.apply(this,arguments);
		WScript.StdOut.Write("\x1b[0m");
	},
	dir:function(data){
		WScript.Echo(JSON.stringify(data));
	},
	assert:function(result,msg){
		if(!result){
			WScript.Echo("Assertion failed: "+msg);
		}
	}
};
var process=new (function(global){
	var wshShell = WScript.CreateObject("WScript.Shell");
	var wshProccessEnv = wshShell.Environment("Process");
	var cwd=wshProccessEnv("cwd");
	var prefix=WScript.ScriptFullName.replace(/node\.js$/,"");
	this.cwd=function(){
		return cwd;
	};
	this.execPath=prefix+"node.cmd";
	this.execDir=prefix;
	this.abort=function(){
		WScript.Quit();
	};
	this.exit=function(code){
		if(arguments.length===0){
			if('exitCode' in process){
				code=process.exitCode;
			}else{
				code=0;
			}
		}
		WScript.Quit(code);
	};
	this.argv=[this.execPath];
	this.execArgv=[];
	var isExecArgv=true;
	for(var i=0;i<WScript.Arguments.length;i++){
		var argv=WScript.Arguments.Item(i);
		if(isExecArgv){
			if(argv.match(/^\-[0-9a-zA-Z\-]+=.*/)){
				this.execArgv.push(argv);
				continue ;
			}else{
				isExecArgv=false;
			}
		}
		this.argv.push(argv);
	}
	this.env={};
	var list = [
		'ALLUSERSPROFILE',
		'APPDATA',
		'CommonProgramFiles',
		'COMPUTERNAME',
		'ComSpec',
		'configsetroot',
		'FP_NO_HOST_CHECK',
		'HOMEDRIVE',
		'HOMEPATH',
		'LOCALAPPDATA',
		'LOGONSERVER',
		'NUMBER_OF_PROCESSORS',
		'OS',
		'Path',
		'PATHEXT',
		'PROCESSOR_ARCHITECTURE',
		'PROCESSOR_IDENTIFIER',
		'PROCESSOR_LEVEL',
		'PROCESSOR_REVISION',
		'ProgramData',
		'ProgramFiles',
		'PROMPT',
		'PSModulePath',
		'PUBLIC',
		'SESSIONNAME',
		'SystemDrive',
		'SystemRoot',
		'TEMP',
		'TMP',
		'USERDOMAIN',
		'USERNAME',
		'USERPROFILE',
		'windir'
	];
	for(i=0;i<list.length;i++){
		var key = list[i];
		var value = wshProccessEnv.Item(key);
		value = wshShell.ExpandEnvironmentStrings(value);
		this[key.toUpperCase()] = value;
	}
	wshShell=null;
})(this);
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
function module(exports, require, module, __filename, __dirname){
	try{
		return eval(module.code);
	}catch(e){
		if(!e.stack){
			e.stack="    at "+__filename
		}else{
			e.stack+="\n    at "+__filename
		}
		throw e;
	}
}
(function(global){
	var cache={};
	function createRequire(__dirname){
		function require(name){
			var mod=require.cache[name];
			if(mod && mod.exports){
				return mod.exports;
			}
			var path,file;
			var fso = new ActiveXObject("Scripting.FileSystemObject");
			if(name.indexOf("./")===0){
				path=__dirname+name.substring(1);
				file=getFile(fso,path);
			}else if(name.indexOf("../")===0){
				path=__dirname+"/"+name;
				file=getFile(fso,path);
			}else{
				file=findModulePath(fso,__dirname,name);
			}
			fso=null;
			path=file.Path;
			mod=cache[path];
			if(!mod || !mod.exports){
				mod=new Module();
				mod.require=createRequire(__dirname);
				mod.require.main=mod;
				mod.code=readfile(path);
				mod.filename=path;
				var json=module(mod.exports,mod.require,mod,path,file.ParentFolder);
				if(path.lastIndexOf(".json")===path.length-5){
					mod.exports=json;
				}
				cache[path]=mod;
			}
			require.cache[name]=mod;
			return mod.exports;
		};
		require.cache={};
		return require;
	}
	function Module(){
		this.exports={};
	}
	function getFile(fso,path){
		if(fso.FileExists(path)){
			return fso.GetFile(path);
		}
		var filename=path+".js";
		if(!fso.FileExists(filename)){
			filename=path+".json";
			if(!fso.FileExists(filename)){
				filename=path+".node";
				if(!fso.FileExists(filename)){
					return ;
				}
			}
		}
		return fso.GetFile(filename);
	}
	function findModulePath(fso,path,mod){
		path=path.replace(/\\/g,"/");
		var folders= path.split("/");
		var i=folders.length;
		var file;
		while(i-->1){
			path=folders.join("/");
			file=getModule(fso,path+"/node_modules",mod);
			if(file){
				return file;
			}
			folders.pop();
		}
		file=getModule(fso,process.execDir+"/lib/node",mod);
		if(file){
			return file;
		}
		throw new Error("not found module '"+mod+"'");
	}
	function getModule(fso,path,mod){
		if(!fso.FolderExists(path)){
			return ;
		}
		path=path+"/"+mod;
		var file=getFile(fso,path);
		if(file){
			return file;
		}
		if(!fso.FolderExists(path)){
			return ;
		}
		var package=path+"/package.json";
		if(!fso.FileExists(package)){
			return ;
		}
		var json;
		try{
			json=eval("("+readfile(package)+")");
		}catch(e){
			console.error("SyntaxError: "+package);
			return ;
		}
		if(!json.main){
			console.error("SyntaxError: not property 'main' in "+package);
			return ;
		}
		path=path+"/"+json.main;
		if(fso.FileExists(path)){
			return fso.GetFile(path);
		}
	}
	function readfile(path){
		var stm=new ActiveXObject("adodb.stream");
		stm.Type=2;
		stm.Mode=3;
		stm.Charset="UTF-8";
		stm.Open();
		stm.LoadFromFile(path);
		var str=stm.ReadText();
		stm.Close();
		try{
			return str;
		}finally{
			stm=null;
		}
	}
	global.require=createRequire(process.execDir);
})(this);
if(process.argv.length>1){
	(function(){
		var path=process.argv[1];
		if(path.indexOf(":")===-1 || path.indexOf(".")!==0){
			path="./"+path;
		}
		try{
			require(path);
		}catch(e){
			console.error(e.message);
			if(e.stack){
				console.log(e.stack);
			}
			throw e;
		}
	})();
	process.doEvents();
}