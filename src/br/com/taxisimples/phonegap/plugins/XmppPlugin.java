package br.com.taxisimples.phonegap.plugins;

import org.jivesoftware.smack.ConnectionConfiguration;
import org.jivesoftware.smack.PacketListener;
import org.jivesoftware.smack.XMPPConnection;
import org.jivesoftware.smack.XMPPException;
import org.jivesoftware.smack.filter.PacketFilter;
import org.jivesoftware.smack.filter.PacketTypeFilter;
import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Packet;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public class XmppPlugin extends Plugin{

	private XMPPConnection conection;

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		
		try {
			switch (Action.valueOf(action)) {
				case Connect:
					connect(args);
					return new PluginResult(PluginResult.Status.OK);
				case Login:
					return login(args);
				case OnMessage:
					return onMessage(callbackId);
				case SendMessage:
					return sendMessage(args);
				default:
					return new PluginResult(PluginResult.Status.INVALID_ACTION);
			}
		} catch (JSONException e) {
			return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
		} catch (XMPPException e) {
			return new PluginResult(PluginResult.Status.ERROR,e.getMessage());
		}
	}

	private PluginResult sendMessage(JSONArray args) throws JSONException {
		Message msg = new Message();
		msg.setTo(args.getString(0));
		msg.setSubject(args.getString(1));
		msg.setBody(args.getString(2));
		
		this.conection.sendPacket(msg);
		return new PluginResult(PluginResult.Status.OK);
	}

	private PluginResult onMessage(final String callbackId) {
		PacketListener listener =  new PacketListener(){

			@Override
			public void processPacket(final Packet packet) {
				ctx.runOnUiThread(new Runnable () {
					public void run() {
						JSONObject jsonObject = FactoryJsonObject.create(packet);
						Log.i("XmppPlugin PhoneGap", "mensagem chegou:"+jsonObject.toString());
						PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject);
						result.setKeepCallback(true);
						XmppPlugin.this.success(result, callbackId);
					}});
			}

		};
		
		PacketFilter filter = new PacketTypeFilter(Message.class);
		
		this.conection.addPacketListener(listener, filter);		
		
		PluginResult r = new PluginResult(PluginResult.Status.NO_RESULT);
		r.setKeepCallback(true);
		return r;
		
	}

	private PluginResult login(JSONArray args) throws JSONException {
		try {
			this.conection.login(args.getString(0), args.getString(1));
			return new PluginResult(PluginResult.Status.OK);
		} catch (XMPPException e) {
			return new PluginResult(PluginResult.Status.ERROR,e.getMessage());
		} catch (JSONException e) {
			throw e;
		}
	}

	private void connect(JSONArray args) throws JSONException, XMPPException {
		ConnectionConfiguration config = new ConnectionConfiguration(args.getString(0), args.getInt(1));
		if (args.length()>3){
			config.setServiceName(args.getString(2));
		}
		this.conection = new XMPPConnection(config);
		this.conection.connect();
	}
	
}

enum Action {
	Connect, Login, OnMessage, SendMessage
}
