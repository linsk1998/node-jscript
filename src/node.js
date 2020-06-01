
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