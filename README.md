# Integração i91

A api de integração do i91 possui um conjunto de métodos que facilitam a integração. 


## Configuração

Para utilizar a api de integração você precisa fazer a referência do java script abaixo em seu site.


```html
  <script src="~/Scripts/jquery-2.1.4.min.js"></script>
  <script src="~/Scripts/jquery.signalR.min.js"></script>
  <script src="~/Scripts/server.js"></script>
  <script src="~/Scripts/require.min.js" data-main="Scripts/atendimentoService.js"></script>

```

## Função para obter IP da máquina
```javascript
function setIpLocal() {
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                var pc = new RTCPeerConnection({
                iceServers: []
                }), noop = function() {};
                pc.createDataChannel(""); //create a bogus data channel
                pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
                pc.onicecandidate = function(ice) { //listen for candidate events
                if (!ice || !ice.candidate || !ice.candidate.candidate) return;
                var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
 
                //Colocar o ip no textbox
                $("#ipInput").val(myIP);
 
                pc.onicecandidate = noop;
                };
  };
```


## Função para Logar Ramal
```javascript
$("#loginSubmit").click(function () {  
    login($("#usernameInput").val(), $("#passwordInput").val()).then(conectarSignalR).catch(loginError);
});
```


## Evento recebendo chamada
```javascript
 service.onChamada = function (ramal, chamada) {
   console.log('Recebendo chamada do número ' + chamada.Telefone);
 };
 ```
 
## Evento de chamada Atendida
```javascript
 service.onAtendido = function (ramal, chamada) {
   console.log('Recebendo chamada do número ' + chamada.Telefone);
   console.log('ID Ligação ' + chamada.LigacaoId);
 };
 ```



