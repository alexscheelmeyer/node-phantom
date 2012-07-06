var http=require('http');
var phantom=require('../node-phantom');

var gotFile=false;
var server=http.createServer(function(request,response){
	if(request.url==='/upload'){
		request.on('data',function(buffer){
			gotFile=buffer.toString('ascii').indexOf('Hello World')>0;
		});
	}
	else{
		response.writeHead(200,{"Content-Type": "text/html"});
		response.end('<html><head></head><body><form id="testform" action="/upload" method="post" enctype="multipart/form-data"><input id="test" name="test" type="file"></form></body></html>');
	}
}).listen();

exports.testPhantomPageUploadFile=function(beforeExit,assert){
	phantom.create(function(error,ph){
		assert.ifError(error);
		ph.createPage(function(err,page){
			assert.ifError(err);
			page.open('http://localhost:'+server.address().port,function(err,status){
				assert.ifError(err);
				assert.equal(status,'success');
				page.uploadFile('input[name=test]',__dirname+'/files/uploadtest.txt',function(err){
					assert.ifError(err);
					page.evaluate(function(){
						document.forms['testform'].submit();
					},function(err,result){
						assert.ifError(err);
						setTimeout(function(){
							assert.ok(gotFile);
							server.close();
							ph.exit();
						},100);
					});
				});
			});
		});
	});
};