// Código principal de la aplicación React (type="text/babel")

const { useState, useEffect, useMemo } = React;
const { initializeApp, getAuth, signInAnonymously, signInWithCustomToken, getFirestore, doc, onSnapshot, setDoc } = window;

const API_URL = 'https://api.adviceslip.com/advice';

// --- ICONOS ---
const HomeIcon = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const HeartIcon = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 1.03-4.5 2-1.5-1.03-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const InfoIcon = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const BookOpenIcon = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const RefreshCwIcon = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;

// --- VISTA PRINCIPAL ---
const AdviceView = ({ advice, isLoading, fetchAdvice, toggleFavorite, isFavorite }) => (
  <div className="p-4 md:p-8 max-w-2xl mx-auto text-center">
    <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Generador de Consejos</h1>
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 min-h-[200px] flex flex-col justify-center items-center">
      {isLoading ? (
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      ) : advice ? (
        <>
          <p className="text-2xl md:text-3xl text-gray-800 italic">"{advice.advice}"</p>
          <span className="text-sm font-mono text-gray-400 mt-4">Consejo #{advice.id}</span>
        </>
      ) : (
        <p className="text-xl text-red-500">No se pudo cargar un consejo.</p>
      )}
    </div>
    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
      <button onClick={fetchAdvice} disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 disabled:bg-gray-400">
        <RefreshCwIcon className="w-5 h-5 mr-2" /> Nuevo Consejo
      </button>
      {advice && (
        <button onClick={() => toggleFavorite(advice)}
          className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 font-bold rounded-lg shadow-lg transition transform hover:scale-105 ${
            isFavorite(advice.id) ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}>
          <HeartIcon className={`w-5 h-5 mr-2 ${isFavorite(advice.id) ? 'fill-white' : 'fill-none'}`} />
          {isFavorite(advice.id) ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
        </button>
      )}
    </div>
  </div>
);

// --- FAVORITOS ---
const FavoritesView = ({ favorites, toggleFavorite }) => (
  <div className="p-4 md:p-8 max-w-3xl mx-auto">
    <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Mis Consejos Favoritos</h1>
    {favorites.length === 0 ? (
      <div className="text-center p-12 bg-indigo-50 rounded-lg border-2 border-dashed border-indigo-200">
        <HeartIcon className="w-12 h-12 mx-auto text-indigo-500 mb-4 fill-indigo-200"/>
        <p className="text-xl text-indigo-700">Aún no tienes consejos favoritos.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {favorites.map(slip => (
          <div key={slip.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
            <p className="text-gray-700 italic">"{slip.advice}"</p>
            <button onClick={() => toggleFavorite(slip)} className="p-2 rounded-full text-red-500 hover:bg-red-50">
              <HeartIcon className="w-5 h-5 fill-red-500" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// --- NUEVA VISTA DE BÚSQUEDA ---
const SearchView = ({ favorites }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => favorites.filter(fav => fav.advice.toLowerCase().includes(query.toLowerCase())), [query, favorites]);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Buscar Consejos</h1>
      <input
        type="text" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar en tus favoritos..."
        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
      />
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center">No se encontraron resultados.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(slip => (
            <div key={slip.id} className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-800 italic">"{slip.advice}"</p>
              <span className="text-sm text-gray-400">ID:1513</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- INFORMACIÓN ---
const InfoPageView = () => (
  <div className="p-4 md:p-8 max-w-3xl mx-auto">
    <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Sobre la API</h1>
    <p>Esta aplicación usa la <strong>Advice Slip API</strong> para obtener consejos aleatorios.</p>
    <ul className="list-disc ml-6 mt-4 text-gray-700">
      <li>React + TailwindCSS</li>
      <li>Firestore para notas globales</li>
      <li>Favoritos y buscador local</li>
    </ul>
  </div>
);

// --- NOTAS COMPARTIDAS ---
const SharedNotesView = ({ db, userId }) => {
  const [note, setNote] = useState('');
  const [sharedData, setSharedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const appId = 'advice-app';
  const collectionPath = `/artifacts/${appId}/public/data/global_notes`;
  const docPath = 'latest_note';

  useEffect(() => {
    if (!db) return;
    const docRef = window.doc(db, collectionPath, docPath);
    const unsub = window.onSnapshot(docRef, (snap) => {
      setSharedData(snap.exists() ? snap.data() : { content: 'Sé el primero en dejar una nota.', userName: 'Sistema' });
    });
    return () => unsub();
  }, [db]);

  const saveNote = async () => {
    if (!db || !userId || !note.trim()) return;
    setIsSaving(true);
    const newNote = { content: note, userId, timestamp: Date.now(), userName: `User-${userId.substring(0,4)}` };
    await window.setDoc(window.doc(db, collectionPath, docPath), newNote, { merge: false });
    setNote('');
    setIsSaving(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Notas Globales Compartidas</h1>
      <p className="mb-6 text-gray-600">Tu ID: <span className="font-mono text-indigo-600">1513</span></p>
      {sharedData && (
        <div className="p-4 mb-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg">
          <p className="italic text-gray-800">"{sharedData.content}"</p>
          <p className="text-sm text-gray-500">Por: {sharedData.userName}</p>
        </div>
      )}
      <textarea value={note} onChange={(e)=>setNote(e.target.value)} rows="4" placeholder="Escribe tu mensaje..." className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
      <button onClick={saveNote} disabled={isSaving || !note.trim()}
        className={`mt-4 w-full py-2 rounded-lg font-bold ${isSaving || !note.trim() ? 'bg-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
        {isSaving ? 'Guardando...' : 'Guardar Nota Global'}
      </button>
    </div>
  );
};

// --- APP PRINCIPAL ---
const App = () => {
  const [currentAdvice, setCurrentAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(crypto.randomUUID());

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('adviceFavorites') || '[]');
    setFavorites(storedFavorites);
    fetchAdvice();
  }, []);

  const fetchAdvice = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}?t=${Date.now()}`);
      const data = await res.json();
      setCurrentAdvice(data.slip);
    } catch {
      setCurrentAdvice({ id: -1, advice: 'Error al obtener consejo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = (id) => favorites.some(f => f.id === id);
  const toggleFavorite = (adviceSlip) => {
    if (!adviceSlip) return;
    const updated = isFavorite(adviceSlip.id)
      ? favorites.filter(f => f.id !== adviceSlip.id)
      : [...favorites, adviceSlip];
    setFavorites(updated);
    localStorage.setItem('adviceFavorites', JSON.stringify(updated));
  };

  const Navigation = () => {
    const tabs = [
      { id: 'home', name: 'Consejos', icon: HomeIcon, color: 'text-indigo-600' },
      { id: 'favorites', name: 'Favoritos', icon: HeartIcon, color: 'text-red-600' },
      { id: 'search', name: 'Buscar', icon: RefreshCwIcon, color: 'text-green-600' },
      { id: 'shared', name: 'Notas', icon: BookOpenIcon, color: 'text-yellow-600' },
      { id: 'info', name: 'Info', icon: InfoIcon, color: 'text-blue-600' },
    ];
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-xl z-50 flex justify-around p-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setCurrentView(tab.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView===tab.id ? tab.color+' bg-gray-100' : 'text-gray-500'}`}>
            <tab.icon className="w-6 h-6 mb-1"/>
            <span className="text-xs">{tab.name}</span>
          </button>
        ))}
      </nav>
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'favorites': return <FavoritesView favorites={favorites} toggleFavorite={toggleFavorite} />;
      case 'search': return <SearchView favorites={favorites} />;
      case 'info': return <InfoPageView />;
      case 'shared': return <SharedNotesView db={db} userId={userId} />;
      default: return <AdviceView advice={currentAdvice} isLoading={isLoading} fetchAdvice={fetchAdvice} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Advice DB App</h1>
          <span className="text-xs font-mono">UserID: 1513</span>
        </div>
      </header>
      {renderView()}
      <Navigation />
    </div>
  );
};

// Renderizar
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
