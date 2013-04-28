var http = require('http');
var phantom = require('../node-phantom');

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head><script>window.callPhantom({ msg: "callPhantom" }); conXsole.log("cause-an-error");</script></head><body><h1>Hello World</h1></body></html>');
}).listen();

exports.testPhantomPagePushNotifications = function(beforeExit,assert) {
	var url = 'http://localhost:'+server.address().port+'/';
	var onLoadFinishedFired = false;
	phantom.create(errOr(function(ph){
		ph.createPage(errOr(function(page){
			var events = registerCallbacks(page);

			page.open(url, errOr(function(status){
				assert.equal(status,'success');
				page.evaluate(function(){
					console.log('POW');
					console.log('WOW');
				},errOr(function() {
					//console.log(events);
					assert.eql(events.onLoadStarted.length, 1);
					assert.eql(events.onUrlChanged,[url]);
					assert.eql(events.onResourceRequested.length, 1);
					assert.eql(events.onResourceReceived.length, 2);
					assert.eql(events.onResourceReceived[0].stage, 'start');
					assert.eql(events.onResourceReceived[1].stage, 'end');

					assert.eql(events.onCallback, [{ msg: "callPhantom" }]);
					assert.eql(events.onConsoleMessage, ['POW', 'WOW']);

					assert.eql(events.onError.length, 1);
					assert.eql(events.onError[0].length, 2);
					var err = events.onError[0];
					assert.match(err[0], /variable: conXsole/);
					assert.equal(err[1][0].line, 1);

					events.onConsoleMessage = [];
					page.evaluate(function(a,b){
						console.log(a);
						console.log(b);
					}, errOr(function(){
						assert.eql(events.onConsoleMessage, ['A', 'B']);

						ph.createPage(errOr(function(page){
							page.onLoadFinished = function(){
								onLoadFinishedFired = true;
								server.close();
								ph.exit();
							};
							page.open(url);
						}));
					}), 'A', 'B');
				}));
			}));
		}));
	}));

	beforeExit(function(){
		assert.eql(onLoadFinishedFired, true);
	});

	function registerCallbacks(page) {
		var events = {};
		var callbacks = [
		                 'onAlert','onConfirm','onConsoleMessage','onError', 'onInitialized',/*'onLoadFinished',*/
		                 'onLoadStarted','onPrompt', 'onResourceRequested','onResourceReceived','onUrlChanged',
		                 'onCallback'
		];
		callbacks.forEach(function(cb) {
			page[cb] = function(evt) {
				if (!events[cb]) events[cb] = [];
				events[cb].push(evt);
			};
		});
		return events;
	}

	function errOr(fn) {
		return function(err, res) {
			assert.ifError(err);
			fn(res);
		};
	}
};