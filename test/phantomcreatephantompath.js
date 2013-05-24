var phantom=require('../node-phantom');
var assert=require('assert');

describe('Phantom Create',function(){
	it('should change behavior on different phantomPath',function(done){
		phantom.create(function(error,ph){
			assert.equal(error,true);
			done();
		},{phantomPath:'___nonexistent___'});
	});
});