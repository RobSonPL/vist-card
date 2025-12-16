import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ADMIN CHECK
    // Hardcoded credentials for demonstration
    if ((email === 'admin' || name === 'admin') && password === 'admin') {
        onLogin({
            name: 'Administrator',
            email: 'admin@prestige.com',
            isLoggedIn: true,
            isAdmin: true
        });
        return;
    }

    // Standard User Logic
    const displayName = name || email.split('@')[0];
    onLogin({
        name: displayName,
        email: email,
        isLoggedIn: true,
        isAdmin: false
    });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-gold-500">
        <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-2">
            {isLogin ? 'Zaloguj się' : 'Dołącz do nas'}
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
            Dostęp do kreatora wizytówek Premium
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Imię</label>
                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 outline-none" placeholder="Jan" />
                 </div>
            )}
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{isLogin ? 'Email lub Login' : 'Email'}</label>
                <input required type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 outline-none" placeholder={isLogin ? "admin" : "jan@example.com"} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hasło</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 outline-none" placeholder="••••••••" />
            </div>

            <button type="submit" className="w-full py-3 bg-gray-900 text-white font-bold rounded hover:bg-gold-700 transition duration-300">
                {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
        </form>

        <div className="mt-6 text-center text-sm">
            <button onClick={() => setIsLogin(!isLogin)} className="text-gold-700 hover:text-gold-900 hover:underline">
                {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
            </button>
        </div>
      </div>
    </div>
  );
};