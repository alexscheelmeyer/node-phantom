var phantom=require('../node-phantom');

exports.testPhantomPageRelease=function(beforeExit,assert){
	phantom.create(function(error,ph){
		assert.ifError(error);
		ph.createPage(function(err,page){
			assert.ifError(err);
			page.close(function(err){
				assert.ifError(err);
				ph.exit();
			});
		});
	});
};