#!/bin/node
// Generate Image From Layers
// Author: Calcaware
// Typescript: DiscourseDigtial

const fs = require('fs');
const path = require('path');
const images = require("images");
const config = require("./config");

// Interface for manifest.json and duplicates
interface Manifest {
    [key: string]: string;
}

// Interface for index
interface Idx {
    [key: string]: {
        [key: string]: string[];
    }
}

interface ICharacter {
    category: string,
    type: string,
    item: string,
    path: string
}

interface ICharacterData {
    image: any;
    manifest: Manifest
}

interface IApp {
    index: Idx,
    duplicates: Manifest[],
    reset: () => void,
    indexing: () => void,
    convert: (name: string, description: string) => void,
    isDuplicate: (manifest: Manifest, duplicates: Manifest[]) => Boolean,
    generateRandom: (order: string[]) => ICharacter[],
    drawRandom: (character: ICharacter[]) => ICharacterData,
    generate: (start: number, amount: number) => void,
    initialize: () => void
}


class App implements IApp {
    index: Idx;
    duplicates: Manifest[];
    constructor() {
        this.index = JSON.parse(fs.readFileSync("data/index.json").toString());
        this.duplicates = JSON.parse(fs.readFileSync("data/manifest.json").toString());
    }

    initialize() {
        this.indexing();
        console.log(`Indexing complete... ready to generate`);
    }

    reset(): void {
        process.stdout.write("Resetting everything...");
        fs.writeFileSync("data/manifest.json", "[]");
        process.stdout.write(".");
        fs.writeFileSync("data/index.json", "{}");
        process.stdout.write(".");
        fs.rmSync("output", { recursive: true });
        process.stdout.write(".");
        fs.mkdirSync("output");
        process.stdout.write(".");
        fs.mkdirSync("output/images");
        process.stdout.write(".");
        fs.mkdirSync("output/data");
        process.stdout.write(".");
        fs.mkdirSync("output/json");
        process.stdout.write(" Done.\n");
    }


    indexing(): void {
        console.log("NFT-Generator v1.0.0");
        process.stdout.write("Indexing assets...");
        let index = {};
        let root = fs.readdirSync("./assets");
        for (let i = 0; i < root.length; i++)
            index[root[i]] = {};

        let categories = Object.keys(index);
        for (let i = 0; i < categories.length; i++) {
            let items = fs.readdirSync(`./assets/${categories[i]}`);
            for (let j = 0; j < items.length; j++)
                index[categories[i]][items[j]] = fs.readdirSync(`./assets/${categories[i]}/${items[j]}`);
            process.stdout.write(".");
        }
        fs.writeFileSync("data/index.json", JSON.stringify(index, null, '\t'));
        process.stdout.write(" Done.\n");
    }


    /**
    * Converts JSON to data file to output of each generated image
    * @param name string
    * @param description string
    * @return null
    *
    */

    // need type definitions for input and output

    convert(name: string, description: string): void {
        console.log("Converting JSON files...")
        process.stdout.write("Converting JSON files...");
        const files = fs.readdirSync("./output/data");

        for (let f = 0; f < files.length; f++) {

            const filename = files[f];
            process.stdout.write(".");

            let input = JSON.parse(fs.readFileSync(`./output/data/${filename}`));
            console.log(input);

            let keys = Object.keys(input);
            let attributes = [];
            for (let a = 0; a < keys.length; a++)
                attributes.push({
                    "trait_type": keys[a],
                    "value": input[keys[a]]
                });

            let output = {
                "name": name.replace(/#/g, filename.replace(".json", "")).replace("[hash]", "#"),
                "description": description.replace(/#/g, filename.replace(".json", "")).replace("[hash]", "#"),
                "image": `ipfs://png/${filename.replace("json", "png")}`,
                "date": Date.now(),
                "attributes": attributes
            };

            fs.writeFileSync(`./output/json/${filename}`, JSON.stringify(output, null, '\t'));
        }
        process.stdout.write(" Done.\n");
    }


    /**
     * 
     * @param manifest Manifest 
     * @param duplicates Manifest[]
     * @returns Boolean
     */

    isDuplicate(manifest: Manifest, duplicates: Manifest[]): boolean {
        for (let i = 0; i < duplicates.length; i++)
            if (JSON.stringify(duplicates[i]) == JSON.stringify(manifest))
                return true;
        return false;
    }


    /**
     * 
     * @param order Array of index elements to be used
     * @returns Character[]
     */

    generateRandom(order: string[]): ICharacter[] {
        let character: ICharacter[] = [];
        for (let o = 0; o < order.length; o++) {
            let category = order[o];
            let type = Object.keys(this.index[category])[Math.floor(Math.random() * Object.keys(this.index[category]).length)];
            let item = this.index[category][type][Math.floor(Math.random() * this.index[category][type].length)];
            character.push({ "category": category, "type": type, "item": item.replace(".png", ""), "path": `./assets/${category}/${type}/${item}` });
        }
        return character;
    }

    /**
     * 
     * @param character ICharacter[]
     * @returns ICharacterData
     */
    //this should handle a list of n attributes defined by the layers folder
    drawRandom(character: ICharacter[]): ICharacterData {
        let data: ICharacterData = {
            "image": images(character[0].path),
            "manifest": {}
        };

        data.manifest[character[0].category] = `${character[0].item} ${character[0].type}`; // Background

        data.image.draw(images(character[1].path), 0, 0); // Character
        data.manifest[character[1].category] = `${character[1].item} ${character[1].type}`;

        if (Math.random() < .25) { // 25% Chance
            data.image.draw(images(character[2].path), 0, 0); // Overlay
            data.manifest[character[2].category] = `${character[2].item} ${character[2].type}`;
        }
        return data;
    }

    /**
     * 
     * @param start number
     * @param amount number
     */

    generate(start: number, amount: number): void {

        console.log(`Starting to make ${amount} starting at #${start}`);

        let counter = start;
        while (counter < (amount + start)) {

            let character = this.generateRandom(config.layers);
            let data = this.drawRandom(character);

            if (this.isDuplicate(data.manifest, this.duplicates))
                continue;
            else
                this.duplicates.push(data.manifest);

            data.image.save(`./output/images/${counter}.png`);
            fs.writeFileSync(`./output/data/${counter}.json`, JSON.stringify(data.manifest, null, '\t'));

            counter++;
        }

        fs.writeFileSync("data/manifest.json", JSON.stringify(this.duplicates, null, '\t'));
        console.log("Done.");
    }
}

var app = new App();
//app.reset(); // Resets the folder structure and manifest
app.initialize(); // Indexes the assets
app.generate(1, 50); // Generates 50 images
//app.convert("1","1X"); // Converts data file names