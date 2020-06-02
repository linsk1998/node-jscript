
var assert=function(){
	assert.ok.apply(this,arguments);
};
assert.ok=function ok(value,msg){
	if(!value){
		msg=msg || (new String(value)+" == true");
		throw new Error("AssertionError: "+msg);
	}
};
assert.ifError=function ifError(err){
	if(err){
		throw err;
	}
};
assert.equal=function equal(actual, expected, msg){
	if(actual!=expected){
		msg=msg || (new String(actual)+" == "+new String(expected));
		throw new Error("AssertionError: "+msg);
	}
};
assert.deepEqual=function(actual, expected, msg){
	if(!deepEqual(actual, expected)){
		msg=msg || "deepEqual";
		throw new Error("AssertionError: "+msg);
	}
};
function deepEqual(actual, expected){
	if(typeof expected==="object"){
		var key;
		var actualKey=[];
		var expectedKey=[];
		for(key in actual){
			actualKey.push(key);
		}
		for(key in expected){
			expectedKey.push(key);
			if(key in actualKey){
				return deepEqual(actualKey[key],expectedKey[key]);
			}else{
				return false;
			}
		}
		if(expectedKey.length!==actualKey.length){
			return false;
		}
	}else{
		return actual==expected;
	}
}
assert.deepStrictEqual=function (actual, expected, msg){
	if(!deepStrictEqual(actual, expected)){
		msg=msg || "deepEqual";
		throw new Error("AssertionError: "+msg);
	}
}
function deepStrictEqual(actual, expected){
	if(typeof actual !== typeof expected){
		return false;
	}
	if(typeof expected==="object"){
		switch(deepStrictEqual.constructor){
			case String:
			case Number:
			case Boolean:
				if(actual.valueOf()!==expected.valueOf()){
					return false;
				}
		}
		var key;
		var actualKey=[];
		var expectedKey=[];
		for(key in actual){
			actualKey.push(key);
		}
		for(key in expected){
			expectedKey.push(key);
			if(key in actualKey){
				return deepStrictEqual(actualKey[key],expectedKey[key]);
			}else{
				return false;
			}
		}
		if(expectedKey.length!==actualKey.length){
			return false;
		}
	}else{
		return actual===expected;
	}
}
module.exports=assert;