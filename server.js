//module dependencies

const express = require("express");
const path = require("path");
const fs = require("fs");
const uniqid = require("uniqid"); // provides a random unique ID that will be used to keep track of notes

//configure express
const app = express();

const PORT = process.env.PORT || 3000;

//middleware for data parsing
app.use(express.urlencoded({ estended: true }));
app.use(express.json());

//static directory address for linked js and CSS
app.use(express.static(__dirname + "/public"));

//Note Data

let notes = [];

//html routes
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public", "index.html"))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public", "notes.html"))
);

//send contents of Notes JSON File
app.get("/api/notes", (req, res) => {
  fs.readFile("./db/db.json", "utf-8", (err, data) => {
    if (err) throw err;

    let parseData = JSON.parse(data);
    res.json(parseData);
  });
});

//Post a new note from the client to the db and return the new note to the client

app.post("/api/notes", (req, res) => {
  const newNote = req.body;
  const newID = uniqid();

  newNote.id = newID;
  notes.push(newNote);
  res.json(newNote);

  //append new note to JSON DB

  fs.readFile("./db/db.json", "utf-8", (err, data) => {
    if (err) throw err;

    //create array of objects from parsed JSON db file
    let arrayToAppend = JSON.parse(data);

    //push new note into array
    arrayToAppend.push(newNote);

    //write new DB file back as JSON

    fs.writeFile(
      "./db/db.json",
      JSON.stringify(arrayToAppend),
      "utf-8",
      (err) => {
        if (err) throw err;
      }
    );
  });
});

app.delete("/api/notes/:id", (req, res) => {
  // read in existing JSON note records
  fs.readFile("./db/db.json", "utf-8", (err, data) => {
    if (err) throw err;
    let checkArray = JSON.parse(data);

    //check each element of the current JSON db. If the ID matches that sent by the delete request, remove that item from array via splice() method
    for (let i = 0; i < checkArray.length; i++) {
      if (checkArray[i].id === req.params.id) {
        checkArray.splice(i, 1);
        console.log(checkArray);
      }
    }
    //write to JSON new array with deleted member removed
    fs.writeFile("./db/db.json", JSON.stringify(checkArray), "utf-8", (err) => {
      if (err) throw err;
    });
  });
});

//Server Listen

app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));
