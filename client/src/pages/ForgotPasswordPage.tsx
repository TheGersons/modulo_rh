import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setIsSuccess(true);
        setMessage(response.data.message || 'Si el correo existe, recibirás la contraseña temporal.');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      {/* Panel izquierdo branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-between w-full p-20">
          <div>
            <div className="flex items-center gap-4 mb-16">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Energía PD</h1>
                <p className="text-blue-200 text-sm">Sistema de RRHH</p>
              </div>
            </div>
          </div>
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Recupera tu<br />acceso
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Te enviaremos una contraseña temporal a tu correo registrado.
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio de sesión
          </button>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Olvidaste tu contraseña?</h2>
            <p className="text-gray-500 text-base">
              Ingresa tu correo y te enviaremos una contraseña temporal.
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Revisa tu correo</h3>
              <p className="text-gray-500 mb-8">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Ir al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {message && (
                <div className="p-4 rounded-xl text-sm font-medium border-2 bg-red-50 text-red-800 border-red-200">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-semibold text-base rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar contraseña temporal'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
