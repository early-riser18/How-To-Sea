const functions = require("firebase-functions");
const admin = require("firebase-admin");

// var serviceAccount = require("C:/Users/justi/Documents/Not backed-up/web-dev/react-projects/diving-spot-app/private/diving-app-eaabe-firebase-adminsdk-2f79f-55992e872e.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://diving-app-eaabe.firebaseio.com"
// });

admin.initializeApp();

var db = admin.database();

const express = require("express");
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/read", (req, res) => {
  let data;
  var testLoc = db.ref("test/one");

  testLoc.on("value", (snapshot) => {
    data = snapshot.val();
    console.log(data);
  });
  res.send(data);
});

app.get("/spot", (req, res) => {
  let data;
  var spotData = db.ref(`spot-list/${req.query.spotID}`);

  spotData.on("value", (snapshot) => {
    data = snapshot.val();
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({ body: "unable to reach the spot" });
    }
  });
});

app.get("/userdata", (req, res) => {
  console.log(req.query);
  let userData = db.ref(`users/${req.query.uid}`);
  let data;

  userData.on("value", (snapshot) => {
    data = snapshot.val();
    if (data) {
      console.log(data);
      res.send(data);
    } else {
      res.status(404).send({ body: "unable to find the requested resource" });
    }
  });
});

app.post("/writeInfo", (req, res) => {
  console.log(req.body);
  try {
    var newPostKey = db.ref().child("test").push().key;
    var updates = {};
    updates["spot-list/" + newPostKey] = req.body;
    console.log(updates);
    db.ref().update(updates, (result) => {
      if (result === null) {
        res.send({ body: "Data successfully submitted at:", newPostKey });
      } else if (result !== null) {
        res.status(400).send({
          message:
            "Unable to submit your request, please make sure you are logged in",
        });
      }
    });
    // res.send({ body: 'Data successfully submitted at:', newPostKey });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

app.post("/updateProfile", (req, res, next) => {
  try {
    let update = {};
    update["users/" + req.body.id] = req.body.data;
    db.ref().update(update, (result) => {
      if (result === null) {
        res.send({ body: "Updated successfully" });
      } else {
        res.status(400).send({
          message:
            "Unable to submit your request, please make sure you are logged in",
        });
      }
    });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

// app.post("/writeImg", (req, res) => {
//   // const uploadTask = firebase.storage().ref(`images/${Object.keys(req.body)[0]}`).put(Object.values(req.body)[0]);
//   // uploadTask.on(
//   //   "state_changed",
//   //   snapshot => {},
//   //   error => {
//   //     console.log(error);
//   //   },
//   //   () => {
//   //     storage.ref('images').child(Object.keys(req.body)[0]).getDownloadURL().then(url => console.log('Uploaded URL: ',url));
//   //   });

//   // var storageRef = firebase.storage().ref();
//   // var testImgRef = storageRef.child("images/testImg.png");
//   // testImgRef.putString(values(req.body)[0]).then(console.log('successfully uploaded'));
//   res.end();
// });

app.get("/search", (req, res) => {
  console.log(req.query);
  let queryLocX = parseFloat(req.query.lat);
  let queryLocY = parseFloat(req.query.lng);
  let queryQty = parseFloat(req.query.qty);
  let queryLvl = req.query.lvl;
  let refArr = [];

  // Map bounds and bias border
  let queryBounds = {
    ne: { lat: req.query.neLat, lng: req.query.neLng },
    nw: { lat: req.query.nwLat, lng: req.query.nwLng },
    se: { lat: req.query.seLat, lng: req.query.seLng },
    sw: { lat: req.query.swLat, lng: req.query.swLng },
  };
  let bias = 0.015;
  let biasLat = (queryBounds.ne.lat - queryBounds.se.lat) * bias;
  let biasLng = (queryBounds.ne.lng - queryBounds.nw.lng) * bias;

  let myRef = db.ref("spot-list");
  myRef.once("value").then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      //Extract value into an object
      let refObj = {};
      let key = childSnapshot.key;
      let value = childSnapshot.val();
      let dataLat = childSnapshot.child("latitude").val();
      let dataLng = childSnapshot.child("longitude").val();

      // Assumes map is a rectangle and check if obj position is within boundaries
      let isInLatRange =
        (dataLat - queryBounds.ne.lat) * (dataLat - queryBounds.se.lat) +
          biasLat < 0;

      let isInLngRange =
        (dataLng - queryBounds.ne.lng) * (dataLng - queryBounds.nw.lng) +
          biasLng < 0;

      if (isInLatRange && isInLngRange) {
        
        //Calculate distance from location query
        let dist = Math.sqrt(
          Math.pow(dataLat - queryLocX, 2) + Math.pow(dataLng - queryLocY, 2)
        );
        refObj[key] = value;
        refObj[key]["dist"] = dist;

        if (queryLvl === "all" || refObj[key]["level"] === queryLvl) {
          if (refArr.length === 0) {
            refArr.push(refObj);
          } else {
            //Orders current Object according to its dist value
            for (let i = 0; i < refArr.length; i++) {
              let thisKey;
              Object.keys(refArr[i]).forEach((val, index) => {
                thisKey = val; // Extracts current obj key and assign to outside variable / Because refArr is array of obj
              });

              let final = refArr.length - 1;
              if (refObj[key]["dist"] <= refArr[i][thisKey]["dist"]) {
                refArr.splice(i, 0, refObj);
                break;
              } else if (i === final) {
                refArr.push(refObj);
                break;
              }
            }
          }
        }
      }
    });
    //Slice result according to query request
    let outputArr = refArr.slice(0, queryQty);
    // console.log(outputArr);

    res.send(JSON.stringify(outputArr));
  });
});

exports.app = functions.https.onRequest(app);
