import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase.config';
import { Express } from 'express';

const saveInStorage = async (file: Express.Multer.File) => {
  //Initialize a firebase application
  initializeApp(firebaseConfig);

  // Initialize Cloud Storage and get a reference to the service
  const storage = getStorage();

  // Setting up multer as a middleware to grab photo uploads
  const dateTime = giveCurrentDateTime();

  const storageRef = ref(
    storage,
    `files/${file.originalname + '-' + dateTime}`,
  );

  // Create file metadata including the content type
  const metadata = {
    contentType: file.mimetype,
  };

  // Upload the file in the bucket storage
  const snapshot = await uploadBytesResumable(
    storageRef,
    file.buffer,
    metadata,
  );

  // Grab the public url
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  const dateTime = date + ' ' + time;
  return dateTime;
};

export { saveInStorage };
