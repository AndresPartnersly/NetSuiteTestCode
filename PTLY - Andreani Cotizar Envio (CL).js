/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/url', 'N/ui/dialog'],

function(currentRecord, url, dialog) {
    
    function pageInit(context) {
        
    }
	
	function callPopUp() {

        var proceso = 'Andreani Cotizar Envio - Client';
        
        //alert(proceso + " - INICIO");

        var record = currentRecord.get();
        var sublist = 'item';
        var cantArticulos = record.getLineCount({
            sublistId: sublist
        });
        
        //alert(proceso + " - cantArticulos: "+cantArticulos);

        var arrayArticulos = [];

        if (cantArticulos > 0)
        {
            for (i=0; i < cantArticulos; i++)
            {
                record.selectLine({
                    sublistId: sublist,
                    line: i
                });

                var item = record.getCurrentSublistValue({
                    sublistId: sublist,
                    fieldId: 'item'
                });

                arrayArticulos.push(item);
            }

            var leftPosition, topPosition;
            leftPosition = (window.screen.width / 2) - ((600 / 2) + 10);
            topPosition = (window.screen.height / 2) - ((600 / 2) + 50);

            //Define the window
            var params = 'height=' + 600 + ' , width=' + 600;
            params += ' , left=' + leftPosition + ", top=" + topPosition;
            params += ' ,screenX=' + leftPosition + ' ,screenY=' + topPosition;
            params += ', status=no'; 
            params += ' ,toolbar=no';
            params += ' ,menubar=no';
            params += ', resizable=yes'; 
            params += ' ,scrollbars=no';
            params += ' ,location=no';
            params += ' ,directories=no'

            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_ptly_cotizador_andreani_sl',
                deploymentId: 'customdeploy_ptly_cotizador_andreani_sl',
                returnExternalUrl: false
            });

            //alert('LINE 87 - arrayArticulos: ' + JSON.stringify(arrayArticulos));

            var strArticulos = arrayArticulos.join('\u0005');
            var zipDestino = 1001;

            var finalURL = suiteletURL + '&articulos=' + strArticulos + '&zipDestino='+zipDestino;
            
            //alert('LINE 93 - suiteletURL: '+finalURL);
            
            window.open(finalURL, "New Window Title", params);
        }
        else
        {
            var message = {
	            title: "Mensaje",
	            message: "La transacción debe tener articulos cargados"
	         };
			 
            dialog.alert(message);
        } 

    }

    function alerta()
    {
        alert('Presiono el boton finalizar');
    }

      
    return {
        pageInit: pageInit,
        callPopUp: callPopUp,
        alerta: alerta
    };
    
});