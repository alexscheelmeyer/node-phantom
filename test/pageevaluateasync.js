var http=require('http');
var phantom=require('../node-phantom');
var assert=require('assert');

var server=http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end('<html><head></head><body><h1>Hello World</h1></body></html>');
}).listen();

describe('Phantom Page',function(){
	this.timeout(5000);

	var _ph;
	var _page;
	before(function(done){
		phantom.create(function(error,ph){
			assert.ifError(error);
			_ph=ph;
			ph.createPage(function(err,page){
				assert.ifError(err);
				_page=page;
				page.open('http://localhost:'+server.address().port,function(err,status){
					assert.ifError(err);
					assert.equal(status,'success');
					done();
				});
			});
	    });		
	});
	
	it('should be able to evaluate async',function(done){
        _page.onCallback=function(result){
            assert.equal(result,'Hello World');
			done();
        };
		_page.evaluateAsync(function(){
			window.callPhantom(document.getElementsByTagName('h1')[0].innerText);
		});
	});

	it('should be able to evaluate async with args',function(done){
        _page.onCallback=function(result){
            assert.equal(result,'Hello World');
			done();
        };
		_page.evaluateAsync(function(elem){
			window.callPhantom(document.getElementsByTagName(elem)[0].innerText);
		},function(){},0,'h1');	//0 is time to wait before execution
	});
	
	after(function(){
	    server.close();
        _ph.exit();    	
	});
});