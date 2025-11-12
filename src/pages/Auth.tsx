import { useState, FormEvent } from "react";
import { replace, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import { usePierreHook } from "@/hooks/pierreHook";
import axios, { AxiosError } from "axios";




const Auth = () => {
  
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { backendUrl } = usePierreHook();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!email || !password) {
			setError("Veuillez remplir tous les champs");
			setIsLoading(false);
			return;
		}

		if (!email.includes("@")) {
			setError("Veuillez entrer une adresse email valide");
			setIsLoading(false);
			return;
		}

		try {
			const res = await axios.post(`${backendUrl}/api/admin/login-otp`, {
				email,
				password,
			});

			console.log("====================================");
			console.log(res.data);
			console.log("====================================");

			if (res.data.success) {
				toast.success("Code OTP envoyé avec succes !");
				navigate("/validation");
			} else {
				setError(res.data.message || "Une erreur est survenue");
			}
		} catch (error) {
			console.log("============== server ===================");
			console.log(error);
			console.log("====================================");
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Erreur lors de la connexion"
				);
			} else {
				toast.error("Erreur lors de la connexion");
			}
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
					{/* <div>
            <CardTitle className="text-xl sm:text-2xl">Institut Pierre Prie</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Tableau de bord administrateur
            </CardDescription>
          </div> */}
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-sm font-medium"
							>
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

						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm font-medium"
							>
								Mot de passe
							</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
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
							{isLoading ? "Connexion..." : "Se connecter"}
						</Button>

						<div className="text-center space-y-2">
							<Button
								type="button"
								variant="link"
								className="text-sm text-primary hover:underline"
								onClick={() => navigate("/forgot-password")}
							>
								Mot de passe oublié ?
							</Button>

							<p className="text-sm text-muted-foreground">
								Vous n'avez pas de compte ?{" "}
								<Button
									type="button"
									variant="link"
									className="text-primary hover:underline p-0 h-auto"
									onClick={() => navigate("/signup")}
								>
									Créer un compte
								</Button>
							</p>
						</div>

						{/* <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Identifiants de démonstration :
              </p>
              <p className="text-xs font-mono text-center">
                <strong>Email:</strong> admin@institut-pierre-prie.fr<br />
                <strong>Mot de passe:</strong> admin123
              </p>
            </div> */}
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default Auth;
