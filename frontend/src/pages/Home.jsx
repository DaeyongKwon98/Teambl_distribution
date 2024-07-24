import { useState, useEffect } from "react";
import api from "../api";
import Note from "../components/Note";
import "../styles/Home.css"

import React from "react";

const Home = () => {
    return (
        <div>
            <h1>Hello, World!</h1>
        </div>
    );
};

// function Home() {
//   const [notes, setNotes] = useState([]);
//   const [content, setContent] = useState("");
//   const [title, setTitle] = useState("");

//   useEffect(() => {
//     // Home이 실행될때 getNotes해서 내가 만든 Notes 불러오기
//     getNotes();
//   }, []);

//   const getNotes = () => {
//     api
//       .get("/api/notes/")
//       .then((res) => res.data)
//       .then((data) => {
//         setNotes(data);
//         console.log(data);
//       })
//       .catch((err) => alert(err));
//   };

//   const deleteNote = (id) => {
//     api
//       .delete(`/api/notes/delete/${id}/`)
//       .then((res) => {
//         if (res.status === 204) alert("Note deleted!");
//         else alert("Failed to delete note.");
//         getNotes(); // delete한 뒤 다시 새로고침
//       })
//       .catch((error) => alert(error));
//   };

//   const createNote = (e) => {
//     e.preventDefault();
//     api
//       .post("/api/notes/", { content, title })
//       .then((res) => {
//         if (res.status === 201) alert("Note created!");
//         else alert("Failed to create note.");
//         getNotes();
//       })
//       .catch((error) => alert(error));
//   };

//   return (
//     <div>
//       <div>
//         <h2>Notes</h2>
//         {notes.map((note) => (
//           <Note note={note} onDelete={deleteNote} key={note.id} />
//         ))}
//       </div>
//       <h2>Create a Note</h2>
//       <form onSubmit={createNote}>
//         <label htmlFor="title">Title:</label>
//         <br />
//         <input
//           type="text"
//           id="title"
//           name="title"
//           required
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//         <label htmlFor="content">Content:</label>
//         <br />
//         <textarea
//           id="content"
//           name="content"
//           required
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//         />
//         <br />
//         <input type="submit" value="Submit" />
//       </form>
//     </div>
//   );
// }

export default Home;
