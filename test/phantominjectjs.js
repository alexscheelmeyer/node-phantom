var phantom=require('../node-phantom');
var assert=require('assert');

describe('Phantom',function(){
	this.timeout(5000);
	it('should be able to inject js',function(done){
		phantom.create(function(error,ph){
			assert.ifError(error);
			ph.injectJs('test/files/injecttest.js',function(err){
				assert.ifError(err);
				ph.exit();
				done();
			});
		});
	});
});