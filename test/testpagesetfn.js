var http = require('http');
var phantom = require('../node-phantom');

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head><script>console.log("handled on phantom-side")</script></head><body><h1>Hello World</h1></body></html>');
}).listen();

exports.testPhantomPageSetFn = function(beforeExit,assert) {
	var url = 'http://localhost:'+server.address().port+'/';
	phantom.create(errOr(function(ph){
		ph.createPage(errOr(function(page){
			var messageForwardedByOnConsoleMessage = undefined;
			var localMsg = undefined;
			page.onConsoleMessage = function(msg) { messageForwardedByOnConsoleMessage = msg; };
			page.setFn('onCallback', function(msg) { localMsg = msg; page.onConsoleMessage(msg); });
			page.open(url, errOr(function(){
				assert.isUndefined(localMsg);
				assert.equal(messageForwardedByOnConsoleMessage, "handled on phantom-side");
				server.close();
				ph.exit();
			}));
		}));
	}));

	function errOr(fn) {
		return function(err, res) {
			assert.ifError(err);
			fn(res);
		}
	}
};