var Configuration = {
	authenticated : false,
	user: false,
	password: false,
	account_service : "chamartaxi@jabber.org"
}
var ultima_corrida;
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();

var recebeMensagens = function (mensagem) {
	switch (mensagem.subject) {
	case "new_cab_request":
		nova_corrida(JSON.parse(mensagem.body))
		break;
	case "apply_cab_response":
		nova_resposta(JSON.parse(mensagem.body))
		break;
	default:
		console.log("mensagem nao reconhecida: " + JSON.stringify(mensagem))
		break;
	}
}

var alertar = function(){
	navigator.notification.beep(2);
	navigator.notification.vibrate(1000);
}

var nova_resposta = function(resposta) {
	alertar();
	if (resposta.status=="winner") {
		alert("Você ganhou a corrida!")
		var request = {
			origin: markerMe.getPosition(),
			destination: new google.maps.LatLng(resposta.dest.lat/1,resposta.dest.lng/1),
			waypoints: 
			[
			    {
			    	location:new google.maps.LatLng(resposta.origin.lat/1,resposta.origin.lng/1),
			    	stopover:true
			    }
			],
			provideRouteAlternatives: false,
			travelMode: google.maps.DirectionsTravelMode.DRIVING,
			unitSystem: google.maps.DirectionsUnitSystem.METRIC
		}
		directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
		    	directionsDisplay.setDirections(result);
		    	ignorarUltimaCorrida();
		    }
		});
	} else {
		alert("Você perdeu a corrida")
		ignorarUltimaCorrida();
	}
}

var aceitarUltimaCorrida = function() {
	var options = {
		to : Configuration.account_service,
		subject : 'apply_cab_resquest',
		body : JSON.stringify({id:ultima_corrida.id})
	}
	window.plugins.xmpp.send(options, function(success) {
		console.log("solicitação para aceitar corrida enviada")
	}, function(fail) {
		alert("falha ao tentar aceitar corrida");
	});
}

var ignorarUltimaCorrida = function() {
	$("#corrida").hide();
	$("#map_canvas").show();
	ultima_corrida.marker.setMap(null);
	// setMapCenter(markerMe.getPosition)
	document.location.hash = '#/show_map';
}

var nova_corrida = function (corrida) {
	var latlng = new google.maps.LatLng(corrida.lat,corrida.lng);
	var marker = new google.maps.Marker({
	      position: latlng, 
	      map: map, 
	      title:corrida.client.name
	  })
	corrida.marker = marker;
	setTimeout(function(){
		marker.setMap(null);
	},4*60*1000)
	
	alertar();
	                       
	google.maps.event.addListener(marker, 'click', function() {
		ultima_corrida = corrida;		
		document.location.hash = '#/show/last';
	});
}

var atualizaPosicao = function(lat, lng) {
	var position = {
		lat : lat,
		lng : lng
	}
	
	setMapCenter(lat,lng);
	
	var options = {
		to : Configuration.account_service,
		subject : 'new_cab_position',
		body : JSON.stringify(position)
	}
	window.plugins.xmpp.send(options, function(success) {
		console.log("Posição Atualizada")
	}, function(fail) {
		alert("falha na atualizacao da posicao");
	});
}

var connection_options = {
	host : 'jabber.org',
	port : 5222
}
var onMessage = function() {
	window.plugins.xmpp.onMessage(recebeMensagens, function(fail) {
		alert("onMessage failed: " + fail);
	});
}
var map=null;
var markerMe = null;

var setMapCenter = function(lat,lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    markerMe.setPosition(latlng)
    map.setCenter(latlng);
}


var showMap = function() {
	console.log("inicializando mapa")
	var latlng;
	latlng = new google.maps.LatLng(-34.397, 150.644);
	var myOptions = {
      zoom: 15,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
        myOptions);
    directionsDisplay.setMap(map);
    markerMe = new google.maps.Marker({
        position: latlng, 
        map: map, 
        title:"Eu"
    });
    console.log("deveria mostrar map")
}

var app = $.sammy("#main", function() {
	
	this.use('Template');
	
	
	this.get('#/', function() {
		console.log("antes de rotear: "+Configuration.authenticated);
		if (Configuration.authenticated) {
			document.location.hash = '#/autenticado';
		} else {
			this.partial('view/login.html').then(function(){
				if (Configuration.user && Configuration.password){
					$("#user").val(Configuration.user);
					$("#password").val(Configuration.password);
					$("#login_form").submit();
				}
			});
		}
	});
	
	this.get('#/show/last', function(context) {
		$("#map_canvas").hide();
		this.corrida=ultima_corrida;
		this.partial('view/corrida.template');
	});
	
	this.get("#/autenticado",function(){
		this.partial('view/corridas.html').then(function(){
			showMap();				
		});
	});
	
	this.post('#/login', function(context) {
		
		var login_options = {
			user : this.params["user"],
			password : this.params["password"]
		}



		var login = function() {
			window.plugins.xmpp.login(login_options, function(success) {
				console.log("antes da autenticaçao: "+Configuration.authenticated);
				Configuration.authenticated = true;
				document.location.hash = '#/autenticado';
				
				window.localStorage.setItem("user", login_options.user);
				window.localStorage.setItem("password", login_options.password);
				
				onMessage();
				var watchID = navigator.geolocation.watchPosition(
						function(position) {
							atualizaPosicao(position.coords.latitude,position.coords.longitude)
						}, function(error) {
							alert(error.message);
						}, {
							frequency : 3000
						});

			}, function(fail) {
				alert("login failed: " + fail);
			});
		}

		window.plugins.xmpp.connect(connection_options, function(success) {
			login();
		}, function(fail) {
			alert("connect failed, please check your network connection ");
		});

	});

});

var startApp = function() {
	document.addEventListener("deviceready", function() {
		Configuration.password = window.localStorage.getItem("password");
		Configuration.user = window.localStorage.getItem("user");
		app.run("#/");
	}, false);
}