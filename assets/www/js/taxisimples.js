Configuration = {
  access_token: false,
  client_id: "APP_TESTE_01",
  client_secret: "APP_SECRET",
  server: "http://127.0.0.1:3000"
}

Oauth2 = {
  url_authenticate: Configuration.server+"/oauth2/authorize",
  callback_authenticate: document.location+"#/user/authorize_return",
  url_access_token: Configuration.server+"/oauth2/access_token",
  callback_access_token: document.location+"#/user/receive_access_token"
}


;(function($) {
  var app = $.sammy("#main",function() {
    this.get('#/', function() {
      if (Configuration.access_token){
        this.partial('view/login.html');
      } else {
        this.partial('view/login.html');
      }
    });
  });
    
  $(function() {
    app.run("#/")
  });
})(jQuery);
