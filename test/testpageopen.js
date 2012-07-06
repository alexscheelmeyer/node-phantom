var http=require('http');
var phantom=require('../node-phantom');

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head></head><body>Hello World</body></html>');
}).listen();

exports.testPhantomPageOpen=function(beforeExit,assert){
	phantom.create(function(error,ph){
		assert.ifError(error);
		ph.createPage(function(err,page){
			assert.ifError(err);
			page.open('http://localhost:'+server.address().port,function(err,status){
				assert.ifError(err);
				assert.equal(status,'success');
				server.close();
				ph.exit();
			});
		});
	});
};