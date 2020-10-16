import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';
import { FcGoogle } from 'react-icons/fc';
import { FaRegArrowAltCircleLeft } from 'react-icons/fa';
import { RiSendPlaneLine } from 'react-icons/ri';

import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

firebase.initializeApp({
    apiKey: 'AIzaSyAHpotcK6hZbamtOzvAOmeNrzP-1uvjdA4',
    authDomain: 'fosion-demos.firebaseapp.com',
    databaseURL: 'https://fosion-demos.firebaseio.com',
    projectId: 'fosion-demos',
    storageBucket: 'fosion-demos.appspot.com',
    messagingSenderId: '617343835662',
    appId: '1:617343835662:web:d64137cbf3667a2ba5665f',
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

const SignIn = () => {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return (
        <button className="sign-in" onClick={signInWithGoogle}>
            <FcGoogle />
            Sign In with Google
        </button>
    );
};

const SignOut = () => {
    return (
        auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                <FaRegArrowAltCircleLeft />
                Sign Out
            </button>
        )
    );
};

const ChatMessage = ({ message }) => {
    const { text, uid, photoURL } = message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message message__${messageClass}`}>
            <img
                src={
                    photoURL ||
                    'https://api.adorable.io/avatars/23/abott@adorable.png'
                }
                alt="avatar"
            />
            <p>{text}</p>
        </div>
    );
};

const ChatRoom = () => {
    const dummy = useRef();
    const [formValue, setFormValue] = useState('');

    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);

    const [messages] = useCollectionData(query, { idField: 'id' });

    useEffect(() => {
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });

        setFormValue('');

        dummy.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <section className="messages">
                {messages &&
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                <span ref={dummy}></span>
            </section>

            <form className="form" onSubmit={sendMessage}>
                <input
                    type="text"
                    placeholder="Say something"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                />
                <button type="submit" disabled={!formValue}>
                    <RiSendPlaneLine />
                </button>
            </form>
        </>
    );
};

const App = () => {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header>
                <h1>Superchat</h1>
                <SignOut />
            </header>

            <main>{user ? <ChatRoom /> : <SignIn />}</main>
        </div>
    );
};

export default App;
