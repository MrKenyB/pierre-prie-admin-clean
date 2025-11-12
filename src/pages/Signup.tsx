import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';
import axios from 'axios';
import { usePierreHook } from '@/hooks/pierreHook';

const Signup = () => {
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {backendUrl}= usePierreHook()


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validations
    if (!nom || !prenom || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }


    const res = await axios.post(`${backendUrl}/api/admin/register`,{nom, prenom, email, password} )
    
    console.log('====================================');
    console.log(res.data);
    console.log('====================================');

    if (res.data.success) {
      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      navigate('/auth')
      setNom('');
      setPrenom('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError('Une erreur est survenue');
    }
    setIsLoading(false);
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
            <CardTitle className="text-xl sm:text-2xl">Créer un compte</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Inscription administrateur
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-sm font-medium">
                  Prénom
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="prenom"
                    type="text"
                    placeholder="Pierre"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-medium">
                  Nom
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nom"
                    type="text"
                    placeholder="Dupont"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@institut-pierre-prie.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Vous avez déjà un compte ?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="text-primary hover:underline p-0 h-auto"
                  onClick={() => navigate('/auth')}
                >
                  Se connecter
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
