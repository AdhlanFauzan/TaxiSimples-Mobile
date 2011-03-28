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
        this.partial('view/main_menu.html');
      } else {
        this.partial('view/personal_info.html');
      }
    });
    
    this.post('#/user/confirm_pin', function(context) {
      url = Oauth2.url_access_token;
      params = {
          client_id: Configuration.client_id,
          client_secret: Configuration.client_secret,
          grant_type: 'authorization_code',
          code: this.params["pin_code"]
      }
      
      $.ajax({
        url: url,
        type: "GET",
        data: params,
        dataType: "jsonp",
        success: function(data) {
          if (data.meta.code==200){
            Configuration.access_token=data.response.access_token;
            document.location.hash='#/';
          } else {
            alert("Codigo PIN não foi validado");
          }
        }
      });
    });
    
    this.get("#/user/confirm_pin",function(context){
      context.partial("view/confirm_pin.html");
    });
    
    this.post('#/user/authorize', function(context) {
      url = Oauth2.url_authenticate;
      params = {
          client_id: Configuration.client_id,
          response_type: "code",
          passenger_phone: this.params["client_phone"],
          passenger_name: this.params["client_name"]
      }
      $.ajax({
        url: url,
        type: "GET",
        data: params,
        dataType: "jsonp",
        success: function(data) {
          switch (data.meta.code){
            case 401:
              document.location.hash='#/user/confirm_pin';
              break;
            case 400:
              if (data.meta.error_enum=='invalid_phone') {
                alert('Numero de telefone invalido');
                break;
              } else if (data.meta.error_enum=='invalid_name') {
                alert('Nome muito curto');          
                break;
              }
            default:
              alert('Um erro inesperado ocorreu, contacte o suporte da aplicação');
              break;
          }
        }
      });
    });
    
  });

  $(function() {
    app.run("#/")
  });
})(jQuery);
