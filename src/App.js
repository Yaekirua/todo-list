import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import './App.css';

const App = () => {
    const [notes, setNotes] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const notesCollection = collection(db, 'notes');
        const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
            const notesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesList);
        });

        return () => unsubscribe();
    }, []);

    const addNote = async () => {
        if (inputValue.trim()) {
            const notesCollection = collection(db, 'notes');
            await addDoc(notesCollection, {
                text: inputValue,
                timestamp: serverTimestamp() // Add timestamp here
            });
            setInputValue('');
        }
    };

    const removeNote = async (id) => {
        const noteDoc = doc(db, 'notes', id);
        await deleteDoc(noteDoc);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            addNote();
        }
    };

    // Function to format the timestamp to show only day and time
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate(); // Convert Firestore timestamp to JavaScript Date
        const options = { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false }; // Format options
        return date.toLocaleString('en-US', options); // Format the date as needed
    };

    return (
        <div className="container">
            <h1>TODO-LIST</h1>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a new todo-list..."
            />
            <button onClick={addNote}>Add todo-list</button>
            <ul>
                {notes.map((note) => (
                    <li key={note.id}>
                        {note.text} <span className="timestamp">({formatTimestamp(note.timestamp)})</span>
                        <button onClick={() => removeNote(note.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
