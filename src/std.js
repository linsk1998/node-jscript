
(function(){
	process.stdin={

	}
	process.stdout={
		write: function (message) {
			WScript.StdOut.Write(message);
		}
	};
	process.stderr={
		write: function (message) {
			WScript.StdErr.Write(message);
		}
	};
})();