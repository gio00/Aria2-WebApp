safari.self.addEventListener("message", handleMessage, false);
function handleMessage(msgEvent) {
    	var messageName = msgEvent.name;
   		var j = msgEvent.message;
    	if (messageName === 'aria2c'){
    		var link = window.getSelection().anchorNode.parentNode.href
    		safari.self.tab.dispatchMessage("aria2c",link);
    		console.log(document.getSelection().anchorNode.parentNode.href);
    		console.log('handleMessage');
	}
}
