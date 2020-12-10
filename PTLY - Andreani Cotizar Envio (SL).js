/** @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/http', 'N/record', 'N/runtime'],

function(serverWidget, search, http, record, runtime) {

	const proceso = 'Andreani Cotizar Envio - Suitelet';

	function onRequest(context) {

		log.audit(proceso, 'INICIO - context: '+JSON.stringify(context));

		let script = runtime.getCurrentScript();
	
		log.debug(proceso, `Remaining usage: ${script.getRemainingUsage()} - time ${new Date()}`);

		let arrayArticulos = []
		let arrayItems = [];
		let zipCode;

		// Se crea aistente
        let asistente = serverWidget.createAssistant({
            title: 'Andreani - Cotizar Envío',
            hideNavBar: true
		});

		//Se crea Step #1
		let paso1 = asistente.addStep({
            id: 'articulos',
            label: 'Articulos'
		});

		//Se crea Step #2
		let paso2 = asistente.addStep({
            id: 'destino',
            label: 'Dirección destino'
		});

		asistente.clientScriptModulePath = './PTLY - Andreani Cotizar Envio (CL).js';

		//Se capturan los articulos enviados por la URL
		if (!isEmpty(context.request.parameters.articulos))
			arrayArticulos = context.request.parameters.articulos.split(/\u0005/);

		if (!isEmpty(context.request.parameters.zipDestino))
			zipCode = context.request.parameters.zipDestino;

		log.debug(proceso, '43 - arrayArticulos: '+JSON.stringify(arrayArticulos));

		let writePaso1 = function(array, zip) {

			//Se agrega campo para guardar id de articulos
			let custpage_idArticulos = asistente.addField({
				id: 'custpage_idarticulos',
				type: serverWidget.FieldType.TEXT,
				label: 'Id Articulos',
				container: 'fg_paso1'
			});

			custpage_idArticulos.updateDisplayType({
				displayType: serverWidget.FieldDisplayType.DISABLED
			});

			//Se agrega zip code destino
			let custpage_zipCode = asistente.addField({
				id: 'custpage_zipcode',
				type: serverWidget.FieldType.TEXT,
				label: 'Zip Code',
				container: 'fg_paso1'
			});

			custpage_zipCode.updateDisplayType({
				displayType: serverWidget.FieldDisplayType.DISABLED
			});

			//Se agrega campo para dibujar tabla con articulos
			let custpage_articulos = asistente.addField({
				id: 'custpage_articulos',
				type: serverWidget.FieldType.INLINEHTML,
				label: 'Articulos',
				container: 'fg_paso1'
			});
	
			custpage_articulos.updateDisplayType({
				displayType: serverWidget.FieldDisplayType.INLINE
			});

			if (!isEmpty(array))
			{
				if (array.length > 0)
				{
					let ssItems = search.load({
						id: 'customsearch_ptly_cotizador_envio',
						type: search.Type.ITEM
					}) 
			
					let ssItemsIdFilter = search.createFilter({
						name: 'internalid',
						operator: search.Operator.ANYOF,
						values: array
					});
			
					ssItems.filters.push(ssItemsIdFilter);
			
					let ssItemsRun = ssItems.run();
					
					let ssItemsRunRange = ssItemsRun.getRange({
						start: 0,
						end: 1000
					});
		
					log.debug(proceso, '71 - ssItemsRunRange.length: '+ssItemsRunRange.length);
			
					if (ssItemsRunRange.length > 0)
					{
						for (i=0; i < ssItemsRunRange.length; i++)
						{
							let objeto = {};
							objeto.itemId = ssItemsRunRange[i].getValue(ssItemsRun.columns[0]);
							objeto.itemName = ssItemsRunRange[i].getValue(ssItemsRun.columns[1]);
							objeto.itemDesc = ssItemsRunRange[i].getValue(ssItemsRun.columns[2]);
							objeto.itemPeso = ssItemsRunRange[i].getValue(ssItemsRun.columns[5]);
							objeto.itemVolumen = ssItemsRunRange[i].getValue(ssItemsRun.columns[6]);
							arrayItems.push(objeto);
						}
					}
		
					log.debug(proceso, '87 - arrayItems: '+JSON.stringify(arrayItems));
					
					let tablehtml = '<table style="width: 50vw; padding: 0px 0px 25px 20px"><thead>';
					tablehtml += '<tr style="background-color: #e9e8e8;color: #666; font-size: 11px;">';
					tablehtml += '<th style="padding: 6px 15px !important;">ARTICULO</th>';
					tablehtml += '<th style="padding: 6px 15px !important;">PESO</th>';
					tablehtml += '<th style="padding: 6px 15px !important;">VOLUMEN</th>';
					tablehtml += '</tr></thead><tbody>';
			
					if(arrayItems.length > 0)
					{
						for (let i = 0; i < arrayItems.length; i++) {
							tablehtml += '<tr style="font-size:13px; color: #333">';
							tablehtml += '<td>' + arrayItems[i].itemName +' - '+ arrayItems[i].itemDesc + '</td>';
							tablehtml += '<td>' + arrayItems[i].itemPeso + '</td>';
							tablehtml += '<td>' + arrayItems[i].itemVolumen + '</td>';
							tablehtml += '</tr>';
						}
					}

					tablehtml += '</tbody></table>';

					custpage_idArticulos.defaultValue = array.toString();
					custpage_zipCode.defaultValue = zip;
					custpage_articulos.defaultValue = tablehtml;
				}
			}
		}

		let writePaso2 = function (asistente) {

			let direccion = asistente.addField({
				id: 'direccion',
				label: 'Dirección de Envio',
				type: serverWidget.FieldType.TEXTAREA
			});

			direccion.updateDisplayType({
				displayType: serverWidget.FieldDisplayType.DISABLED
			});
			
		}

        let writeResult = function() {
            /*let supervisor = context.request.parameters.newsupervisor;
            let employee = context.request.parameters.assignedemployee;
            context.response.write('Supervisor: ' + supervisor + '\nEmployee: ' + employee);*/
        }

        let writeCancel = function() {
            //context.response.write('Assistant was cancelled');
        }


		if (context.request.method === 'GET') {

			log.debug(proceso,' 158 - arrayArticulos: '+JSON.stringify(arrayArticulos)+ ' - zipCode: '+zipCode);

			asistente.currentStep = paso1;
			writePaso1(arrayArticulos, zipCode);

			context.response.writePage({
				pageObject: asistente
			});

			log.debug('onRequest', '170 - asistente: '+JSON.stringify(asistente));
		}
		else //POST method - process step of the assistant
        {
			log.debug('onRequest', '197 - context.request: '+JSON.stringify(context.request));
			log.debug('onRequest', '198 - asistente: '+JSON.stringify(asistente)+ ' - aistente.getLastAction(): '+asistente.getLastAction());

			if (context.request.parameters.next === 'Finish') //Finish was clicked
				alerta();
            else if (context.request.parameters.cancel) //Cancel was clicked
                writeCancel();
            else if (asistente.currentStep.id === 'articulos') { //transition from step 1 to step 2
                writePaso2(asistente);
                asistente.currentStep = asistente.getNextStep();
				context.response.writePage(asistente);
				log.debug('onRequest', '185');
			} else { //transition from step 2 back to step 1

				/*if(asistente.getLastAction() != serverWidget.AssistantSubmitAction.BACK)
				{*/
					log.debug(proceso, 'context.request.parameters.custpage_idarticulos: '+context.request.parameters.custpage_idarticulos);
					writePaso1();
					asistente.currentStep = asistente.getNextStep();
					context.response.writePage(asistente);
					log.debug('onRequest', '172');
				/*}
				else
				{
					asistente.currentStep.id = 'articulos';
				}
				log.debug('onRequest', '230 - asistente.currentStep: '+asistente.currentStep);*/
            }
        }




		log.debug('onRequest', 'FIN');
		
	}
	
    function isEmpty(value) {
        if (value === '')
        {
            return true;
        }

        if (value === null)
        {
            return true;
        }

        if (value === undefined)
        {
            return true;
        }
        
        if (value === 'undefined')
        {
            return true;
        }

        if (value === 'null')
        {
            return true;
        }

        return false;
    }

    return {
        onRequest: onRequest
    };
});