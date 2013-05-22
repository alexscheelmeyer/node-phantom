var http = require('http');
var phantom = require('../node-phantom');
var assert=require('assert');

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head><script>window.callPhantom({ msg: "callPhantom" }); conXsole.log("cause-an-error");</script></head><body><h1>Hello World</h1></body></html>');
}).listen();

describe('Phantom Page',function(){
	this.timeout(5000);
	it('should be able to push notifications',function(done){
		var url = 'http://localhost:'+server.address().port+'/';
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
						assert.equal(events.onLoadStarted.length, 1);
						assert.deepEqual(events.onUrlChanged,[url]);
						assert.equal(events.onResourceRequested.length, 1);
						assert.equal(events.onResourceReceived.length, 2);
						assert.equal(events.onResourceReceived[0].stage, 'start');
						assert.equal(events.onResourceReceived[1].stage, 'end');

						assert.deepEqual(events.onCallback, [{ msg: "callPhantom" }]);
						assert.deepEqual(events.onConsoleMessage, ['POW', 'WOW']);

						assert.equal(events.onError.length, 1);
						assert.equal(events.onError[0].length, 2);
						var err = events.onError[0];
						assert.ok(err[0].match(/variable: conXsole/));
						assert.equal(err[1][0].line, 1);

						events.onConsoleMessage = [];
						page.evaluate(function(a,b){
							console.log(a);
							console.log(b);
						}, errOr(function(){
							assert.deepEqual(events.onConsoleMessage, ['A', 'B']);

							ph.createPage(errOr(function(page){
								page.onLoadFinished = function(){
									server.close();
									ph.exit();
									done();
								};
								page.open(url);
							}));
						}), 'A', 'B');
					}));
				}));
			}));
		}));
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
});