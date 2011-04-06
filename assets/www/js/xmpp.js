var Xmpp = function() { 

}

Xmpp.prototype.connect = function(options, success, fail) {
	return PhoneGap.exec(success,fail, 'XmppPlugin', 'Connect', [options.host,options.port]);
}

Xmpp.prototype.login = function(options, success, fail) {
	return PhoneGap.exec(success,fail, 'XmppPlugin', 'Login', [options.user,options.password]);
}

Xmpp.prototype.onMessage = function(success, fail) {
	return PhoneGap.exec(success,fail, 'XmppPlugin', 'OnMessage',[]);
}
Xmpp.prototype.send = function(options,success, fail) {
	return PhoneGap.exec(success,fail, 'XmppPlugin', 'SendMessage',[options.to,options.subject,options.body]);
}

PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin('xmpp', new Xmpp());
	PluginManager.addService("XmppPlugin","br.com.taxisimples.phonegap.plugins.XmppPlugin");
});


