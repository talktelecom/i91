define(function (){
    'use strict';

    var atendimentoAdapter = function (atendimentoClient, config) {
        
        var _this = {};
        
        var conn = $.hubConnection(config.url);

        conn.logging = config.isDevMode ? true : false;
        
        conn.qs = config; //access_token é lido a partir daqui
        
        _this.validToken = config.access_token ? true : false;
        
        var proxies = conn.createHubProxies();

        _this.hub = proxies.atendimentoHub;

        _this.atendimento = atendimentoClient || {};
        
         _this.statuses = {
            disconnected: 1,
            connecting: 2,
            connected: 3
        };
        
        _this.TipoDiscagem = {
            LigacaoExterna: 1,
            LigacaoRamal: 2,
            LigacaoRamalPabx: 3
        }

        _this.TiposMonitoracao =
        {
            // Falar apenas com o operador
            Sopro: "Sopro",

            // Falar com o operador e o cliente
            Conferencia: "Conferencia",

            // Apenas escuta a ligação.
            MonitorarConferencia: "MonitorarConferencia"
        }

        _this.StatusDiscagemExterno = {
            Desconhecido: -2,
            NaoAtende: -1,
            Ocupado: 0,
            Congestionamento: 1,
            Servico: 2,
            RamalDesligou: 3
        }

        _this.tryingToReconnect = false;
        _this.status = _this.statuses.disconnected;
        
        var checkTipoDiscagem = function (tipo) {
            if (tipo !== 1 && tipo !== 2) {
                return 0;
            }
            return tipo;
        };
        
        // busca a implementação do client do evento gerado no servidor
        var raiseInClient = function(functionName, argsArray)
        {
            var f = _this.atendimento[functionName];
            if(f)
            {
                f.apply(_this.atendimento, argsArray);
            }
        }
        
        //CONNECTION EVENTS
        _this.start = function (done,fail) {
            done = done || function(){};
            fail = fail || function(){};
            
            _this.retryTimeout = null;
            
            _this.validToken = config.access_token ? true : false;
            
            if(!_this.validToken)
            {
                console.log("Token invalido");
                return;
            }
            
            _this.status = _this.statuses.connecting;
            
            conn.start().done(done).fail(fail);
        };
        
        _this.retry = function retry() {
            if(!_this.retryTimeout)
            {
                _this.retryTimeout = setTimeout(_this.start, 5000);
            }
        };
        
        _this.stop = function () {
            _this.stopSolicited = true;
            _this.tryingToReconnect = false;
            _this.status = _this.statuses.disconnected;
            _this.hub.connection.stop();
        };

        _this.hub.connection.connectionSlow(function () {
            raiseInClient("connectionSlow");
        });

        _this.hub.connection.reconnecting(function () {
            _this.tryingToReconnect = true;
            raiseInClient("reconnecting");
        });

        _this.hub.connection.reconnected(function () {
            _this.tryingToReconnect = false;
            raiseInClient("reconnected");
        });

        _this.hub.connection.error(function (error) {
            console.log("connection.error");
            console.log(error);
            
            // se houve um erro na autenticação, marcar o token como inválido
            if(error.message.indexOf("Error during negotiation request") > -1)
            {
                _this.validToken = false;
                config.access_token = undefined;
            }
            
            raiseInClient("error");
        });

        _this.hub.connection.disconnected(function () {
            console.log("disconnected");
            
            _this.status = _this.statuses.disconnected;
            
            if (_this.hub.lastError)
            {
                console.log("Hub last error: ");
                console.log(_this.hub.lastError);
            }
            
            // se não conseguiu a reconexão automatica, entao tentamos reconectar
            if(!_this.stopSolicited)
            {
                _this.tryingToReconnect = false;
                
                _this.retry();
            }

            raiseInClient("disconnected");
        });

        //CLIENT EVENTOS SHOULD BE CALLED BY THE SERVER

        _this.hub.client.disconnect = function () {
            _this.stop();
        };

        _this.hub.client.connected = function (ramal) {
            console.log("CONNECTED");
            _this.status = _this.statuses.connected;
            raiseInClient("connected");
        };

        _this.hub.client.reconnecting = function () {
            raiseInClient("reconnecting");
        };

        _this.hub.client.atualizaStatusRamal = function (ramalStatus) {
            raiseInClient("atualizaStatusRamal", [ramalStatus]);
        };

        _this.hub.client.onDeslogado = function (ramal) {
            raiseInClient("onDeslogado");
        };

        //EVENTOS DE LOGON
        _this.hub.client.onLogado = function (ramal) {
            raiseInClient("onLogado", [ramal]);
        };

        _this.hub.client.onLogadoErro = function (ramal, erro) {
            raiseInClient("onLogadoErro", [ramal, erro]);
        };

        _this.hub.client.onConexaoErro = function (ramal, erro) {
            raiseInClient("onConexaoErro", [ramal, erro]);
        };

        //EVENTOS DE TELEFONIA
        _this.hub.client.onAtendido = function (ramal, chamada) {
            raiseInClient("onAtendido", [ramal, chamada]);
        };

        _this.hub.client.onMonitoraChamada = function (meuRamal, ramalMonitorado, tipoMonitoracao) {
            raiseInClient("onMonitoraChamada", [meuRamal, ramalMonitorado, tipoMonitoracao]);
        };

        _this.hub.client.onMonitoraChamadaErro = function (ramal, erro) {
            raiseInClient("onMonitoraChamadaErro", [ramal, erro]);
        };

        _this.hub.client.onEntrouEmConferencia = function (ramal, numero) {
            raiseInClient("onEntrouEmConferencia", [ramal, numero]);
        };
        
        _this.hub.client.onChamadaPerdida = function (ramal, chamada) {
            raiseInClient("onChamadaPerdida", [ramal, chamada]);
        };
        
        _this.hub.client.onChamada = function (ramal, chamada) {
            raiseInClient("onChamada", [ramal, chamada]);
        };

        _this.hub.client.onDesliga = function (ramal, origem) {
            raiseInClient("onDesliga", [ramal, origem]);
        };

        _this.hub.client.onDisca = function (ramal, numero) {
            raiseInClient("onDisca", [ramal, numero]);
        };

        _this.hub.client.onDiscaStatus = function (ramal, chamada, status) {
            raiseInClient("onDiscaStatus", [ramal, chamada, status]);
        };

        _this.hub.client.onDiscaErro = function (ramal, erro) {
            raiseInClient("onDiscaErro", [ramal, erro]);
        };

        _this.hub.client.onChamadaEntrouNaFila = function (ramal, chamada) {
            raiseInClient("onChamadaEntrouNaFila", [ramal, chamada]);
        };

        _this.hub.client.onChamadaSaiuDaFila = function (ramal, chamada) {
            raiseInClient("onChamadaSaiuDaFila", [ramal, chamada]);
        };

        //EVENTOS DE TRANSFERENCIA
        _this.hub.client.onChamadaTransferida = function (ramal) {
            raiseInClient("onChamadaTransferida", [ramal]);
        };

        _this.hub.client.onInicioEspera = function (ramal, chamada) {
            raiseInClient("onInicioEspera", [ramal, chamada]);
        };

        _this.hub.client.onTerminoEspera = function (ramal, chamada) {
            raiseInClient("onTerminoEspera", [ramal, chamada]);
        };

        //EVENTOS DE INTERVALO
        _this.hub.client.onInicioIntervalo = function () {
            raiseInClient("onInicioIntervalo");
        };

        _this.hub.client.onTerminoIntervalo = function () {
            raiseInClient("onTerminoIntervalo");
        };

        _this.hub.client.onInicioNaoDisponivel = function (ramal) {
            raiseInClient("onInicioNaoDisponivel");
        };

        _this.hub.client.onTerminoNaoDisponivel = function (ramal) {
            raiseInClient("onTerminoNaoDisponivel");
        };

        //EVENTOS DE CONFERENCIA
        _this.hub.client.onConferenciaInicio = function (ramal) {
            raiseInClient("onConferenciaInicio", [ramal]);
        };

        _this.hub.client.onConferenciaErro = function (ramal, erro) {
            raiseInClient("onConferenciaErro", [ramal, erro]);
        };

        _this.hub.client.onConferenciaTermino = function (ramal) {
            raiseInClient("onConferenciaTermino", [ramal]);
        };

        _this.hub.client.onConferenciaAtendido = function (ramal, chamada) {
            raiseInClient("onConferenciaAtendido", [ramal, chamada]);
        };

        _this.hub.client.onConferenciaDisca = function (ramal, chamada) {
            raiseInClient("onConferenciaDisca", [ramal, chamada]);
        };

        _this.hub.client.onConferenciaDiscaErro = function (ramal, erro) {
            raiseInClient("onConferenciaDiscaErro" , [ramal, erro]);
        };

        _this.hub.client.onConferenciaChamadaEncerrada = function (ramal, chamada) {
            raiseInClient("onConferenciaChamadaEncerrada", [ramal, chamada]);
        };
 
         //EVENTOS DE NOTIFICAÇÃO
        _this.hub.client.onNotificacao = function (notificao) {
            raiseInClient("onNotificacao", [notificao]);
        };
        
        
        // These are the methods that ARE CALLED BY THE CLIENT
        // Client functions should call these functions
        _this.server = {};

        _this.server.discar = function (numero, tipoDiscagem) {
            return _this.hub.server.discar(numero, checkTipoDiscagem(tipoDiscagem));
        };

        _this.server.atendeChamadaNaFila = function (canalId) {
            return _this.hub.server.atendeChamadaNaFila(canalId);
        };

        _this.server.capturaDirigida = function (numero) {
            return _this.hub.server.capturaDirigida(numero);
        };

        _this.server.transferir = function (numero, tipoDiscagem) {
            return _this.hub.server.transferir(numero, checkTipoDiscagem(tipoDiscagem));
        };

        _this.server.consultar = function (numero, tipoDiscagem) {
            return _this.hub.server.consultar(numero, checkTipoDiscagem(tipoDiscagem));
        };

        _this.server.liberarConsulta = _this.hub.server.liberarConsulta;

        _this.server.atender = _this.hub.server.atender;

        _this.server.desligar = _this.hub.server.desligar;

        _this.server.desligarChamada = function (canalId) {
            return _this.hub.server.desligarChamada(canalId);
        };
        
        _this.server.monitorarChamada = function (ramal, tipoMonitoracao) {
            return _this.hub.server.monitorarChamada(ramal, tipoMonitoracao);
        };

        _this.server.encerraMonitoracao = _this.hub.server.encerraMonitoracao;

        _this.server.deslogar = _this.hub.server.deslogar;

        _this.server.transfereVoiceMail = _this.hub.server.transfereVoiceMail;

        _this.server.iniciarIntervalo = _this.hub.server.iniciarIntervalo;

        _this.server.terminarIntervalo = _this.hub.server.terminarIntervalo;

        _this.server.iniciarNaoDisponivel = _this.hub.server.iniciarNaoDisponivel;

        _this.server.terminarNaoDisponivel = _this.hub.server.terminarNaoDisponivel;

        _this.server.conferenciaAdicionar = function (numero, tipoDiscagem) {
            return _this.hub.server.conferenciaAdicionar(numero, checkTipoDiscagem(tipoDiscagem));
        };

        // args: numero
        _this.server.conferenciaRemover = _this.hub.server.conferenciaRemover; // *function (numero) { _this.hub.server.conferenciaRemover(numero); }
        _this.server.conferenciaIniciar = _this.hub.server.conferenciaIniciar;
        _this.server.conferenciaTerminar = _this.hub.server.conferenciaTerminar;
        
        _this.server.iniciar = _this.hub.server.iniciar;

        _this.server.sigaMe = function (numero, tipoDiscagem) {
            return _this.hub.server.sigaMe(numero, checkTipoDiscagem(tipoDiscagem));
        };

        // args: numeros
        _this.server.sigaMeMultiplo = _this.hub.server.sigaMeMultiplo; //function (numeros) { _this.hub.server.sigaMeMultiplo(numeros); }

        _this.server.cancelaSigaMe = _this.hub.server.cancelaSigaMe;


        /// Chamar a função init apenas uma vez
        _this.init = function (done, fail) {
            
            //CONECTA COM O SIGNALR
            _this.start(done, fail);
        };



        return _this;
    };
    
    return atendimentoAdapter;
});