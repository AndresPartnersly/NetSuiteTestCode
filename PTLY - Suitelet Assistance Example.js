/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget'], function(serverWidget) {
       
    function onRequest(context)
    {
        let assistant = serverWidget.createAssistant({
            title: 'New Supervisor',
            hideNavBar: true
        });
        let assignment = assistant.addStep({
            id: 'assignment',
            label: 'Select new supervisor'
        });
        let review = assistant.addStep({
            id: 'review',
            label: 'Review and Submit'
        });

        let writeAssignment = function() {
            assistant.addField({
                id: 'newsupervisor',
                type: 'select',
                label: 'Name',
                source: 'employee'
            });
            assistant.addField({
                id: 'assignedemployee',
                type: 'select',
                label: 'Employee',
                source: 'employee'
            });
        }

        let writeReview = function() {
            let supervisor = assistant.addField({
                id: 'newsupervisor',
                type: 'text',
                label: 'Name'
            });
            supervisor.defaultValue = context.request.parameters.inpt_newsupervisor;

            let employee = assistant.addField({
                id: 'assignedemployee',
                type: 'text',
                label: 'Employee'});
            employee.defaultValue = context.request.parameters.inpt_assignedemployee;
        }

        let writeResult = function() {
            let supervisor = context.request.parameters.newsupervisor;
            let employee = context.request.parameters.assignedemployee;
            context.response.write('Supervisor: ' + supervisor + '\nEmployee: ' + employee);
        }

        let writeCancel = function() {
            context.response.write('Assistant was cancelled');
        }

        if (context.request.method === 'GET') //GET method means starting the assistant
        {
            writeAssignment();
            assistant.currentStep = assignment;
            context.response.writePage(assistant)
        } else //POST method - process step of the assistant
        {
            if (context.request.parameters.next === 'Finish') //Finish was clicked
                writeResult();
            else if (context.request.parameters.cancel) //Cancel was clicked
                writeCancel();
            else if (assistant.currentStep.stepNumber === 1) { //transition from step 1 to step 2
                writeReview();
                assistant.currentStep = assistant.getNextStep();
                context.response.writePage(assistant);
            } else { //transition from step 2 back to step 1
                writeAssignment();
                assistant.currentStep = assistant.getNextStep();
                context.response.writePage(assistant);
            }
        }
    }
    
    return {
        onRequest: onRequest
    }
        
});