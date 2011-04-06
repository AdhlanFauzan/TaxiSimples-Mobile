package br.com.taxisimples.phonegap.plugins;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Message.Body;
import org.jivesoftware.smack.packet.Packet;
import org.jivesoftware.smack.packet.XMPPError;
import org.json.JSONObject;

public class FactoryJsonObject {

	
	public static JSONObject create(Packet packet) {
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("from", packet.getFrom());
		data.put("packet_id", packet.getPacketID());
		data.put("to", packet.getTo());
		data.put("error", create(packet.getError()));
		data.put("properties", create(packet.getPropertyNames(),packet));
		if (packet instanceof Message){
			create((Message)packet,data);
		}
		return new JSONObject(data);
	}
	
	private static JSONObject create(Message packet, Map<String, Object> data) {
		data.put("from", packet.getFrom());
		data.put("packet_id", packet.getPacketID());
		data.put("to", packet.getTo());
		data.put("bodies",create(packet.getBodies()));
		data.put("languages",packet.getBodyLanguages());
		data.put("body", packet.getBody());
		data.put("subject", packet.getSubject());
		data.put("error", create(packet.getError()));
		data.put("properties", create(packet.getPropertyNames(),packet));
		return new JSONObject(data);
	}

	private static Object create(Collection<Body> bodies) {
		Map<String, Object> data = new HashMap<String, Object>();
		for (Body body : bodies) {
			data.put(body.getLanguage(), body.getMessage());
		}
		return new JSONObject(data);
	}
	private static Object create(Collection<String> propertyNames, Packet packet) {
		Map<String, Object> data = new HashMap<String, Object>();
		for (String property : propertyNames) {
			data.put(property, packet.getProperty(property));
		}
		return new JSONObject(data);
	}

	private static Object create(XMPPError error) {
		if (error == null){
			return new JSONObject();
		}
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("code", error.getCode());
		data.put("condition", error.getCondition());
		data.put("message", error.getMessage());
		return new JSONObject(data);
	}

}
