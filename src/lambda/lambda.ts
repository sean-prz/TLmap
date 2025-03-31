import {
    LambdaClient,
    InvokeCommand,
    InvokeCommandInput,
    InvokeCommandOutput,
    LambdaClientConfig,
} from '@aws-sdk/client-lambda';
import { TextDecoder, TextEncoder } from 'util'; // Node.js built-in

// --- Configuration ---
// Best practice: Load these from environment variables or a config file
const lambdaFunctionName = 'predict'; // <-- Your Lambda function name
const awsRegion = 'us-east-1'; // <-- The AWS region your Lambda is in

// --- Define expected types ---
// Payload structure you send TO the Lambda
interface LambdaPayload {
    textToClassify: string;
}

// Expected successful response structure FROM the Lambda
 type ClassificationResult = number

// Interface for potential error structure returned by Lambda on failure
interface LambdaErrorPayload {
    errorType?: string;
    errorMessage?: string;
    // other potential error fields...
}

// --- Create Lambda Client ---
const lambdaClientConfig: LambdaClientConfig = {
    region: awsRegion,
    // Credentials are automatically sourced from the environment (IAM role, env vars, etc.)
};
const lambdaClient = new LambdaClient(lambdaClientConfig);

/**
 * Invokes the classification Lambda function.
 * @param text The text string to classify.
 * @returns A promise that resolves with the classification result.
 * @throws An error if the invocation or classification fails.
 */
export async function invokeClassifierLambda(
    text: string
): Promise<ClassificationResult> {
    console.log(`Invoking Lambda for text: "${text}"`);

    // 1. Prepare the payload
    const payload: LambdaPayload = {
        textToClassify: text,
    };

    // Convert payload to Uint8Array (required by SDK v3)
    const payloadUint8Array = new TextEncoder().encode(JSON.stringify(payload));

    // 2. Prepare the InvokeCommand parameters
    const invokeParams: InvokeCommandInput = {
        FunctionName: lambdaFunctionName,
        InvocationType: 'RequestResponse', // Wait for the response
        Payload: payloadUint8Array,
        LogType: 'Tail', // Optional: Use 'Tail' to get last 4KB of logs in response
    };

    try {
        // 3. Send the command
        console.log(`Sending InvokeCommand to ${lambdaFunctionName}...`);
        const command = new InvokeCommand(invokeParams);
        const response: InvokeCommandOutput = await lambdaClient.send(command);
        console.log('Received response from Lambda.');

        // 4. Process the response
        const decoder = new TextDecoder('utf-8');
        if (!response.Payload) {
            throw new Error('Lambda response payload was empty.');
        }
        const responsePayloadString = decoder.decode(response.Payload);

        // 5. Check for Lambda function errors (errors *inside* the Lambda code)
        if (response.FunctionError) {
            console.error('Lambda function returned an error:', responsePayloadString);
            // Attempt to parse the error payload for more details
            let errorPayload: LambdaErrorPayload = {};
            try {
                errorPayload = JSON.parse(responsePayloadString);
            } catch (parseError) {
                // Ignore if parsing fails, just use the raw string
            }
            throw new Error(
                `Lambda function execution failed: ${
                    response.FunctionError
                } - ${errorPayload.errorMessage || responsePayloadString}`
            );
        }

        // 6. Parse the successful JSON response
        const result: ClassificationResult = JSON.parse(responsePayloadString);
        console.log('Successfully parsed Lambda result:', result);
        return result;
    } catch (error) {
        console.error('Error invoking Lambda function:', error);
        // Rethrow or handle the invocation error (network, permissions, etc.)
        // Ensure the error is properly typed if possible
        if (error instanceof Error) {
            throw new Error(`Lambda invocation failed: ${error.message}`);
        } else {
            throw new Error(`An unknown Lambda invocation error occurred.`);
        }
    }
}



