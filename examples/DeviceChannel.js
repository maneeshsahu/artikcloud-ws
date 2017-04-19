const ArtikWebSocket = require("../lib/AKCWebSocket");

function getTimeMillis(){
    return parseInt(Date.now().toString());
}

var sdid = "292664c791d648e4a54c764f89f4ab43",
	token = "e5f618546e044dcca882508749f44230";
var cid = getTimeMillis() + "";

var wsc = new ArtikWebSocket();
wsc.open('wss://api.artik.cloud/v1.1/websocket?ack=true');
wsc.onopen = function(e){
  console.log("Registering device on the WebSocket connection " );
  try{
    var registerMessage = {
      "type": "register",
      "sdid": sdid,
      "Authorization": "bearer " + token,
      "cid": cid
    };
    wsc.registerChannel(sdid, token, cid);
    
  }
  catch (e) {
      console.error('Failed to register messages. Error in registering message: ' + e.toString());
  }
}
wsc.onack = function(data, flags) {
	console.log("ArtikWebSocket ack: ", data);
}
wsc.onmessage = function(data,flags){
    console.log("ArtikWebSocket message: ",data);
}
wsc.onping = function(ts) {
	console.log("ArtikWebSocket ping: " + ts);
}