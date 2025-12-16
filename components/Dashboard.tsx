import React from 'react';
import { SavedProject, User } from '../types';
import { CardRenderer } from './CardRenderer';

interface Props {
  currentUser: User;
  projects: SavedProject[];
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onEdit: (project: SavedProject) => void;
}

export const Dashboard: React.FC<Props> = ({ currentUser, projects, onCreateNew, onDelete, onEdit }) => {
  return (
    <div className="container mx-auto">
       <div className="flex justify-between items-center mb-8">
           <div>
               <h2 className="text-3xl font-display font-bold text-gray-900">
                   {currentUser.isAdmin ? 'Panel Administratora - Wszystkie Projekty' : 'Moje Projekty'}
               </h2>
           </div>
           <button onClick={onCreateNew} className="bg-gold-500 hover:bg-gold-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-md flex items-center gap-2">
                <i className="fas fa-plus"></i> Nowy Projekt
           </button>
       </div>

       {projects.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
               <div className="text-6xl text-gray-200 mb-4">
                   <i className="far fa-folder-open"></i>
               </div>
               <h3 className="text-xl font-bold text-gray-700 mb-2">Brak zapisanych projektów</h3>
               <p className="text-gray-500 mb-6">Stwórz swoją pierwszą wizytówkę AI już teraz.</p>
               <button onClick={onCreateNew} className="text-gold-500 hover:underline font-bold">Rozpocznij tworzenie</button>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {projects.map((project) => (
                   <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-gray-100 relative group">
                       <div className="p-4 bg-gray-50 border-b border-gray-100 overflow-hidden">
                            <div className="transform transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1 origin-center">
                                <CardRenderer info={project.info} theme={project.theme} />
                            </div>
                       </div>
                       <div className="p-4">
                           <div className="flex justify-between items-start mb-2">
                               <div>
                                    <h3 className="font-bold text-gray-900">{project.theme.name}</h3>
                                    <p className="text-xs text-gray-500">{project.info.companyName}</p>
                                    {currentUser.isAdmin && (
                                        <div className="mt-1">
                                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded tracking-wider">
                                                Autor: {project.owner || 'Nieznany'}
                                            </span>
                                        </div>
                                    )}
                               </div>
                               <div className="flex gap-2">
                                   <button 
                                      onClick={() => onEdit(project)} 
                                      className="text-gray-400 hover:text-blue-500 transition"
                                      title="Edytuj"
                                   >
                                       <i className="fas fa-edit"></i>
                                   </button>
                                   <button 
                                      onClick={() => onDelete(project.id)} 
                                      className="text-gray-400 hover:text-red-500 transition"
                                      title="Usuń"
                                   >
                                       <i className="fas fa-trash"></i>
                                   </button>
                               </div>
                           </div>
                           <p className="text-xs text-gray-400 mt-2">Utworzono: {new Date(project.createdAt).toLocaleDateString()}</p>
                       </div>
                   </div>
               ))}
           </div>
       )}
    </div>
  );
};