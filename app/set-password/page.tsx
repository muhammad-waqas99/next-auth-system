"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { setPasswordSchema } from "@/app/lib/validationSchema/auth.schema";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [formDetails, setFormDetails] = useState({
    confirmPassword: "",
    newPassword: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {

  
        setFormErrors({})
          const fieldError: Record<string ,string>= {} 
          const result = setPasswordSchema.safeParse(formDetails)
      
        if(!result.success){
                result.error.issues.forEach(issue =>{
            const field =issue.path[0] as string
            fieldError[field] = issue.message
            
          })
      
      
          setFormErrors(fieldError)
        
            return;
        }
        
 const response =await axios.post(
        "/api/auth/set-password",
        formDetails,
      );
 toast.success(response.data.message);
      router.push("/profile");
    }  catch (error:any) {
    console.log("Something went wrong");
    toast.error(
  error.response?.data?.message ||
    "Something went wrong"
);
  }
  };

  return (
    <>
      <main className="min-h-screen bg-black px-4 py-8">
        

        <div className="max-w-md mx-auto mb-5">
          
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            
            ← Go Back
          </button>
        </div>
    
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md mx-auto p-8 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
        >
          
          <h1 className="text-2xl font-semibold text-white mb-2">
            
            Set Password
          </h1>
          <p className="text-sm text-zinc-400 mb-7">
            
            Set your password to keep your account secure.
          </p>
  


          <div className="mb-5">
            
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              
              New Password
            </label>
            <input
              onChange={onChange}
              type="password"
              name="newPassword"
              placeholder="Enter your new password"
              id="newPassword"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 outline-none transition focus:border-white focus:ring-1 focus:ring-white"
            />
                                         {formErrors.newPassword && (
    <p className="mt-1 text-sm text-red-400">
      {formErrors.newPassword}
    </p>
  )}
          </div>
          
          <div className="mb-7">
            
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              
              Confirm New Password
            </label>
            <input
              onChange={onChange}
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              id="confirmPassword"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 outline-none transition focus:border-white focus:ring-1 focus:ring-white"
            />
                                         {formErrors.confirmPassword && (
    <p className="mt-1 text-sm text-red-400">
      {formErrors.confirmPassword}
    </p>
  )}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition"
          >
            
            Set Password
          </button>
        </form>
      </main>
    </>
  );
}
