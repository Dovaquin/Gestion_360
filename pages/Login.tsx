import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { user, login, isAuthenticated } = useStore();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      const success = login(pin);
      if (!success) {
        setError(true);
        setTimeout(() => setPin(''), 300);
      }
    }
  }, [pin, login]);

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a3825] to-[#102216] text-white overflow-hidden">
      <main className="flex flex-col flex-grow items-center justify-between px-4 pt-20 pb-12">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-2 w-full animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="tracking-tight text-3xl font-bold leading-tight text-center">Ingresá tu PIN</h1>
          <p className="text-white/70 text-base font-normal leading-normal text-center">
            {user ? `Hola, ${user.name}` : 'Bienvenido'}
          </p>
        </div>

        {/* PIN Input & Message Section */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center justify-center gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  i < pin.length 
                    ? error ? 'bg-red-500' : 'bg-primary scale-125' 
                    : 'bg-[#326744]'
                }`}
              ></div>
            ))}
          </div>
          <p className={`text-sm font-normal leading-normal text-center h-5 transition-opacity ${error ? 'text-red-500 opacity-100' : 'text-[#92c9a4] opacity-0'}`}>
            PIN Incorrecto
          </p>
        </div>

        {/* Keyboard Section */}
        <div className="w-full max-w-xs mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleDigitClick(num.toString())}
                className="flex items-center justify-center h-20 w-20 mx-auto text-3xl font-light text-white rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors focus:outline-none"
              >
                {num}
              </button>
            ))}
            
            {/* Special Keys */}
            <button className="flex items-center justify-center h-20 w-20 mx-auto text-white/70 rounded-full hover:bg-white/10 transition-colors focus:outline-none">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'wght' 200" }}>fingerprint</span>
            </button>
            
            <button
              onClick={() => handleDigitClick('0')}
              className="flex items-center justify-center h-20 w-20 mx-auto text-3xl font-light text-white rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors focus:outline-none"
            >
              0
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center justify-center h-20 w-20 mx-auto text-white/70 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'wght' 200" }}>backspace</span>
            </button>
          </div>
          
          <div className="text-center mt-12">
            <button className="text-primary text-sm font-medium hover:underline">
              ¿Olvidaste tu PIN?
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;