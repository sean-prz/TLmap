import {levenshteinEditDistance} from 'levenshtein-edit-distance'
import { readFileSync } from 'fs';
import path from "node:path";

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
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestStop = stop;
            }
        })})
    return bestStop
}

function preprocess(word: string) {
    return word.toLowerCase().replace(/[^a-z0-9]/g, ' ')
}
const computeSimilarity = (word: string, busStop: string): number => {
    const distance = levenshteinEditDistance(preprocess(word), preprocess(busStop));
    return Math.round((1 - distance / Math.max(word.length, busStop.length))* 100)/100; // Normalize similarity score
};
