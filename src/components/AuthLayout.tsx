import { usePierreHook } from "@/hooks/pierreHook";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";





const AuthLayout = () => {
	const navigate = useNavigate();
	const { connected, loading } = usePierreHook();

	useEffect(() => {
		if (!loading && connected) {
			navigate("/dashboard", { replace: true });
		}
	}, [connected, loading, navigate]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
					<p className="text-muted-foreground">Vérification...</p>
				</div>
			</div>
		);
	}

	if (connected) {
		return null;
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
			<div className="w-full max-w-md">
				<Outlet />
			</div>
		</div>
	);
};

export default AuthLayout;