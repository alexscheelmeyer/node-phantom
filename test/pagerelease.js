var phantom=require('../node-phantom');
var assert=require('assert');

describe('Phantom Page',function(){
	this.timeout(5000);
	it('should be able to release',function(done){
		phantom.create(function(error,ph){
			assert.ifError(error);
			ph.createPage(function(err,page){
				assert.ifError(err);
				page.close(function(err){
					assert.ifError(err);
					ph.exit();
					done();
				});
			});
		});
	});
});