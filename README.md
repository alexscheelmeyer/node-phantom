Node-phantom
---------------

This is a bridge between [PhantomJs](http://phantomjs.org/) and [Node.js](http://nodejs.org/).

It is very much similar to the other bridge available, [PhantomJS-Node](https://github.com/sgentle/phantomjs-node), but is different in a few ways:

  - Way fewer dependencies/layers.
  - API has the idiomatic error indicator as first parameter to callbacks.
  - Uses plain Javascript instead of Coffeescript.


Requirements
------------
You will need to install PhantomJS first. The bridge assumes that the "phantomjs" binary is available in the PATH.

The only other dependency for using it is [socket.io](http://socket.io/).

For running the tests you will need [Mocha](http://visionmedia.github.io/mocha/). The tests require PhantomJS 1.6 or newer to pass.


Installing
----------

    npm install node-phantom


Usage
-----
You can use it pretty much like you would use PhantomJS-Node, for example this is an adaptation of a [web scraping example](http://net.tutsplus.com/tutorials/javascript-ajax/web-scraping-with-node-js/) :

```javascript
var phantom=require('node-phantom');
phantom.create(function(err,ph) {
  return ph.createPage(function(err,page) {
    return page.open("http://tilomitra.com/repository/screenscrape/ajax.html", function(err,status) {
      console.log("opened site? ", status);
      page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
        //jQuery Loaded.
        //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
        setTimeout(function() {
          return page.evaluate(function() {
            //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
            var h2Arr = [],
            pArr = [];
            $('h2').each(function() {
              h2Arr.push($(this).html());
            });
            $('p').each(function() {
              pArr.push($(this).html());
            });

            return {
              h2: h2Arr,
              p: pArr
            };
          }, function(err,result) {
            console.log(result);
            ph.exit();
          });
        }, 5000);
      });
	});
  });
});
```

### phantom.create(callback,options)

`options` is an optional object with options for how to start PhantomJS.
`options.parameters` is an array of parameters that will be passed to PhantomJS on the commandline.
For example

```javascript
phantom.create(callback,{parameters:{'ignore-ssl-errors':'yes'}})
```

will start phantom as:

```bash
phantomjs --ignore-ssl-errors=yes
```

You may also pass in a custom path if you need to select a specific instance of PhantomJS or it is not present in PATH environment.
This can for example be used together with the [PhantomJS package](https://npmjs.org/package/phantomjs) like so:

```javascript
phantom.create(callback,{phantomPath:require('phantomjs').path})
```

### Working with the API

Once you have the phantom instance you can use it much as you would the real PhantomJS, node-phantom tries to mimic the api.

An exception is that since this is a wrapper that does network communication to control PhantomJS, _all_ methods are asynchronous and
with a callback even when the PhantomJS version is synchronous.

Another notable exception is the page.evaluate method (and page.evaluateAsync method) that since PhantomJS 1.6 has a provision for extra arguments
to be passed into the evaluated function. In the node-phantom world these arguments are placed _after_ the callback. So the
order is evaluatee, callback, optional arguments. In code it looks like :

```javascript
page.evaluate(function(s){
	return document.querySelector(s).innerText;
},function(err,title){
	console.log(title);
},'title');
```


You can also have a look at the test folder to see some examples of using the API.

Other
-----
Made by Alex Scheel Meyer. Released to the public domain.

