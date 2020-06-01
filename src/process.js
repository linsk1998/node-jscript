
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