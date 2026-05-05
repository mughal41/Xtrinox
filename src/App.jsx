// src/App.js
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const EXTENSION_ID = 'oamilbpnkhpokfobcemheabcdfdpfdfg'; // placeholder – we'll replace later

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Listen to auth state
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleLaunch = async () => {
    if (!user) return;
    try {
      // 1. Fetch user's encrypted data from Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('No session data found for this user.');
      }

      const { encryptedPayload, decryptionKey } = docSnap.data();

      // 2. Send the data to the Chrome extension
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        {
          action: 'injectSession',
          payload: encryptedPayload,    // { ciphertext, iv }
          key: decryptionKey
        },
        (response) => {
          if (chrome.runtime.lastError) {
            setError('Extension not found or not connected. Make sure it is loaded.');
          } else {
            console.log('Injection started:', response);
          }
        }
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /><br /><br />
          <button type="submit">Log In</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <p>Welcome, {user.email}!</p>
      <button onClick={handleLaunch} style={{ fontSize: '1.2rem', padding: '1rem' }}>
        Launch Session
      </button>
      <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;