import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, AlertCircle, Key } from "lucide-react";
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
import axios from "axios";

const Validation = () => {

	const navigate = useNavigate();
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { backendUrl, setConnected } = usePierreHook();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

      try {
         if (!otp) {
            setError("Veuillez remplir tous les champs");
            setIsLoading(false);
            return;
         }

         const res = await axios.post(`${backendUrl}/api/admin/login-validation`, { otp });

         console.log("====================================");
         console.log(res.data);
         console.log("====================================");

         if (res.data.success) {
            toast.success("Connexion réussie !");
            setConnected(true)
            navigate("/dashboard");
         } 
      } catch (er) {
         console.log('====================================');
         console.log(er);
         console.log('====================================');
         if (axios.isAxiosError(er)) {
				toast.error(
					er.response?.data?.message 
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
					<div>
						{/* <CardTitle className="text-xl sm:text-2xl">Institut Pierre Prie</CardTitle> */}
						<CardDescription className="text-sm sm:text-base mt-2">
							Nous avons envoyé un code de validation à votre
							adresse e-mail. Merci de le renseigner ci-dessous
							pour continuer.{" "}
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

						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm font-medium"
							>
								Code OTP
							</Label>
							<div className="relative">
								<Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									id="otp"
									type="text"
									placeholder="12458"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
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
							{isLoading
								? "confirmation en cours ..."
								: "Confirmer"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default Validation;
