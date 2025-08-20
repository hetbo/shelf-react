import React, { useState } from "react";

export default function NotesApp() {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: "", body: "" });

    const addNote = () => {
        if (!newNote.title.trim() || !newNote.body.trim()) return;
        setNotes([...notes, { ...newNote, id: Date.now(), isEditing: false }]);
        setNewNote({ title: "", body: "" });
    };

    const deleteNote = (id) => {
        setNotes(notes.filter((note) => note.id !== id));
    };

    const toggleEdit = (id) => {
        setNotes(
            notes.map((note) =>
                note.id === id ? { ...note, isEditing: !note.isEditing } : note
            )
        );
    };

    const updateNote = (id, updated) => {
        setNotes(
            notes.map((note) =>
                note.id === id ? { ...note, ...updated, isEditing: false } : note
            )
        );
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Notes</h1>

            {/* Add New Note */}
            <div className="mb-6 space-y-2">
                <input
                    type="text"
                    placeholder="Title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full border p-2 rounded"
                />
                <textarea
                    placeholder="Body"
                    value={newNote.body}
                    onChange={(e) => setNewNote({ ...newNote, body: e.target.value })}
                    className="w-full border p-2 rounded"
                />
                <button
                    onClick={addNote}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add Note
                </button>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="border rounded p-4 shadow bg-white"
                    >
                        {note.isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    defaultValue={note.title}
                                    onChange={(e) => (note.tempTitle = e.target.value)}
                                    className="w-full border p-2 rounded text-black"
                                />
                                <textarea
                                    defaultValue={note.body}
                                    onChange={(e) => (note.tempBody = e.target.value)}
                                    className="w-full border p-2 rounded text-black"
                                />
                                <button
                                    onClick={() =>
                                        updateNote(note.id, {
                                            title: note.tempTitle ?? note.title,
                                            body: note.tempBody ?? note.body,
                                        })
                                    }
                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                >
                                    Save
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold text-black">{note.title}</h2>
                                <p className="text-gray-700 mb-2">{note.body}</p>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => toggleEdit(note.id)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
