import {predict} from "./classifier";

const sample: string[] = ["je t'aime", "2 à Bellaire", "perdu mon chat", "controleur à Flon", "des schtroumps prède de l'EPFL "]

sample.forEach(async (text) => {
    const res = await predict(text)
    console.log( text + " " +  res)

})