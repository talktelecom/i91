$(function () {
    require(['atendimentoAdapterService'], function (atendimentoAdapterService) {
        'use strict';

        //GET IP Local
        function setIpLocal() {
            window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
            var pc = new RTCPeerConnection({ iceServers: [] }), noop = function () { };
            pc.createDataChannel("");    //create a bogus data channel
            pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
            pc.onicecandidate = function (ice) {  //listen for candidate events
                if (!ice || !ice.candidate || !ice.candidate.candidate) return;
                var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];

                //Set IP Input Text
                $("#ipInput").val(myIP);

                pc.onicecandidate = noop;
            };
        };

        setIpLocal();

        $("#usernameInput").val(localStorage.getItem("login"));
        $("#passwordInput").val(localStorage.getItem("senha"));

        // desenv
        //var urlBase = "http://localhost";
        //var urlToken = urlBase + ':51635/oauth2/access_token';
        //var urlApi = urlBase + ':51635/api/';

        var urlBase = "http://atlantis";
        var urlToken = urlBase + ':5656/Service/oauth2/access_token';
        var urlApi = urlBase + ':5656/Service/api/';


        var clientId = "914f0508cf";

        var service = {};

        var config = {
            url: urlBase + ':8102/middleware',  // url do Middleware de Telefonia
            access_token: "",   // access token retornado da webApi
            refresh_token: "", // refresh token retornado da webApi
            isDevMode: false     // quando true, mostra os logs do signalR
        }
        var adapter = undefined;


        $("#alertError").hide();

        var loginError = function () {
            $("#loading").hide();
            $("#alertError").show();
        };

        $("#loginSubmit").click(function () {

            localStorage.setItem("login", $("#usernameInput").val());
            localStorage.setItem("senha", $("#passwordInput").val());

            $("#loading").show();
            login($("#usernameInput").val(), $("#passwordInput").val()).then(conectarSignalR).catch(loginError);
            return false;
        });

        /* Aceitar apenas números */
        $('#discarInput').keypress(function (event) {
            var tecla = (window.event) ? event.keyCode : event.which;
            if ((tecla > 47 && tecla < 58)) return true;
            else {
                if (tecla != 8) return false;
                else return true;
            }
        });

        $("#btnDiscar").click(function () {
            var numero = $("#discarInput").val();

            if (!numero) {
                alert('Número inválido');
                return;
            }

            if (numero.length > 4) {
                $("#externoCheckbox").prop("checked", true);
            }

            var tipoDiscagem = $("#externoCheckbox").is(":checked") ? adapter.TipoDiscagem.LigacaoExterna : adapter.TipoDiscagem.LigacaoRamal;

            mostrarRealizandoChamada({}, numero);
            adapter.server.discar(numero, tipoDiscagem);

            return false;
        });

        function salvaAccessToken(tokenData) {
            if (tokenData) {
                config.access_token = tokenData.access_token;
                config.refresh_token = tokenData.refresh_token;
            }
            return tokenData;
        }

        function login(username, password) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: urlToken,
                    type: 'POST',
                    data: {
                        grant_type: "password",
                        username: username,
                        password: password,
                        client_id: clientId
                    }
                }).done(salvaAccessToken).done(resolve).fail(reject);
            });
        }

        function conectarSignalR() {
            adapter = atendimentoAdapterService(service, config);
            $("#loginForm").hide();
            adapter.init(logarRamal);
        }

        function entrarIntervalo() {
            adapter.server.iniciarIntervalo();
        }

        function iniciarNaoDisponivel() {
            adapter.server.iniciarNaoDisponivel();
        }

        function terminarNaoDisponivel() {
            adapter.server.terminarNaoDisponivel();
        }


        function logarRamal() {

            var ip = $("#ipInput").val() || null;

            adapter.server.iniciar(ip);
            mostrarLogandoRamal();

            //adapter.server.discar("23918833", adapter.TipoDiscagem.LigacaoExterna);
        }

        function getNewAccessToken() {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: urlToken,
                    type: 'POST',
                    data: {
                        grant_type: "refresh_token",
                        refresh_token: config.refresh_token,
                        client_id: clientId
                    }
                }).done(salvaAccessToken).done(resolve).fail(reject);
            });
        };

        function getChamadaDetalhes(numeroRamal, ligacaoId, dataLigacao) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    // ex: atlantis:5656/service/api/Ligacao/99999999/Ramal/7500/?data=2015-10-05
                    url: urlApi + "Ligacao/" + ligacaoId + "/Ramal/" + numeroRamal,
                    type: 'GET',
                    headers: {
                        // sempre passar o token no header
                        Authorization: "Bearer " + config.access_token
                    },
                    data: {
                        data: dataLigacao || new Date()
                    }
                }).done(resolve).fail(reject);
            });
        };

        //Atualizar o token do usuário
        var stop = 0;
        var intervalToken = function () {
            stop = setTimeout(
                function () {

                    console.log('intervalToken', { data: new Date() });

                    getNewAccessToken().then(intervalToken).catch(intervalToken);
                }, 240000);
        };

        // UI
        var ramalLivre = $("#ramalLivreDiv");
        var ramalEmUso = $("#ramalAtendimentoDiv");
        var tituloRamalEmUso = ramalEmUso.find('h4');
        var textoRamalEmUso = ramalEmUso.find('span');
        var ligacaoId = 0;

        ramalLivre.hide();
        ramalEmUso.hide();

        $("#btnDesligarChamada").hide();
        $("#loading").hide();

        $("#btnDesligarChamada").click(function () {
            //desligar
            adapter.server.desligar();
        });


        function mostrarRamalLivre(ramal, chamada) {

            clearTimeout(timeId);

            ligacaoId = 0;
            ramalEmUso.hide();
            ramalLivre.show();
            $("#loading").hide();

            //OnLogado - Verificar se o timeout ja foi criado
            if (stop == 0) {
                intervalToken();
                console.log('intervalToken', { data: new Date() });
            }
        };

        function mostrarLogandoRamal() {
            tituloRamalEmUso.text('Aguarde, logando ramal');
            textoRamalEmUso.text('');
            ramalEmUso.show();
            ramalLivre.hide();
        }

        function mostrarRamalEmUso(ramal, chamada) {
            console.log(chamada);

            $("#btnDesligarChamada").show();

            tituloRamalEmUso.text('Ramal em Atendimento');
            textoRamalEmUso.text('Em chamada com o número ' + chamada.Telefone);

            if (chamada.NomeCliente) {
                textoRamalEmUso.text('Em chamada com o cliente ' + chamada.NomeCliente);
            }

            if (chamada.LigacaoId) {
                ligacaoId = chamada.LigacaoId;
            }

            ramalEmUso.show();
            ramalLivre.hide();
        }

        function mostrarRecebendoChamada(ramal, chamada) {
            tituloRamalEmUso.text('Recebendo chamada...');
            textoRamalEmUso.text('Recebendo chamada do número ' + chamada.Telefone);
            ramalEmUso.show();
            ramalLivre.hide();
        }

        function mostrarRealizandoChamada(ramal, telefone) {
            tituloRamalEmUso.text('Realizando chamada...');
            textoRamalEmUso.text('Chamando o  número ' + telefone);
            ramalEmUso.show();
            ramalLivre.hide();
        }

        function mostrarDetalhesChamada(response) {
            console.log(response);
        }

        function mostrarStatusDiscagem(chamada, status) {
            if (status.StatusDiscagem == adapter.StatusDiscagemExterno.NaoAtende) {
                console.log("Nao Atende")
            } else if (status.StatusDiscagem == adapter.StatusDiscagemExterno.Congestionamento) {
                console.log("Congestionado")
            } else if (status.StatusDiscagem == adapter.StatusDiscagemExterno.Servico) {
                console.log("Servico")
            } else if (status.StatusDiscagem == adapter.StatusDiscagemExterno.RamalDesligou) {
                console.log("Ramal Desligou")
            } else if (status.StatusDiscagem == adapter.StatusDiscagemExterno.Ocupado) {
                console.log("Ocupado")
            } else {
                console.log("Status Desconhecido")
            }
        };

        service.onLogado = mostrarRamalLivre;
        service.onChamada = mostrarRecebendoChamada;
        service.onDisca = mostrarRealizandoChamada;
        service.onDiscaStatus = mostrarStatusDiscagem;
        service.onAtendido = mostrarRamalEmUso;
        service.onDesliga = function chamadaDesligada(ramal, telefone) {
            if (ligacaoId) {
                // buscar dados da ultima chamada
                getChamadaDetalhes(ramal.Ramal, ligacaoId).then(mostrarDetalhesChamada);
            }

            mostrarRamalLivre(ramal, telefone);
        };
        service.onChamadaPerdida = mostrarRamalLivre;
        service.onConferencia = function () { }
        service.onLogadoErro = function (ramal, erro) {
            console.log(erro);
        };

        var timeId = null;


        /* Reconectar Ramal */
        var reconectar = function () {
            console.log('reconectar');

            getNewAccessToken().then(function () {
                conectarSignalR();
            }).catch(function () {
                clearTimeout(timeId);
                timeId = setTimeout(reconectar, 5000);
            });
        };

        /* Tratamento de erro Middleware*/
        service.disconnected = function () {
            reconectar();
        };

        service.error = function () {
            console.log('Error - GetNewAcessToken');
            reconectar();
        };

        service.onConexaoErro = function () {
            reconectar();
        };

        service.onDeslogado = mostrarRamalLivre;

    });
});