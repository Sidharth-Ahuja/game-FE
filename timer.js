const admin = require("firebase-admin");
const serviceAccount = require("./config/serviceAccountKey.json"); // replace with the path to your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://game-33e6e-default-rtdb.firebaseio.com/", // replace with your Firebase database URL
});

const db = admin.database();
const timerRef = db.ref("timer");

const TIMER_DURATION = 15; // 15 seconds

let timerValue = TIMER_DURATION;

const startTimer = () => {
  setInterval(() => {
    if (timerValue <= 0) {
      timerValue = TIMER_DURATION;
    } else {
      timerValue--;
    }

    timerRef.set(timerValue)
      .then(() => {
        console.log(`Timer updated: ${timerValue} seconds remaining`);
      })
      .catch((error) => {
        console.error('Error updating timer:', error);
      });
  }, 1000);
};

startTimer();
