//Released to the public domain.

var port=phantom.args[0];
var webpage=require('webpage');
var controlpage=webpage.create();


function respond(response){
//	console.log('responding:'+response);
	controlpage.evaluate('function(){socket.emit("res",'+JSON.stringify(response)+');}');
}

var pages={};
var pageId=1;

function setupPushNotifications(id, page) {
	var callbacks=['onAlert','onConfirm','onConsoleMessage','onError','onInitialized','onLoadFinished',
	               'onLoadStarted','onPrompt','onResourceRequested','onResourceReceived','onResourceError',
	               'onUrlChanged','onCallback'];
	function push(notification){
		controlpage.evaluate('function(){socket.emit("push",'+JSON.stringify(notification)+');}');
	}
	callbacks.forEach(function(cb) {
		page[cb]=function(parm){
			var notification=Array.prototype.slice.call(arguments);
			if((cb==='onResourceRequested')&&(parm.url.indexOf('data:image')===0)) return;

			push([id, cb, notification]);
		};
	});
}

controlpage.onAlert=function(msg){
	var request=JSON.parse(msg);
	var cmdId=request[1];
//	console.log(request);
	if(request[0]===0){
		switch(request[2]){
		case 'createPage':
			var id=pageId++;
			var page=webpage.create();
			pages[id]=page;
			setupPushNotifications(id, page);
			respond([id,cmdId,'pageCreated']);
			break;
		case 'injectJs':
			var success=phantom.injectJs(request[3]);
			respond([0,cmdId,'jsInjected',success]);
			break;
		case 'addCookie':
			phantom.addCookie(request[3]);
			respond([0,cmdId,'cookieAdded',success]);
			break;
		case 'exit':
			respond([0,cmdId,'phantomExited']); //optimistically to get the response back before the line is cut
			break;
		case 'exitAck':
			phantom.exit();
			break;
		default:
			console.error('unrecognized request:'+request);
			break;
		}
	}
	else{
		var id=request[0];
		var page=pages[id];
		switch(request[2]){
		case 'pageOpen':
			page.open(request[3]);
			break;
		case 'pageOpenWithCallback':
			page.open(request[3], function(status){
				respond([id, cmdId, 'pageOpened', status]);
			});
			break;
		case 'pageClose':
			page.close();
			respond([id,cmdId,'pageClosed']);
			break;
		case 'pageInjectJs':
			var result=page.injectJs(request[3]);
			respond([id,cmdId,'pageJsInjected',JSON.stringify(result)]);
			break;
		case 'pageIncludeJs':
			var alreadyGotCallback=false;
			page.includeJs(request[3], function(){
				if(alreadyGotCallback)return;
				respond([id,cmdId,'pageJsIncluded']);
				alreadyGotCallback=true;
			});
			break;
		case 'pageSendEvent':
			page.sendEvent(request[3],request[4],request[5]);
			respond([id,cmdId,'pageEventSent']);
			break;
		case 'pageUploadFile':
			page.uploadFile(request[3],request[4]);
			respond([id,cmdId,'pageFileUploaded']);
			break;
		case 'pageEvaluate':
			var result=page.evaluate.apply(page,request.slice(3));
			respond([id,cmdId,'pageEvaluated',JSON.stringify(result)]);
			break;
        case 'pageEvaluateAsync':
			page.evaluateAsync.apply(page,request.slice(3));
			respond([id,cmdId,'pageEvaluatedAsync']);
			break;
		case 'pageRender':
			page.render(request[3]);
			respond([id,cmdId,'pageRendered']);
			break;
		case 'pageRenderBase64':
			var result=page.renderBase64(request[3]);
			respond([id,cmdId,'pageRenderBase64Done', result]);
			break;
		case 'pageSet':
			page[request[3]]=request[4];
			respond([id,cmdId,'pageSetDone']);
			break;
		case 'pageGet':
			var result=page[request[3]];
			respond([id,cmdId,'pageGetDone',JSON.stringify(result)]);
			break;
		case 'pageSetFn':
			page[request[3]] = eval('(' + request[4] + ')')
			break;
		case 'pageSetViewport':
			page.viewportSize = {width:request[3], height:request[4]};
			respond([id,cmdId,'pageSetViewportDone']);
			break;
		default:
			console.error('unrecognized request:'+request);
			break;
		}
	}
	//console.log('command:'+parts[1]);
	return;
};

controlpage.onConsoleMessage=function(msg){
	return console.log('console msg:'+msg);
};

controlpage.open('http://127.0.0.1:'+port+'/',function(status){
	//console.log(status);
});
