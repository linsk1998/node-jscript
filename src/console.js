
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