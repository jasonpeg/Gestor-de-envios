import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Package } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('¡Registro exitoso! Por favor revisa tu correo para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center p-4 font-['Inter']">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 w-full max-w-md animate-fade-in relative overflow-hidden">

                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563FF]/5 rounded-bl-[100px] -mr-8 -mt-8"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-[#2563FF] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(37,99,255,0.3)] mx-auto mb-4">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-['Space_Grotesk'] font-bold text-2xl text-[#0B1220]">
                        Gestor<span className="text-[#2563FF]">Envío PRO</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">
                        {isSignUp ? 'Crea tu cuenta de acceso' : 'Ingresa a tu panel de control'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all"
                                placeholder="ejemplo@empresa.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#2563FF] hover:bg-[#1e4bbf] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_-6px_rgba(37,99,255,0.4)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 font-medium text-sm">
                        {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-2 text-[#2563FF] font-bold hover:underline"
                        >
                            {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
