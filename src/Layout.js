import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link, json } from "react-router-dom";
import NoteList from "./NoteList";
import { v4 as uuidv4 } from "uuid";
import { currentDate } from "./utils";
import { googleLogout, useGoogleLogin} from "@react-oauth/google";
import axios from "axios";


const localStorageKey = "lotion-v1";

function Layout() {

  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState(null);

  

  

  const navigate = useNavigate();
  const mainContainerRef = useRef(null);
  const [collapse, setCollapse] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState(-1);

  const login = useGoogleLogin({
    onSuccess: (res) => {
      setUser(res);
      document.getElementById("login").style.display = "none";
      document.getElementById("main-container").style.visibility = "visible";
      
    },
    onError: (err) => console.log("ERROR", err)
  })

  useEffect(() => {
    const height = mainContainerRef.current.offsetHeight;
    mainContainerRef.current.style.maxHeight = `${height}px`;
    const existing = localStorage.getItem(localStorageKey);
    if (existing) {
      try {
        setNotes(JSON.parse(existing));
      } catch {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (currentNote < 0) {
      return;
    }
    if (!editMode) {
      navigate(`/notes/${currentNote + 1}`);
      return;
    }
    navigate(`/notes/${currentNote + 1}/edit`);
  }, [notes]);

  useEffect(
    () => {
        if (user) {
          console.log("ACCESS:", user);
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json'
                    }
                })
                .then((res) => {
                    setProfile(res.data);
                    
                })
                .catch((err) => console.log(err));
          console.log("PROFILE:", profile);
        }
    },
    [ user ]
  );

  useEffect(() => {
    const asyncEffect = async () => {
      if(profile){
        console.log("CALLING");
        const email = profile.email;
        const promise = await fetch(`https://dkjvyqevqhex3tzrgdsgeurfuy0ndwvp.lambda-url.ca-central-1.on.aws/?email=${email}`);
        if(promise.status === 200){
          const notes = await promise.json();
          console.log("NOTES:", notes.body.Items);
          setNotes(notes.body.Items);
        } else{
          console.log("ERROR:", promise);
        }
      }
    };
    asyncEffect();
  }, [profile]);

  const saveNote = async(note, index) => {
    console.log("CurrentNote", note);
    console.log("EMAIL", profile.email);
    
    // axios.get(`https://iqtxneym2zmxqh5gn5lcbbvtna0zvxyq.lambda-url.ca-central-1.on.aws/`,{
    //       email: profile.email,
    //       note: note
    //  }).catch((err) => console.log(err));
    note.body = note.body.replaceAll("<p><br></p>", "");

    setNotes([
      ...notes.slice(0, index),
      { ...note },
      ...notes.slice(index + 1),
    ]);
    setCurrentNote(index);
    setEditMode(false);
    const res = await fetch(`https://iqtxneym2zmxqh5gn5lcbbvtna0zvxyq.lambda-url.ca-central-1.on.aws/`,{
      email: profile.email,
      note: JSON.stringify(note)
    }).then((res) => console.log("SUCCESS").catch((err) => console.log(err)));
  };

  const deleteNote = (index) => {
    setNotes([...notes.slice(0, index), ...notes.slice(index + 1)]);
    setCurrentNote(0);
    setEditMode(false);
  };

  const addNote = () => {
    setNotes([
      {
        id: uuidv4(),
        title: "Untitled",
        body: "",
        when: currentDate(),
      },
      ...notes,
    ]);
    setEditMode(true);
    setCurrentNote(0);
  };

  const logout = () => {
    googleLogout();
    //setUser(null);
    setProfile(null);
    document.getElementById("login").style.display = "block";
    document.getElementById("main-container").style.visibility = "hidden";
  };

  return (
    <div id="container">
      <header>
        <aside>
          <button id="menu-button" onClick={() => setCollapse(!collapse)}>
            &#9776;
          </button>
        </aside>
        <div id="app-header">
          <h1>
            <Link to="/notes">Lotion</Link>
          </h1>
          <h6 id="app-moto">Like Notion, but worse.</h6>
        </div>
        <aside id="logout">{profile ? (<button onClick={logout}>{profile.name} (Logout)</button>):(<p>&nbsp;</p>)}</aside>
      </header>
      <div id="login"><button onClick={() => login()}>Sign in with Google</button></div>
      <div id="main-container" ref={mainContainerRef}>
        <aside id="sidebar" className={collapse ? "hidden" : null}>
          <header>
            <div id="notes-list-heading">
              <h2>Notes</h2>
              <button id="new-note-button" onClick={addNote}>
                +
              </button>
            </div>
          </header>
          <div id="notes-holder">
            <NoteList notes={notes} />
          </div>
        </aside>
        <div id="write-box">
          <Outlet context={[notes, saveNote, deleteNote]} />
        </div>
      </div>
    </div>
  );
}

export default Layout;