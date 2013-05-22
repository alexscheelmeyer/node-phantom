var http=require('http');
var phantom=require('../node-phantom');
var fs=require('fs');
var crypto = require('crypto');

function fileHash(filename){
	var shasum=crypto.createHash('sha256');
	var f=fs.readFileSync(filename);
	shasum.update(f);
	return shasum.digest('hex');
}

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head></head><body>Hello World</body></html>');
}).listen();

var testFilename=__dirname+'/files/testrender.png';
var verifyFilename=__dirname+'/files/verifyrender.png';

exports.testPhantomPageRender=function(beforeExit,assert){
	phantom.create(function(error,ph){
		assert.ifError(error);
		ph.createPage(function(err,page){
			assert.ifError(err);
			page.open('http://localhost:'+server.address().port,function(err,status){
				assert.ifError(err);
				assert.equal(status,'success');
				page.render(testFilename,function(err){
					assert.ifError(err);
					assert.equal(fileHash(testFilename),fileHash(verifyFilename));
					fs.unlinkSync(testFilename); //clean up the testfile
					server.close();
					ph.exit();
				});
			});
		});
	});
};