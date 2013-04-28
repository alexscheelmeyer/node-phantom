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

function bufferHash(buffer){
	var shasum=crypto.createHash('sha256');
	shasum.update(buffer);
	return shasum.digest('hex');
}

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head></head><body>Hello World</body></html>');
}).listen();

var verifyFilename=__dirname+'/files/verifyrender.png';

exports.testPhantomPageRenderBase64=function(beforeExit,assert){
	phantom.create(function(error,ph){
		assert.ifError(error);
		ph.createPage(function(err,page){
			assert.ifError(err);
			page.open('http://localhost:'+server.address().port,function(err,status){
				assert.ifError(err);
				assert.equal(status,'success');
				page.renderBase64('png',function(err, imagedata){
					assert.ifError(err);
					assert.equal(bufferHash(new Buffer(imagedata, 'base64')),fileHash(verifyFilename));
					server.close();
					ph.exit();
				});
			});
		});
	});
};