/** @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/http', 'N/record'], function(serverWidget, http, record) {
    function onRequest(context) {

		log.debug('onRequest', 'INICIO - context: '+JSON.stringify(context));

		if (context.request.method === 'GET') {
			var myForm = serverWidget.createForm({
				title: 'Find Item(s)',
				hideNavBar: true
			});
			// In SuiteScript 2.0, file path of the script is being supplied
			myForm.clientScriptModulePath = 'SuiteScripts/PTLY - Client Script Test.js';
			myForm.addField({
				id: 'custpage_selectitem',
				label: 'Select Item',
				type: serverWidget.FieldType.SELECT,
				source: 'item'
			});
			myForm.addSubmitButton({
				label: 'Submit'
			});

            myForm.addButton({
                id: 'custpage_procesar',
                label: 'Procesar',
                functionName: 'setearCampos'
            });

			context.response.writePage({
				pageObject: myForm
			});

			log.debug('onRequest', 'myForm: '+JSON.stringify(myForm));
		}
		else {
			/*var selecteditem = context.request.parameters.custpage_selectitem;
			log.debug('LINE 31', 'Aticulo Seleccionado: '+selecteditem);
			window.opener.setearCampos(JSON.stringify(selecteditem)); 
			window.close()*/

			//var selecteditem = context.request.parameters.custpage_selectitem;
			//submit();*/
			/*

			var str = selecteditem+'&window.close();';
			context.response.write({
				output: str
			});*/

			/*context.response.sendRedirect({
				type: http.RedirectType.RECORD,
				identifier: record.Type.SALES_ORDER,
				parameters: ({
					entity: 1927
				})
			});*/

			log.debug('LINE 53','context.response: '+JSON.stringify(context.response));
			log.debug('LINE 54','context.request: '+JSON.stringify(context.request));
			log.debug('LINE 55','myForm: '+JSON.stringify(myForm));
		}




		log.debug('onRequest', 'FIN');
		
	}
	

    return {
        onRequest: onRequest
    };
});