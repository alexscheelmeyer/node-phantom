var http=require('http');
var phantom=require('../node-phantom');
var assert=require('assert');

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head></head><body><button onclick="document.getElementsByTagName(\'h1\')[0].innerText=\'Hello Test\';">Test</button><h1>Hello World</h1></body></html>');
}).listen();

describe('Phantom Page',function(){
	this.timeout(5000);
	it('should be able to send event',function(done){
		phantom.create(function(error,ph){
			assert.ifError(error);
			ph.createPage(function(err,page){
				assert.ifError(err);
				page.open('http://localhost:'+server.address().port,function(err,status){
					assert.ifError(err);
					assert.equal(status,'success');
					page.sendEvent('click',30,20,function(err){
						assert.ifError(err);
						page.evaluate(function(){
							return document.getElementsByTagName('h1')[0].innerText;
						},function(err,result){
							assert.ifError(err);
							assert.equal(result,'Hello Test');
							server.close();
							ph.exit();
							done();
						});
					});
				});
			});
		});
	});
});