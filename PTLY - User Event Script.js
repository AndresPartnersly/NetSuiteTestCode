/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/currentRecord'],

function(serverWidget, currentRecord) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

        log.debug('beforeLoad', 'INICIO');


        if (scriptContext.type == scriptContext.UserEventType.CREATE)
        {
            let userVarNum = 777;
            let form = scriptContext.form;
            //form.clientScriptFileId = 81532;
            form.clientScriptModulePath = 'SuiteScripts/PTLY - Client Script Test.js';

            form.addButton({
                id: 'custpage_call_stl',
                label: 'Call Suitelet',
                functionName: 'showPassedValueFunc(' + userVarNum + ')'
            });

        }
        log.debug('beforeLoad', 'FIN');

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad/*,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit*/
    };
    
});
