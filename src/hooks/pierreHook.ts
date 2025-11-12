import { PierreContext } from "@/context/pierreContext"
import { useContext } from "react"




export const usePierreHook = () => { 
   const context = useContext(PierreContext)
   if (!context) {
      throw new Error("usePierreHook must be used within a PierreContextProvider")
   }
   return context
}