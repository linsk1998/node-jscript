

console.log(__filename);
console.log(__dirname);

console.log("console.log");
console.error("console.error");
console.info("console.info");
console.warn("console.warn");
console.assert(false, "error")
console.log(process.cwd());
console.log(process.execPath);
console.log(process.exitCode);


var assert = require('assert');
assert.ok(true);
// 测试通过。
assert.ok(1);
// 测试通过。
assert.deepStrictEqual(new String('foo'), 'foo');