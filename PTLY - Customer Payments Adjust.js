/**
 *@NApiVersion 2.1
 *@NAmdConfig ./configuration.json
 *@NScriptType MapReduceScript
 *@NModuleScope Public
 */
define(['N/record', 'N/search', 'N/runtime', 'N/email', 'N/file', 'N/format', 'N/util', 'N/currency'],

function (record, search, runtime, email, file, format, util, currency) {

    var proceso = "Customer Payments Adjust";

    function getParams() {
        
        var response = { error: false, mensaje:'', contextocrear:'', contextomodificar:'' };
        
        try {
            var currScript = runtime.getCurrentScript();
            response.araccount = currScript.getParameter('custscript_plty_custpayment_adjust_ar_ac');
            response.subsidiary = currScript.getParameter('custscript_plty_custpayment_adjust_sub');
            response.currency = currScript.getParameter('custscript_plty_custpayment_adjust_curr');
            response.payMethod = currScript.getParameter('custscript_plty_custpayment_adjust_pay_m');
        } catch (e) {
            response.error = true;
            response.mensaje = "Netsuite Error - Excepción: " + e.message;
        }

        return response;
    }

    function getInputData() {

        log.audit(proceso, 'GetInputData - INICIO');

        var dataProcesar = [];
        var idJournals = [];

        try{

            //Se obtienen los parametros del script
            var dataParams = getParams();

            log.debug(proceso, "getParams RESPONSE: " + JSON.stringify(dataParams));

            if(!dataParams.error){

                //Se cargan los asientos a aplicar para cargar en arreglo
                var ssJournals = search.load({
                    id: 'customsearch_ptly_jounals_adjust',
                    type: search.Type.TRANSACTION
                })

                // Filtro subsidiaria
                var ssJounalsFilterSub = search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.IS,
                    values: dataParams.subsidiary
                });
                ssJournals.filters.push(ssJounalsFilterSub);

                // Filtro moneda
                var ssJounalsFilterCurr = search.createFilter({
                    name: 'currency',
                    operator: search.Operator.IS,
                    values: dataParams.currency
                });
                ssJournals.filters.push(ssJounalsFilterCurr);

                var ssJournalsRun = ssJournals.run();
                var ssJounalsRunRange = ssJournalsRun.getRange({
                    start: 0,
                    end: 1000
                }); 
                log.debug(proceso, "GetInputData - LINE 74 - ssJounalsRunRange.length: "+ ssJounalsRunRange.length);
                for (var h = 0; h < ssJounalsRunRange.length; h++)
                {
                    idJournals.push(ssJounalsRunRange[h].getValue(ssJournalsRun.columns[0]));
                }

                log.debug(proceso, "GetInputData - LINE 80 - idJournals: "+JSON.stringify(idJournals));

                if (!isEmpty(idJournals) && idJournals.length > 0)
                {
                    var ssPayments = search.load({
                        id:'customsearch_ptly_custpayment_pend',
                        //id: 'customsearch_ptly_custpayment_pend_3',
                        type: search.Type.TRANSACTION
                    });

                    // Filtro subsidiaria
                    var ssPaymentsFilterSub = search.createFilter({
                        name: 'subsidiary',
                        operator: search.Operator.IS,
                        values: dataParams.subsidiary
                    })
                    ssPayments.filters.push(ssPaymentsFilterSub);

                    // Filtro subsidiaria
                    var ssPaymentsFilterCurr = search.createFilter({
                        name: 'currency',
                        operator: search.Operator.IS,
                        values: dataParams.currency
                    })
                    ssPayments.filters.push(ssPaymentsFilterCurr);
   
                    var ssPaymentsRun = ssPayments.run()
                    var ssPaymentsRunRange = ssPaymentsRun.getRange({
                        start: 0,
                        end: 1000
                    });

                    log.debug(proceso, "GetInputData - LINE 111 - ssPaymentsRunRange: "+ssPaymentsRunRange.length);
                    if (ssPaymentsRunRange.length > 0)
                    {
                        for (var i = 0; i < ssPaymentsRunRange.length; i++)
                        {
                            var object = {};
                            object.idCustomer = ssPaymentsRunRange[i].getValue(ssPaymentsRun.columns[6]);
                            object.subsidiary = ssPaymentsRunRange[i].getValue(ssPaymentsRun.columns[12]);
                            object.currency   = ssPaymentsRunRange[i].getValue(ssPaymentsRun.columns[11]);
                            object.idPayment  = ssPaymentsRunRange[i].getValue(ssPaymentsRun.columns[0]);
                            object.nroLocalizado = ssPaymentsRunRange[i].getValue(ssPaymentsRun.columns[5]);
                            object.araccount = dataParams.araccount;
                            object.payMethod = dataParams.payMethod;
                            object.journals = idJournals;
        
                            dataProcesar.push(object);
                        }
        
                        log.debug(proceso, 'dataProcesar: '+JSON.stringify(dataProcesar));
                    }
                    else
                    {
                        var mensaje = 'No existen pagos de clientes a saldar y/o ajustar';
                        log.error(proceso, mensaje);
                    }
                }
                else
                {
                    var mensaje = 'No existen asientos para aplicar, fin del proceso';
                    log.error(proceso, mensaje);
                }

                return dataProcesar;

            }else{
                log.error(proceso, JSON.stringify(dataParams.mensaje));
            }
        }catch(err) {
            log.error(proceso, JSON.stringify(err));
            return null;
        }
        log.audit(proceso, 'GetInputData - FIN');
    }

    function map(context) {

        log.audit(proceso, 'Map - INICIO');

        try {

            var resultado = context.value;
            log.debug(proceso, 'Map - LINE 162 - resultado: '+JSON.stringify(resultado));

            if (!isEmpty(resultado)) {

                var searchResult = JSON.parse(resultado);
                var obj = searchResult;
                var clave = obj.idPayment;
                context.write(clave, JSON.stringify(obj));
            }

        } catch (e) {
            log.error('Map Error', JSON.stringify(e.message));
        }

        log.audit(proceso, 'Map - FIN');
    }

    function reduce(context) {

        log.audit(proceso, 'Reduce - INICIO');

        var respuesta = { error: false, idClave: context.key, messages: [], detalle_error: '', idTransaccion: '' };
        var mensaje = "";

        try {

            log.debug(proceso, 'Reduce - LINE 188 - context : ' + JSON.stringify(context));

            if (!isEmpty(context.values) && context.values.length > 0) {

                for (var k = 0; k < context.values.length; k++)
                {
                    var registro = JSON.parse(context.values[k]);
                    respuesta.idTransaccion = `${registro.idPayment} - Numero Localizado: ${registro.nroLocalizado}`;
                    log.debug(proceso,'Reduce - LINE 196 - registro: '+JSON.stringify(registro));

                    var newRecord = record.create({
                        type: record.Type.CUSTOMER_PAYMENT,
                        isDynamic: true
                    });

                    newRecord.setValue({
                        fieldId: 'customer',
                        value: registro.idCustomer
                    });

                    newRecord.setValue({
                        fieldId: 'subsidiary',
                        value: registro.subsidiary
                    });

                    newRecord.setValue({
                        fieldId: 'aracct',
                        value: registro.araccount
                    });

                    newRecord.setValue({
                        fieldId: 'currency',
                        value: registro.currency
                    });

                    newRecord.setValue({
                        fieldId: 'memo',
                        value: `Ajuste de saldo Pago ${registro.nroLocalizado}`
                    });

                    newRecord.setValue({
                        fieldId: 'paymentmethod',
                        value: registro.payMethod
                    });

                    //Se valida si el pago a saldar figura en la sublista de creditos
                    var countLinesCredit = newRecord.getLineCount({ sublistId: 'credit' });
                    var existeCredito = false;
                    var existeAsiento = false;
                    var creditAmount = 0.00;
                    var journalAmount = 0.00;
                    log.debug(proceso,'Reduce - LINE 239 - countLinesCredit: '+countLinesCredit);

                    for (k = 0; k < countLinesCredit; k++)
                    {
                        newRecord.selectLine({
                            sublistId: 'credit',
                            line: k
                        });

                        var docNumber = newRecord.getCurrentSublistValue({
                            sublistId: 'credit',
                            fieldId: 'doc'
                        });

                        log.debug(proceso,'Reduce - LINE 253 - docNumber: '+docNumber+' - registro.idPayment: '+registro.idPayment);
                        if (docNumber == registro.idPayment)
                        {
                            existeCredito = true;

                            newRecord.setCurrentSublistValue({
                                sublistId:'credit',
                                fieldId: 'apply',
                                value: true,
                                ignoreFieldChange: false
                            });

                            newRecord.commitLine({
                                sublistId:'credit'
                            });

                            creditAmount = newRecord.getCurrentSublistValue({
                                sublistId: 'credit',
                                fieldId: 'amount'
                            });

                            log.debug(proceso,`PagoID ${registro.idPayment} marcado - amountApplyCredito: ${creditAmount}`);
                        }
                    }
                   
                    //Si se encontró credito a favor del cliente, se busca el asiento correspondiente
                    if (existeCredito && creditAmount > 0)
                    {
                        var countLinesApply = newRecord.getLineCount({ sublistId: 'apply' });
                        log.debug(proceso,'Reduce - LINE 282 - countLinesApply: '+countLinesApply);
                        if (countLinesApply > 0)
                        {
                            for (j = 0; j < countLinesApply; j++)
                            {
                                newRecord.selectLine({
                                    sublistId: 'apply',
                                    line: j
                                });

                                var docNumber = newRecord.getCurrentSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'doc'
                                });

                                //Se valida si el asiento que figura en la transaccion (sublista apply) coincide con uno de los asientos de ajustes generados
                                if (!isEmpty(docNumber))
                                {
                                    var arrayTemporal =  registro.journals.filter(function (elemento){

                                        if (elemento == docNumber)
                                        {
                                            existeAsiento = true;

                                            newRecord.setCurrentSublistValue({
                                                sublistId: 'apply',
                                                fieldId: 'apply',
                                                value: true,
                                                ignoreFieldChange: false
                                            });

                                            newRecord.setCurrentSublistValue({
                                                sublistId: 'apply',
                                                fieldId: 'amount',
                                                value: creditAmount,
                                                ignoreFieldChange: false
                                            });
                
                                            newRecord.commitLine({
                                                sublistId: 'apply'
                                            });

                                            journalAmount = newRecord.getCurrentSublistValue({
                                                sublistId: 'apply',
                                                fieldId: 'amount'
                                            });
                                        
                                            log.debug(proceso,`JournalID:  ${docNumber} marcado - amountApplyJournal: ${journalAmount}`);

                                            return (elemento == docNumber);
                                        }
                                    });
                                }
                            }
                            log.debug(proceso,`Reduce - LINE 336 - registro: ${JSON.stringify(newRecord)}`);

                            if (existeAsiento && (creditAmount == journalAmount))
                            {
                                var idnewrecord =  newRecord.save();
                                log.debug(proceso,`PagoID Generado:  ${idnewrecord}`);
                            }
                            else
                            {
                                var mensaje = `No existen asientos disponibles para aplicar al pago con ID: ${registro.idPayment} y numero de localizado: ${registro.nroLocalizado}`;
                                respuesta.error = true;
                                respuesta.detalle_error = mensaje;
                                log.error(proceso,mensaje);    
                            }
                        }
                        else
                        {
                            var mensaje = `No existen asientos disponibles para aplicar al pago`;
                            respuesta.error = true;
                            respuesta.detalle_error = mensaje;
                            log.error(proceso,mensaje);
                        }
                    }
                    else
                    {
                        var mensaje = `No se generó la transacción dado que no se encontró el pago en la sublista de creditos de la transacción`;
                        respuesta.error = true;
                        respuesta.detalle_error = mensaje;
                        log.error(proceso, mensaje);
                    }
                }

            }
        } catch (e) {
            respuesta.error = true;
            mensaje = 'Excepcion Inesperada - Mensaje: ' + JSON.stringify(e.message);
            respuesta.detalle_error = mensaje;
            log.error('Reduce error - ', mensaje);
        }

        log.debug("Respuesta: ", JSON.stringify(respuesta));

        context.write(context.key, respuesta);

        log.audit(proceso, 'Reduce - FIN');
    }

    function summarize(summary) {
        try {

            var totalReduceErrors = 0;
            var arrayReduceResults = [];
            //var solicitudesParentErrors = [];
            //var solicitudesParentNoErrors = [];
            var messages = '';

            log.debug(proceso, 'Inicio - Summarize');

            summary.output.iterator().each(function (key, value) {

                var objResp = JSON.parse(value);

                log.debug(proceso, 'objResp: ' + JSON.stringify(objResp));

                if (objResp.error == true) {
                    totalReduceErrors++;
                    log.error(proceso, `SUMMARIZE - Pago de cliente NO procesado ${objResp.idTransaccion}`);
                }else{
                    log.debug(proceso, `SUMMARIZE - Pago de cliente procesado exitosamente ${objResp.idTransaccion}`);
                }
                arrayReduceResults.push(objResp);
                return true;
            });

            log.audit(proceso,'SUMMARIZE - Total errores en procesamiento: ' + totalReduceErrors);

            log.debug(proceso, 'Fin - Summarize');

        } catch (e) {
            log.error('Summarize catch error', JSON.stringify(e.message));
        }
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
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});