
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