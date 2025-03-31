import {
    AutoModelForSequenceClassification,
    AutoTokenizer,
    PreTrainedModel,
    PreTrainedTokenizer
} from '@huggingface/transformers';
import path from "node:path";


async function loadTokenizer() : Promise<PreTrainedTokenizer> {
    return AutoTokenizer.from_pretrained('distilbert-base-uncased');
}
async function loadModel(): Promise<PreTrainedModel> {
    const modelDir = process.env.LAMBDA_TASK_ROOT || __dirname; // Fallback for local testing
    const modelPath = path.join(modelDir, "model_onnx");
    return AutoModelForSequenceClassification.from_pretrained(modelPath,
        {local_files_only: true}
    );
}


// Predict function: returns prediction and probabilities
export async function predict(text: string){
    const tokenizer = await loadTokenizer();
    const model = await loadModel();
    const tokenized = tokenizer(text)
    const output = await model(tokenized)
    const logitsArray: number[] = Array.from(output.logits.data)
    return logitsArray.indexOf(Math.max(...logitsArray))
}

