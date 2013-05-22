var phantom=require('../node-phantom');
var assert=require('assert');

describe('Phantom Page',function(){
	this.timeout(5000);
	it('should be able to set and get properties',function(done){
		phantom.create(function(error,ph){
			assert.ifError(error);
			ph.createPage(function(err,page){
				assert.ifError(err);
				page.get('viewportSize',function(err,oldValue){
					assert.ifError(err);
					page.set('viewportSize',{width:800,height:600},function(err){
						assert.ifError(err);
						page.get('viewportSize',function(err,newValue){
							assert.ifError(err);
							assert.notEqual(oldValue,newValue);
							var rnd=Math.floor(100000*Math.random());
							page.set('zoomFactor',rnd,function(err){
								assert.ifError(err);
								page.get('zoomFactor',function(err,zoomValue){
									assert.ifError(err);
									assert.equal(zoomValue,rnd);
									page.get('settings',function(err,oldSettings){
										assert.ifError(err);
										page.set('settings',{'userAgent':'node-phantom tester'},function(err){
											assert.ifError(err);
											page.get('settings',function(err,newSettings){
												assert.ifError(err);
												assert.notEqual(oldSettings.userAgent,newSettings.userAgent);
												ph.exit();
												done();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});