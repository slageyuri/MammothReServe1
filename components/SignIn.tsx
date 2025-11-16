import React, { useState } from 'react';
import logoSrc from '../mammoth.png';


interface SignInProps {
  onUserLogin: (email: string, password: string) => boolean;
  onNavigateToRegister: (role: 'student-group' | 'food-bank') => void;
  onBack: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onUserLogin, onNavigateToRegister, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onUserLogin(email, password);
    if (!success) {
      setError('Invalid email or password. Please make sure your account has been approved.');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-base-100 p-8 sm:p-12 rounded-2xl shadow-lg border border-base-300">
        <div className="text-center">
          <img src={logoSrc} alt="Mammoth ReServe" className="h-32 md:h-40 w-auto mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-neutral-content">Organization Sign In</h1>
          <p className="text-gray-400 mt-2 mb-8">
            For approved Student Groups and Food Banks.
          </p>
        </div>

        <form onSubmit={handleUserLoginSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-neutral-content"
            />
          </div>
          <div>
            <label htmlFor="password-user" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password-user"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-neutral-content"
            />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-primary"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            Need an account?{' '}
            <button
              onClick={() => onNavigateToRegister('student-group')}
              className="font-medium text-primary hover:underline"
            >
              Register as a Student Group
            </button>
            {' or '}
            <button
              onClick={() => onNavigateToRegister('food-bank')}
              className="font-medium text-primary hover:underline"
            >
              Food Bank
            </button>
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-base-300">
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm font-medium text-gray-400 hover:text-primary"
          >
            &larr; Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;