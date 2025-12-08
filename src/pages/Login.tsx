import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useSessionContext } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark text-white">
        Cargando...
      </div>
    );
  }

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a3825] to-[#102216] text-white overflow-hidden p-4">
      <div className="flex flex-col flex-grow items-center justify-center">
        <h1 className="tracking-tight text-3xl font-bold leading-tight text-center mb-8">Bienvenido</h1>
        <div className="w-full max-w-sm">
          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers unless specified
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#13ec5b', // Primary color
                    brandAccent: '#0fb946', // Darker primary for hover/active
                    inputBackground: '#1a3825', // Surface dark
                    inputBorder: 'rgba(255,255,255,0.1)',
                    inputBorderHover: '#13ec5b',
                    inputBorderFocus: '#13ec5b',
                    inputText: '#ffffff',
                    inputPlaceholder: 'rgba(255,255,255,0.5)',
                    messageText: '#ffffff',
                    messageBackground: '#1a3825',
                    messageBorder: 'rgba(255,255,255,0.1)',
                    anchorTextColor: '#13ec5b',
                    anchorTextHoverColor: '#0fb946',
                    // You can add more variables to match your theme
                  },
                },
              },
            }}
            theme="dark" // Use dark theme to match app
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'Tu correo electrónico',
                  password_input_placeholder: 'Tu contraseña',
                  button_label: 'Iniciar sesión',
                  social_auth_typography: 'O continuar con',
                  link_text: '¿Ya tienes una cuenta? Inicia sesión',
                  forgotten_password_link_text: '¿Olvidaste tu contraseña?',
                  confirmation_text: 'Revisa tu correo para el enlace de confirmación',
                },
                sign_up: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'Tu correo electrónico',
                  password_input_placeholder: 'Crea una contraseña',
                  button_label: 'Registrarse',
                  social_auth_typography: 'O registrarse con',
                  link_text: '¿No tienes una cuenta? Regístrate',
                  confirmation_text: 'Revisa tu correo para el enlace de confirmación',
                },
                forgotten_password: {
                  email_label: 'Correo electrónico',
                  email_input_placeholder: 'Tu correo electrónico',
                  button_label: 'Enviar instrucciones de recuperación',
                  link_text: '¿Recordaste tu contraseña? Inicia sesión',
                },
                update_password: {
                  password_label: 'Nueva contraseña',
                  password_input_placeholder: 'Tu nueva contraseña',
                  button_label: 'Actualizar contraseña',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;