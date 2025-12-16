import React, { useState, useEffect } from 'react';
import { User, SavedProject } from './types';
import { getProjects, deleteProject } from './services/storageService';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Generator } from './components/Generator';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'create'>('dashboard');
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [editingProject, setEditingProject] = useState<SavedProject | null>(null);

  // Load projects on mount or when user changes
  useEffect(() => {
    if (user) {
      setProjects(getProjects(user));
    } else {
        setProjects([]);
    }
  }, [user, view]); // Reload when view changes (e.g. back from save)

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
      if(confirm('Czy na pewno chcesz usunąć ten projekt?')) {
          deleteProject(id);
          // Reload projects
          if (user) {
              setProjects(getProjects(user));
          }
      }
  }

  const handleEditProject = (project: SavedProject) => {
      setEditingProject(project);
      setView('create');
  }

  const handleCreateNew = () => {
      setEditingProject(null);
      setView('create');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 no-print">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gold-500 rounded-tr-xl rounded-bl-xl"></div>
                <h1 className="text-2xl font-display font-bold text-gray-900">Prestige<span className="text-gold-500">Card</span></h1>
            </div>
            {user && (
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className={`text-sm font-bold ${view === 'dashboard' ? 'text-gold-700' : 'text-gray-500'} hover:text-gold-700 transition`}>
                        Pulpit
                    </button>
                    <button onClick={handleCreateNew} className={`text-sm font-bold ${view === 'create' ? 'text-gold-700' : 'text-gray-500'} hover:text-gold-700 transition`}>
                        Kreator
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                        {user.isAdmin && <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded uppercase">Admin</span>}
                        <span className="text-sm font-medium">{user.name}</span>
                        <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-600 ml-2">Wyloguj</button>
                    </div>
                </div>
            )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {!user ? (
            <div className="max-w-4xl mx-auto">
                 <div className="text-center mb-12 mt-8">
                    <h1 className="text-5xl font-display font-bold text-gray-900 mb-4 leading-tight">
                        Wizytówki klasy <br/> <span className="text-gold-500 bg-gold-100/30 px-2 rounded">Premium</span> w 3 minuty
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Wykorzystaj sztuczną inteligencję do stworzenia profesjonalnych, gotowych do druku wizytówek. 6 unikalnych propozycji, nieograniczone możliwości.
                    </p>
                 </div>
                 <Auth onLogin={handleLogin} />
            </div>
        ) : (
            <>
                {view === 'dashboard' && (
                    <Dashboard 
                        currentUser={user}
                        projects={projects} 
                        onCreateNew={handleCreateNew} 
                        onDelete={handleDeleteProject}
                        onEdit={handleEditProject}
                    />
                )}
                {view === 'create' && (
                    <Generator 
                        currentUser={user} 
                        onSaved={() => setView('dashboard')} 
                        initialProject={editingProject}
                    />
                )}
            </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto no-print">
         <div className="container mx-auto px-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} PrestigeCard AI. Wszystkie prawa zastrzeżone.</p>
         </div>
      </footer>
    </div>
  );
};

export default App;