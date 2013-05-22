var http=require('http');
var phantom=require('../node-phantom');

var server=http.createServer(function(request,response){
	if(request.url==='/test.js'){
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
				page.includeJs('http://localhost:'+server.address().port+'/test.js',function(err){
					assert.ifError(err);
					setTimeout(function(){
						page.evaluate(function(){
							return [document.getElementsByTagName('h1')[0].innerText,document.getElementsByTagName('script').length];
						},function(err,result){
							assert.ifError(err);
							assert.equal(result[0],'Hello Test');  //the script should have been executed
							assert.equal(result[1],1);             //it should have added a new script-tag (see: https://groups.google.com/forum/?fromgroups#!topic/phantomjs/G4xcnSLrMw8)
							server.close();
							ph.exit();
						});
					},500);	//delay this to make sure the script has been executed
				});
			});
		});
	});
};