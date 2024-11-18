  import { initializeApp } from 'firebase/app';
  import { getFirestore } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  import { getStorage } from 'firebase/storage';

  const firebaseConfig = {
      apiKey: "AIzaSyB0kv2dL0GRhy7MTspibtwlCHog_P3Rz2M",
      authDomain: "dayzee-34acc.firebaseapp.com",
      projectId: "dayzee-34acc",
      storageBucket: "dayzee-34acc.appspot.com",
      messagingSenderId: "892705916081",
      appId: "1:892705916081:web:f892faae51308ec75f0e90",
      measurementId: "G-8L9LWZ569T"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  export { auth, db, storage };