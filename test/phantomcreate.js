var phantom=require('../node-phantom');
var assert=require('assert');

describe('Phantom Create',function(){
	this.timeout(5000);
	it('should have _phantom',function(done){
		phantom.create(function(error,ph){
		    assert.ok(ph._phantom.constructor.toString().match('function ChildProcess()'));
		    assert.ok(ph._phantom.pid > 0);
			ph.exit();
		    done();
		});
	});
});
