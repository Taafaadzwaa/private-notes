import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import './styles.css';
import logo from './assets/logo.jpg';
//import notesbg from './assets/notesbg.jpg'; // commenting it out because it does not look good 
import dyk1 from './assets/dyk1.jpg';
import dyk2 from './assets/dyk2.jpg';
import dyk3 from './assets/dyk3.jpg';
import dyk4 from './assets/dyk4.jpg';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Initializing thee sesssion
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const fetchNotes = async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setNotes(data || []);
  };

  useEffect(() => {
    if (session?.user) fetchNotes();
  }, [session]);

  // Authenticatioon handlers
  const handleAuth = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return alert(error.message);
      alert('Sign up successful! Check your email to confirm.');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Notes handlers
  const addNote = async () => {
    if (!title || !content) return alert('Title and content cannot be empty');
    const { error } = await supabase
      .from('notes')
      .insert([{ title, content, user_id: session.user.id }]);
    if (error) return alert(error.message);
    setTitle('');
    setContent('');
    fetchNotes();
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) return alert(error.message);
    fetchNotes();
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const saveNote = async () => {
    if (!title || !content) return alert('Title and content cannot be empty');
    const { error } = await supabase
      .from('notes')
      .update({ title, content })
      .eq('id', editingId);
    if (error) return alert(error.message);
    setEditingId(null);
    setTitle('');
    setContent('');
    fetchNotes();
  };

  const viewNote = (note) => {
    alert(`Title: ${note.title}\n\nContent: ${note.content}`);
  };

  // Loading screen
  if (loading)
    return (
      <div className="login-container">
        <p className="animate-pulse text-purple-700 font-bold text-lg">Loading...</p>
      </div>
    );

  // Login/Signup page
  if (!session)
    return (
      <div className="login-container">
        <img src={logo} alt="Logo" className="logo animate-bounce" />
        <h1>My Thoughts App</h1>
        <p>Keep track of your thoughts and ideas in one place. Login or Sign Up to get started!</p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleAuth}>{isLogin ? 'Login' : 'Sign Up'}</button>

        <p>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    );

  // Notes page layout: responsive with two columns on desktop
  return (
    <div className="notes-page">
      <header className="flex justify-between items-center mb-6">
        <h1>My Thoughts App</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <div className="notes-layout">
        {/* Left Column: so that you can Add/edit a note */}
        <div className="add-note animate-fade-in">
          <h2>{editingId ? 'Edit Thought' : 'Add a New Thought'}</h2>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {editingId ? (
            <button onClick={saveNote}>Save Note</button>
          ) : (
            <button onClick={addNote}>Add Thought</button>
          )}
        </div>

        {/* Right column: it has the notes list */}
        <div className="notes-list">
          <h2>Recent Thoughts</h2>
          {notes.slice(0, 5).map((note) => (
            <div key={note.id} className="note-card animate-slide-up">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-actions">
                <button onClick={() => viewNote(note)}>View</button>
                <button onClick={() => startEditing(note)}>Edit</button>
                <button onClick={saveNote} disabled={editingId !== note.id}>Save</button>
                <button onClick={() => deleteNote(note.id)}>Delete</button>
              </div>
            </div>
          ))}
          {notes.length > 5 && (
            <button className="toggle-all mt-2" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Hide All Notes' : 'View All Notes'}
            </button>
          )}

          {showAll && (
            <div className="all-notes mt-4">
              <h2>All Thoughts</h2>
              {notes.map((note) => (
                <div key={note.id} className="note-card animate-slide-up">
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                  <div className="note-actions">
                    <button onClick={() => viewNote(note)}>View</button>
                    <button onClick={() => startEditing(note)}>Edit</button>
                    <button onClick={saveNote} disabled={editingId !== note.id}>Save</button>
                    <button onClick={() => deleteNote(note.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes background image - it doesnt look good , so we are removing
      <img src={notesbg} alt="Notes Background" className="w-full mt-8 opacity-20" />


      {/* the DYK section()with creative did you know fscts */}
      <div className="dyk-section mt-10">
        <h2>Did You Know?</h2>
        <div className="dyk-grid">
          {[{img: dyk1, text: "Writing your thoughts down improves memory and comprehension."},
            {img: dyk2, text: "Journaling can reduce stress and boost mental clarity."},
            {img: dyk3, text: "Writing daily helps track your personal growth over time."},
            {img: dyk4, text: "Recording ideas often sparks creativity and new insights."}]
            .map((item, idx) => (
              <div key={idx} className="dyk-card">
                <img src={item.img} alt={`DYK${idx+1}`} />
                <p>{item.text}</p>
              </div>
          ))}
        </div>
      </div>

      <footer>© 2026 My thoughts App ... Keep your ideas safe and colourful! </footer>
    </div>
  );
}

export default App;

