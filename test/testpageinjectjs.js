var http=require('http');
var phantom=require('../node-phantom');

var server=http.createServer(function(request,response){
	if(request.url==='/test.js'){
		console.log('gotten');
		response.writeHead(200,{"Content-Type": "text/javascript"});
		response.end('document.getElementsByTagName("h1")[0].innerText="Hello Test";');
	}
	else{
		response.writeHead(200,{"Content-Type": "text/html"});
		response.end('<html><head></head><body><h1>Hello World</h1></body></html>');
	}
	
}).listen();

exports.testPhantomPageEvaluate=function(beforeExit,assert){
	phantom.create(function(error,ph){
		assert.ifError(error);
		ph.createPage(function(err,page){
			assert.ifError(err);
			page.open('http://localhost:'+server.address().port,function(err,status){
				assert.ifError(err);
				assert.equal(status,'success');
				page.injectJs('test/files/modifytest.js',function(err){
					//no delay necessary because it should have been executed synchronously
					assert.ifError(err);
					page.evaluate(function(){
						return [document.getElementsByTagName('h1')[0].innerText,document.getElementsByTagName('script').length];
					},function(err,result){
						assert.ifError(err);
						assert.equal(result[0],'Hello Test');  //the script should have been executed
						assert.equal(result[1],0);             //it should not have added a new script-tag (see: https://groups.google.com/forum/?fromgroups#!topic/phantomjs/G4xcnSLrMw8)
						server.close();
						ph.exit();
					});
				});
			});
		});
	});
};