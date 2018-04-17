import * as firebase from "firebase";

var config = {
  apiKey: "AIzaSyDfkxumdHnT4RwubZCSYNXerKn2SMus77A",
  authDomain: "merch-tools-3dcaf.firebaseapp.com",
  databaseURL: "https://merch-tools-3dcaf.firebaseio.com",
  storageBucket: "merch-tools-3dcaf.appspot.com",
};
firebase.initializeApp(config);

var storage = firebase.storage();
