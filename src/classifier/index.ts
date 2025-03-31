// Import your evaluation function

import {predict} from "./classifier";

/**
 * AWS Lambda handler function.
 *
 * @param {object} event - The event object passed by the invoker.
 *                         We expect it to have a 'textToClassify' property.
 * @returns {Promise<object>} - The result of the classification.
 */
exports.handler = async (event : any) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // 1. Extract text from the incoming event
    //    The structure of 'event' depends on how the Lambda is invoked.
    //    For direct invocation (like from your script), you define the payload.
    //    Let's assume your script sends: { "textToClassify": "some message" }
    const text = event.textToClassify;

    if (!text) {
        console.error('No text found in the event payload.');
        // You might want to return a more structured error
        // For direct invocation, throwing an error is often sufficient
        throw new Error('Missing required property: textToClassify');
        /* Or return an error structure:
         * return {
         *   statusCode: 400, // Bad Request
         *   body: JSON.stringify({ error: 'Missing required property: textToClassify' }),
         * };
         */
    }

    try {
        // 2. Call your evaluation function
        const result = await predict(text);

        // 3. Return the result
        //    For direct 'RequestResponse' invocation, the calling script receives this directly.
        console.log('Returning result:', result);
        return result;
        /* If invoked via API Gateway, you'd structure the response like this:
         * return {
         *   statusCode: 200,
         *   body: JSON.stringify(result),
         *   headers: { 'Content-Type': 'application/json' }
         * };
         */
    } catch (error) {
        console.error('Error during evaluation:', error);
        // Rethrow the error or return a structured error response
        throw new Error(`Evaluation failed: ${error}`);
        /* Or return an error structure:
         * return {
         *   statusCode: 500, // Internal Server Error
         *   body: JSON.stringify({ error: `Evaluation failed: ${error.message}` }),
         * };
         */
    }
};
