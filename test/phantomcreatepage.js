var phantom=require('../node-phantom');
var assert=require('assert');

describe('Phantom Create Page',function(){
	this.timeout(5000);
	it('should not indicate error',function(done){
		phantom.create(function(error,ph){
			assert.ifError(error);
			ph.createPage(function(err,page){
				assert.ifError(err);
				ph.exit();
				done();
			});
		});
	});
});