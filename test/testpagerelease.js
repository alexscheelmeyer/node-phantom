var phantom=require('../phantom-node');

exports.testPhantomPageRelease=function(beforeExit,assert){
	phantom.create(function(error,ph){
		assert.ifError(error);
		ph.createPage(function(err,page){
			assert.ifError(err);
			page.release(function(err){
				assert.ifError(err);
				ph.exit();
			});
		});
	});
};