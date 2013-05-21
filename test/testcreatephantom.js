var phantom=require('../node-phantom');

exports.testPhantomCreate=function(beforeExit,assert) {
  phantom.create(function(error,ph){
    assert.ok(ph._phantom.constructor.toString().match('function ChildProcess()'));
    assert.ok(ph._phantom.pid > 0);
    ph.exit();
  });
};
