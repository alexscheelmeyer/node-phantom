//Released to the pubic domain.

var http=require('http');
var socketio=require('socket.io');
var child=require('child_process');

function callbackOrDummy(callback){
	if(callback===undefined)callback=function(){};
    return callback;
}

module.exports={
	create:function(callback){
		function spawnPhantom(port){
			var phantom=child.spawn('phantomjs',[__dirname + '/bridge.js',port]);
			phantom.stdout.on('data',function(data){
				return console.log('phantom stdout: '+data);
			});
			phantom.stderr.on('data',function(data){
				return console.warn('phantom stderr: '+data);
			});
			return phantom;
		};
		
		var server=http.createServer(function(request,response){
			response.writeHead(200,{"Content-Type": "text/html"});
			response.end('<html><head><script src="/socket.io/socket.io.js" type="text/javascript"></script><script type="text/javascript">\n\
				window.onload=function(){\n\
					var socket = new io.connect("http://" + window.location.hostname);\n\
					socket.on("cmd", function(msg){\n\
						alert(msg);\n\
					});\n\
					window.socket = socket;\n\
				};\n\
			</script></head><body></body></html>');
		}).listen();
		
		var port=server.address().port;
		var phantom=spawnPhantom(port);
		
		var cmds={};
		var cmdid=0;
		function request(socket,args,callback){
			args.splice(1,0,cmdid);
//			console.log('requesting:'+args);
			socket.emit('cmd',JSON.stringify(args));

			cmds[cmdid]={cb:callback};
			cmdid++;
		}
		
		var io=socketio.listen(server,{'log level':1});
		
		io.sockets.on('connection',function(socket){
			socket.on('res',function(response){
//				console.log(response);
				var id=response[0];
				var cmdId=response[1];
				switch(response[2]){
				case 'pageCreated':
					var pageProxy={
						open:function(url,callback){
							request(socket,[id,'pageOpen',url],callbackOrDummy(callback));
						},
						release:function(callback){
							request(socket,[id,'pageRelease'],callbackOrDummy(callback));
						},
						render:function(filename,callback){
							request(socket,[id,'pageRender',filename],callbackOrDummy(callback));
						},
						injectJs:function(url,callback){
							request(socket,[id,'pageInjectJs',url],callbackOrDummy(callback));
						},
						includeJs:function(url,callback){
							request(socket,[id,'pageIncludeJs',url],callbackOrDummy(callback));
						},
						sendEvent:function(event,x,y,callback){
							request(socket,[id,'pageSendEvent',event,x,y],callbackOrDummy(callback));
						},
						uploadFile:function(selector,filename,callback){
							request(socket,[id,'pageUploadFile',selector,filename],callbackOrDummy(callback));
						},
						evaluate:function(evaluator,callback){
							request(socket,[id,'pageEvaluate',evaluator.toString()],callbackOrDummy(callback));
						}
					};
					cmds[cmdId].cb(null,pageProxy);
					delete cmds[cmdId];
					break;
				case 'phantomExited':
					request(socket,[0,'exitAck']);
					server.close();
					cmds[cmdId].cb();
					delete cmds[cmdId];
					break;
				case 'pageJsInjected':
				case 'jsInjected':
					cmds[cmdId].cb(JSON.parse(response[3])===true ? null : true);
					delete cmds[cmdId];
					break;
				case 'pageOpened':
					if(cmds[cmdId]!==undefined){	//if page is redirected, the pageopen event is called again - we do not want that currently.
						cmds[cmdId].cb(null,response[3]);
						delete cmds[cmdId];
					}
					break;
				case 'pageEvaluated':
					cmds[cmdId].cb(null,JSON.parse(response[3]));
					delete cmds[cmdId];
					break;
				case 'pageReleased':
				case 'pageJsIncluded':
				case 'pageRendered':
				case 'pageEventSent':
				case 'pageFileUploaded':
					cmds[cmdId].cb(null);
					delete cmds[cmdId];
					break;
				default:
					console.error('got unrecognized response:'+response);
					break;
				}				
			});		

			var proxy={
				createPage:function(callback){					
					request(socket,[0,'createPage'],callbackOrDummy(callback));
				},
				injectJs:function(filename,callback){
					request(socket,[0,'injectJs',filename],callbackOrDummy(callback));
				},
				exit:function(callback){
					request(socket,[0,'exit'],callbackOrDummy(callback));
				}
			};
			
			callback(null,proxy);
		});
		
	}
};
