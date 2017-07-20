/*!
 * ASP.NET SignalR JavaScript Library v2.1.2
 * http://signalr.net/
 *
 * Copyright Microsoft Open Technologies, Inc. All rights reserved.
 * Licensed under the Apache 2.0
 * https://github.com/SignalR/SignalR/blob/master/LICENSE.md
 *
 */
/// <reference path="jquery-2.1.0.js" />
/// <reference path="jquery.signalR.js" />
(function ($, window, undefined) {
    /// <param name="$" type="jQuery" />
    "use strict";

    if (typeof ($.signalR) !== "function") {
        throw new Error("SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/js.");
    }

    var signalR = $.signalR;

    function makeProxyCallback(hub, callback) {
        return function () {
            // Call the client hub method
            callback.apply(hub, $.makeArray(arguments));
        };
    }

    function registerHubProxies(instance, shouldSubscribe) {
        var key, hub, memberKey, memberValue, subscriptionMethod;

        for (key in instance) {
            if (instance.hasOwnProperty(key)) {
                hub = instance[key];

                if (!(hub.hubName)) {
                    // Not a client hub
                    continue;
                }

                if (shouldSubscribe) {
                    // We want to subscribe to the hub events
                    subscriptionMethod = hub.on;
                } else {
                    // We want to unsubscribe from the hub events
                    subscriptionMethod = hub.off;
                }

                // Loop through all members on the hub and find client hub functions to subscribe/unsubscribe
                for (memberKey in hub.client) {
                    if (hub.client.hasOwnProperty(memberKey)) {
                        memberValue = hub.client[memberKey];

                        if (!$.isFunction(memberValue)) {
                            // Not a client hub function
                            continue;
                        }

                        subscriptionMethod.call(hub, memberKey, makeProxyCallback(hub, memberValue));
                    }
                }
            }
        }
    }

    $.hubConnection.prototype.createHubProxies = function () {
        var proxies = {};
        this.starting(function () {
            // Register the hub proxies as subscribed
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, true);

            this._registerSubscribedHubs();
        }).disconnected(function () {
            // Unsubscribe all hub proxies when we "disconnect".  This is to ensure that we do not re-add functional call backs.
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, false);
        });

        proxies['atendimentoHub'] = this.createHubProxy('atendimentoHub'); 
        proxies['atendimentoHub'].client = { };
        proxies['atendimentoHub'].server = {
            atendeChamadaNaFila: function (canalId) {
            /// <summary>Calls the AtendeChamadaNaFila method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"canalId\" type=\"String\">Server side type is System.String</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["AtendeChamadaNaFila"], $.makeArray(arguments)));
             },

            cancelaSigaMe: function () {
            /// <summary>Calls the CancelaSigaMe method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["CancelaSigaMe"], $.makeArray(arguments)));
             },

            capturaDirigida: function (numero) {
            /// <summary>Calls the CapturaDirigida method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"numero\" type=\"Number\">Server side type is System.Int32</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["CapturaDirigida"], $.makeArray(arguments)));
             },

            conferenciaAdicionar: function (numero, tipoDiscagem) {
            /// <summary>Calls the ConferenciaAdicionar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"numero\" type=\"String\">Server side type is System.String</param>
            /// <param name=\"tipoDiscagem\" type=\"Number\">Server side type is System.Int32</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["ConferenciaAdicionar"], $.makeArray(arguments)));
             },

            conferenciaCancelar: function () {
            /// <summary>Calls the ConferenciaCancelar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["ConferenciaCancelar"], $.makeArray(arguments)));
             },

            conferenciaIniciar: function () {
            /// <summary>Calls the ConferenciaIniciar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["ConferenciaIniciar"], $.makeArray(arguments)));
             },

            conferenciaRemover: function (numero) {
            /// <summary>Calls the ConferenciaRemover method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"numero\" type=\"String\">Server side type is System.String</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["ConferenciaRemover"], $.makeArray(arguments)));
             },

            conferenciaTerminar: function () {
            /// <summary>Calls the ConferenciaTerminar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["ConferenciaTerminar"], $.makeArray(arguments)));
             },

            consultar: function (numero, tipoDiscagem) {
            /// <summary>Calls the Consultar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"numero\" type=\"String\">Server side type is System.String</param>
            /// <param name=\"tipoDiscagem\" type=\"Number\">Server side type is System.Int32</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["Consultar"], $.makeArray(arguments)));
             },

            desligar: function () {
            /// <summary>Calls the Desligar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["Desligar"], $.makeArray(arguments)));
             },

            desligarChamada: function (canalId) {
            /// <summary>Calls the DesligarChamada method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"canalId\" type=\"String\">Server side type is System.String</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["DesligarChamada"], $.makeArray(arguments)));
             },

            deslogar: function () {
            /// <summary>Calls the Deslogar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["Deslogar"], $.makeArray(arguments)));
             },

            discar: function (numero, tipoDiscagem) {
            /// <summary>Calls the Discar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"numero\" type=\"String\">Server side type is System.String</param>
            /// <param name=\"tipoDiscagem\" type=\"Number\">Server side type is System.Int32</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["Discar"], $.makeArray(arguments)));
             },

            encerraMonitoracao: function () {
            /// <summary>Calls the EncerraMonitoracao method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["EncerraMonitoracao"], $.makeArray(arguments)));
             },

            iniciar: function () {
            /// <summary>Calls the Iniciar method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["Iniciar"], $.makeArray(arguments)));
             },

            iniciarIntervalo: function () {
            /// <summary>Calls the IniciarIntervalo method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["IniciarIntervalo"], $.makeArray(arguments)));
             },

            iniciarNaoDisponivel: function () {
                /// <summary>Calls the IniciarNaoDisponivel method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["IniciarNaoDisponivel"], $.makeArray(arguments)));
            },

            terminarNaoDisponivel: function () {
                /// <summary>Calls the TerminarNaoDisponivel method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["TerminarNaoDisponivel"], $.makeArray(arguments)));
            },
			 
            liberarConsulta: function () {
            /// <summary>Calls the LiberarConsulta method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["LiberarConsulta"], $.makeArray(arguments)));
             },

            monitorarChamada: function (ramal, tipoMonitoracao) {
            /// <summary>Calls the MonitorarChamada method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"ramal\" type=\"Number\">Server side type is System.Int32</param>
            /// <param name=\"tipoMonitoracao\" type=\"String\">Server side type is System.String</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["MonitorarChamada"], $.makeArray(arguments)));
             },

            sigaMe: function (numero, tipoDiscagem) {
            /// <summary>Calls the SigaMe method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"numero\" type=\"String\">Server side type is System.String</param>
            /// <param name=\"tipoDiscagem\" type=\"Number\">Server side type is System.Int32</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["SigaMe"], $.makeArray(arguments)));
             },

            sigaMeMultiplo: function (numeros) {
            /// <summary>Calls the SigaMeMultiplo method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"numeros\" type=\"Object\">Server side type is System.Collections.Generic.IEnumerable`1[System.String]</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["SigaMeMultiplo"], $.makeArray(arguments)));
             },

            terminarIntervalo: function () {
            /// <summary>Calls the TerminarIntervalo method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["TerminarIntervalo"], $.makeArray(arguments)));
             },

            transfereVoiceMail: function () {
            /// <summary>Calls the TransfereVoiceMail method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["TransfereVoiceMail"], $.makeArray(arguments)));
             },

            transferir: function (numero, tipoDiscagem) {
            /// <summary>Calls the Transferir method on the server-side AtendimentoHub hub.&#10;Returns a jQuery.Deferred() promise.</summary>
            /// <param name=\"numero\" type=\"String\">Server side type is System.String</param>
            /// <param name=\"tipoDiscagem\" type=\"Number\">Server side type is System.Int32</param>
                return proxies['atendimentoHub'].invoke.apply(proxies['atendimentoHub'], $.merge(["Transferir"], $.makeArray(arguments)));
             }
        };

        return proxies;
    };

    signalR.hub = $.hubConnection("/signalr", { useDefaultPath: false });
    $.extend(signalR, signalR.hub.createHubProxies());

}(window.jQuery, window));