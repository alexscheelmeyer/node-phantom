var http=require('http');
var phantom=require('../node-phantom');
var assert=require('assert');

var server;
var testPage;

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
            done()
          });
        });
      });
    });

    it('should invoke the callback',function(done){
      testPage.setViewport({width: 20, height: 30}, function(err) {
        assert.ifError(err);
        done()
      });
    });

    after(function() {
      server.close();
      testPage = server = null;
    });
  });
});
