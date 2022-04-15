# Node NFT Maker
A node.js program that allows you to easily generate NFTs from image layers and get the JSON for an uploader.
Adapted to typescript and formatted as an app to integrate as a servcie into other apps. Any suggestions are welcome. Runs on a dual core intel CPU with laptop GPU just fine for the demo sizes. 

**The assets provided are for example only. Please do not use them to make NFTs.**

# What you should know:
Observe the file structure in the assets folder.
Under assets is categories such as Background.
Under each category is types such as Gradient, Solid, etc.
Under each type is multiple image layers of that type. Usually separated by color variations.

The file structure of the assets folder directly corresponds to the attributes of each image.
For example:
- assets/Background/Solid/Red.png
- will translate to
- Background: Solid Red
so name your files appropriately if you want attributes capitalized and with no extra spaces or symbols.

**Note:** *Make sure all image layers are the same size.
If a layer is larger than the background image then it will cause an error.*


# Usage:

Install a recent version of node.js. I'm using v16.13.1, but this should work with 12+.

- Open a terminal, powershell, command prompt, etc.
Make sure you are in this directory. That can usually be accomplished with the "cd" command.
- Run `npm install` to install dependancies

## To run 
Make sure you have node installed and run npm install
Go to `index.ts` set the number you want to generate 1,10
Example:
- `app.generate(1, 50);`
- will generate 50 NFTs with the file names 1.png, 2.png, 3.png, all the way up to 50.png
- the images will be saved in the data/images folder as PNGs.

All NFTs have attributes. This is stored in JSON files with the equivalent file name.
Every image named 32.png will have an equivalent 32.json file containing the attributes in the data/json folder.


After your NFTs are generated you may want to bulk upload them to a site like OpenSea.io.


**Most uploaders use a specific JSON format.**
To make compatible JSON for the uploaders after the NFTs are generated run this command in `index.ts` then use npm run command.
- `app.convert("title", "description")`
- Where "title" is the title of the NFT to be uploaded and "description" is the short description


To prevent duplicate NFTs from being generated when you want to generate another batch there is the `data/manifest.json` file.
The `manifest.json` file is never to be edited except with the use of a command.
Every time you upload your batch it is a good idea to keep a backup of `manifest.json`.


Once you're done with your collection or you decided to change things before you start uploading you can reset everything so you can start a new collection.


To reset everything with the exception of the contents of the assets folder (so your image editing work isn't deleted) use this command in index.ts then npm run. `app.reset()`


***This was provided free of use as a project to help people who want to generate NFTs a lot easier than manually creating and writing everything down. I'm not liable for any damages that occur as a result of making changes to your exising collections and I'm not liable for the content generated.***

Forked from https://github.com/Calcaware/NFT-Generator 
