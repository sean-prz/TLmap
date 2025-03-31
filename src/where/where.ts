import {levenshteinEditDistance} from 'levenshtein-edit-distance'
import { readFileSync } from 'fs';
import path from "node:path";
import logger from "../logger/logger";

type Stop = {
    name: string,
    line: string
}

export function where(text: string) {
    // break the text into words
    const words = text.split(' ')
    const pathJSON = path.resolve(__dirname, './stops.json');
    const stops = JSON.parse(readFileSync(pathJSON, 'utf-8'));
    let maxSimilarity = 0;
    let bestStop: Stop = {name: '', line: ''};
    words.forEach((word) => {
        stops.forEach((stop : Stop) => {
            const similarity = computeSimilarity(word, stop.name);
            logger.debug(`Similarity between ${word} and ${stop.name} is ${similarity}`);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestStop = stop;
            }
            logger.debug(`Best stop is ${JSON.stringify(bestStop)}, with similarity ${maxSimilarity}`)
        })})
    if (maxSimilarity < 0.5) {
        logger.warn(`No stop found for text: ${text}`)
        return {name: 'Unknown', line: 'Unknown'}
    }
    return bestStop
}

function preprocess(word: string) {
    return word.toLowerCase().replace(/[^a-z0-9]/g, ' ')
}
const computeSimilarity = (word: string, busStop: string): number => {
    const distance = levenshteinEditDistance(preprocess(word), preprocess(busStop));
    return Math.round((1 - distance / Math.max(word.length, busStop.length))* 100)/100; // Normalize similarity score
};
