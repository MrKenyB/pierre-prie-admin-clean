import { createContext, useEffect, useState } from "react";
import { User } from "../types/index";
import axios from "axios";
import { useNavigate } from "react-router-dom";



type PierreContextProps = {
	backendUrl: string;
   connected: boolean;
   loading: boolean;
	logout: () => Promise<void>;
   getAminData: () => Promise<void>;
   checkAuth: () => Promise<void>
	user: User | null;
   setConnected: (state: boolean) => void,
};


export const PierreContext = createContext<PierreContextProps | null>(null);

export const PierreContextProvider = ({
	children,
}: {
	children: React.ReactNode;
   }) => {
   
   axios.defaults.withCredentials=true
	const [loading, setLoading] = useState(false);
	const [connected, setConnected] = useState(false);
   const [user, setUser] = useState<User | null>(null);
   const navigate = useNavigate()

	const backendUrl = "https://backend-topaz-omega-18.vercel.app";
	// const backendUrl = "https://api-pierre-prie.onrender.com";

	const logout = async () => {
		try {
			const res = await axios.post(`${backendUrl}/api/admin/logout`);

			console.log("====================================");
			console.log(res.data);
			console.log("====================================");

			if (res.data.success) {
				setConnected(false);
				setUser(null);
			}
		} catch (error) {
			console.log("=================logout=================");
			console.log(error);
			console.log("====================================");
		}
   };
   
   const checkAuth = async () => {
      try {
         setLoading(true)
         const res = await axios.get(`${backendUrl}/api/admin/is-authenticated`)

         console.log('====================================');
         console.log(res.data);
         console.log('====================================');

			if (res.data.success) {
            setConnected(true)
            getAminData()
         } else {
            setConnected(false)
            navigate('/auth')
         }

      } catch (error) {
         console.log("=================checkAuth=================");
			console.log(error);
			console.log("====================================");
      } finally {
         setLoading(false)
      }
   }

   const getAminData = async () => {
      try {
         const res = await axios.get(`${backendUrl}/api/admin/admin-data`)

         console.log('============== admin data =================');
         console.log(res.data);
         console.log('====================================');
         
         if (res.data.success) { 
            setUser(res.data.user)
         } else {
            setUser(null)
         }
         
      } catch (error) {
         console.log('====================================');
         console.log(error);
         console.log('====================================');
      }
   }

   useEffect(() => {
      checkAuth()
   },[])

	const value = {
		backendUrl,
		connected,
		logout,
		user,
		setUser,
      setConnected,
      getAminData,
      loading,
      checkAuth
	};

	return (
		<PierreContext.Provider value={value}>
			{children}
		</PierreContext.Provider>
	);
};
