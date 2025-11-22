/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';
import { usePierreHook } from '@/hooks/pierreHook';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { backendUrl } = usePierreHook();

  // Étape 1 : Demande de réinitialisation (envoie l'email)
  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      setIsLoading(false);
      return;
    }

    try {
      const result = await axios.post(`${backendUrl}/api/admin/request-password-reset`, {
        email
      });

      if (result.data.success) {
        toast.success(result.data.message);
        setStep('password');
      } else {
        setError(result.data.message);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(
        error.response?.data?.message || 
        'Une erreur est survenue lors de l\'envoi du code'
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!code || code.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      setIsLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const result = await axios.post(`${backendUrl}/api/admin/reset-password`, {
        otp: code,
        newPassword
      });

      if (result.data.success) {
        toast.success(result.data.message);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(result.data.message);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(
        error.response?.data?.message || 
        'Une erreur est survenue lors de la réinitialisation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={logo} 
              alt="Institut Pierre Prie Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl">
              {step === 'email' && 'Mot de passe oublié'}
              {step === 'password' && 'Nouveau mot de passe'}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              {step === 'email' && 'Entrez votre adresse email pour recevoir un code de réinitialisation'}
              {step === 'password' && 'Entrez le code reçu par email et votre nouveau mot de passe'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@institut-pierre-prie.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? 'Envoi ...' : 'Envoyer le code'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Code de vérification
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                  disabled={isLoading}
                />
              
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Renvoyer un code
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;