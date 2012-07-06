var http=require('http');
var phantom=require('../node-phantom');

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head></head><body><h1>Hello World</h1></body></html>');
}).listen();

exports.testPhantomPageEvaluate=function(beforeExit,assert){
	phantom.create(function(error,ph){
		assert.ifError(error);
		ph.createPage(function(err,page){
			assert.ifError(err);
			page.open('http://localhost:'+server.address().port,function(err,status){
				assert.ifError(err);
				assert.equal(status,'success');
				page.evaluate(function(){
					return document.getElementsByTagName('h1')[0].innerText;
				},function(err,result){
					assert.ifError(err);
					assert.equal(result,'Hello World');
					server.close();
					ph.exit();
				});
			});
		});
	});
};