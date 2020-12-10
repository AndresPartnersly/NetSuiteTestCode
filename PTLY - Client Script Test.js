/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/url'],

function(dialog, currentRecord, url) {
	
	function pageInit(context) {
        
    }
	
	function showPassedValueFunc(paramTest) {

        alert('callSuitelet - INICIO');

        var record = currentRecord.get();

        record.setValue({fieldId:'memo', value:'Prueba'});
        
      	var clientVar = paramTest             
      
		var options = {
	            title: "Current Record",
	            message: JSON.stringify(record)           //Display the value using an alert dialog
	         };
			 
        dialog.alert(options);
        
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
            scriptId: 'customscript_ptly_sl_popup',
            deploymentId: 'customdeploy_ptly_sl_popup',
            returnExternalUrl: false
        });
        alert('LINE 51 - suiteletURL: '+suiteletURL);
        
        //var suiteletURL = nlapiResolveURL('SUITELET','customscript_ptly_sl_popup','customdeploy_ptly_sl_popup')

        //alert('LINE 55 - suiteletURL: '+suiteletURL);
        
        window.open(suiteletURL, "New Window Title", params); 

        alert('callSuitelet - FIN');


    }

	function setearCampos()
	{
        var record = currentRecord.get();

        alert('setearCampos - record: '+JSON.stringify(record))
	
		try {
            alert('Hi 57');
            window.opener.nlapiSetFieldValue('memo','listo');
            //window.opener.setearCampos2(); 
	
		} catch (excepcion) {
			alert('Setear Campos - Excepcion : '+ JSON.stringify(excepcion));
		}
    }
    
    function setearCampos2()
	{
        
        var record = currentRecord.get();

		try {

            alert('Setear Campos 2 - record: '+JSON.stringify(record));
			window.close()
	
		} catch (excepcion) {
			alert('Setear Campos 2 - Excepcion : '+ JSON.stringify(excepcion));
		}
	}
   
    return {
    	pageInit: pageInit,
        showPassedValueFunc: showPassedValueFunc,
        setearCampos: setearCampos,
        setearCampos2: setearCampos2
    };
    
});