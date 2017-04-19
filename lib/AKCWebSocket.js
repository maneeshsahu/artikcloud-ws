'use strict';

const WebSocket = require('ws');

function AKCWebSocket(){
    this.number = 0;    // Message number
    this.autoReconnectInterval = 5*1000;    // ms
}
AKCWebSocket.prototype.open = function(url){
    this.url = url;
    this.instance = new WebSocket(this.url);
    this.instance.on('open',()=>{
        this.onopen();
    });
    this.instance.on('message',(msg,flags)=>{
    	var message = JSON.parse(msg);
    	if (message.hasOwnProperty('error')) {
    		this.onerror(message.error);
    	} else if (message.hasOwnProperty('type')) {
    		switch (message.type) {
    		case 'ping': 
    			this.onping(message.ts);
    			break;
    		case 'message': 
    			this.onmessage(message, flags);
    			break;
    		case 'action':
    			this.onaction(message, flags);
    			break;
    		}
    	} else if (message.hasOwnProperty('data') && message.hasOwnProperty('mid')) {
    		this.onmessge(data, flags);
    	} else if (message.hasOwnProperty('data') && (message.data.hasOwnProperty('mid') || message.data.hasOwnProperty('code'))) {
    		this.onack(message, flags);
    	} else {
    		console.error("Invalid message: " + msg);
    	}
    });
    this.instance.on('close',(e)=>{
        switch (e){
        case 1000:  // CLOSE_NORMAL
            console.log("WebSocket: closed");
            break;
        default:    // Abnormal closure
            this.reconnect(e);
            break;
        }
        this.onclose(e);
    });
    this.instance.on('error',(e)=>{
        switch (e.code){
        case 'ECONNREFUSED':
            this.reconnect(e);
            break;
        default:
            this.onerror(e);
            break;
        }
    });
}
AKCWebSocket.prototype.sendMessage = function(sdid, ts, data, option){
    try{
    	var message = {
    		"sdid": sdid,
    		"ts": ts,
    		"data": data
    	}
    	
        this.instance.send(JSON.stringify(message),option);
    } catch (e){
        this.instance.emit('error',e);
    }
}
AKCWebSocket.prototype.registerChannel = function(sdid, token, cid) {
	try {
	    var registerMessage = {
	  	      "type": "register",
	  	      "sdid": sdid,
	  	      "Authorization": "bearer " + token,
	  	      "cid": cid
	  	    };
		this.instance.send(JSON.stringify(registerMessage), { mask: true})
	} catch (e) {
		this.instance.emit('error', e)
	}
}
AKCWebSocket.prototype.reconnect = function(e){
    console.log(`AKCWebSocket: retry in ${this.autoReconnectInterval}ms`,e);
    var that = this;
    setTimeout(function(){
        console.log("AKCWebSocket: reconnecting...");
        that.open(that.url);
    },this.autoReconnectInterval);
}
AKCWebSocket.prototype.onopen = function(e){ console.log("AKCWebSocket: open",arguments); }
AKCWebSocket.prototype.onmessage = function(data,flags){  console.log("AKCWebSocket: message",arguments);  }
AKCWebSocket.prototype.onaction = function(data,flags){  console.log("AKCWebSocket: message",arguments);  }
AKCWebSocket.prototype.onping = function(ts){  console.log("AKCWebSocket: message",arguments);  }
AKCWebSocket.prototype.onack = function(data,flags){  console.log("AKCWebSocket: message",arguments);  }

AKCWebSocket.prototype.onerror = function(e){    console.log("AKCWebSocket: error",arguments);    }
AKCWebSocket.prototype.onclose = function(e){    console.log("AKCWebSocket: closed",arguments);   }

module.exports = AKCWebSocket;