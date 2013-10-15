var http=require('http');
var phantom=require('../node-phantom');
var assert=require('assert');
var fs = require('fs');
var path = require('path');
var PNG = require('pngjs').PNG;

var server;
var testPage;

function testRenderLocation() {
  return path.normalize(__dirname + "/testSetViewport.png");
}

describe('Phantom Page',function(){
  describe('setting viewport',function(){
    this.timeout(5000);
    before(function(done){
      server = http.createServer(function(request,response){
        response.end('<html><body>Hello</body></html>')
      }).listen();

      phantom.create(function(error,ph){
        assert.ifError(error);
        ph.createPage(function(err,page){
          assert.ifError(err);
          page.open('http://localhost:'+server.address().port, function(err,status) {
            assert.ifError(err);
            assert.equal(status,'success');
            testPage = page;
            done();
          });
        });
      });
    });

    it('should invoke the callback',function(done){
      testPage.setViewport({width: 200, height: 300}, function(err) {
        assert.ifError(err);
        done();
      });
    });

    it('should set the size of the viewport as seen when rendered to a file',function(done){
      testPage.setViewport({width: 250, height: 350}, function(err) {
        testPage.render(testRenderLocation(), function(err) {
          assert.ifError(err);
          fs.createReadStream(testRenderLocation())
          .pipe(new PNG())
          .on('parsed', function() {
            assert.equal(this.width, 250);
            assert.equal(this.height, 350);
            done();
          });
        });
      });
    });

    after(function() {
      server.close();
      testPage = server = null;
      fs.existsSync(testRenderLocation()) && fs.unlinkSync(testRenderLocation());
    });
  });
});
