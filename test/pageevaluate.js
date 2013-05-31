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
				page.open('http://localhost:'+server.address().port,function(err,status){
					assert.ifError(err);
					assert.equal(status,'success');
					_page=page;
					done();
				});
			});
		});
	});
	
	it('should be able to evaluate',function(done){
		_page.evaluate(function(){
			return document.getElementsByTagName('h1')[0].innerText;
		},function(err,result){
			assert.ifError(err);
			assert.equal(result,'Hello World');
			done();
		});
	});
	
	it('should be able to evaluate with args',function(done){
		_page.evaluate(function(elem){
			return document.getElementsByTagName(elem)[0].innerText;
		},function(err,result){
			assert.ifError(err);
			assert.equal(result,'Hello World');
			done();
		},'h1');
	});
	
	
	after(function(){
		server.close();
		_ph.exit();
	});
	
});