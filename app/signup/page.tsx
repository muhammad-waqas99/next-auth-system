"use client";
import React from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupSchema } from "../lib/validationSchema/auth.schema";



interface SignupForm {
  name: string;
  email: string;
  password: string;
}


export default function Signup() {

 
   const [formErrors, setFormErrors] = useState<Record<string, string>>({});

 

    const router = useRouter()
  const [user, setUser] = useState<SignupForm>({
    name:"",
    email:"",
    password:""
  })







const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setUser({ ...user, [e.target.name]: e.target.value });
  console.log(user)
};

const onSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();
  setFormErrors({})
     const fieldError: Record<string ,string>= {} 
     const result = signupSchema.safeParse(user)

   if(!result.success){
          result.error.issues.forEach(issue =>{
      const field =issue.path[0] as string
       fieldError[field] = issue.message
      
    })

 
    setFormErrors(fieldError)
    console.log(formErrors)
       return;
   }
  

  try {
    const response = await axios.post("/api/auth/signup", user);
     
    console.log(response.data);

    router.push(`/verify-email-sent?email=${user.email}`);
  } catch (error) {
    console.log("Something went wrong");
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={onSignup} className="flex w-full max-w-md flex-col items-center bg-black rounded-4xl p-8 shadow-2xl gap-3">
        <h1 className="font-bold text-3xl text-white ">Signup</h1>
        <p className="text-sm  text-center   w-full text-[#9A9A9A] ">
          Enter your details to create your account
        </p>

        <div className="flex flex-col items-start w-full px-8 mb-1.5 mt-3">
          <label htmlFor="name" className="text-white text-sm ">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="john doe"
            className=" w-full p-3  mt-1 rounded-lg bg-[#1C1C1C]             transition duration-200
           hover:bg-[#242424]
           focus:outline-none
           focus:ring-2 focus:ring-yellow-300"
           onChange={onChange}
          />

         {formErrors.name && (
  <p className="mt-1 text-sm text-red-400">
    {formErrors.name}
  </p>
)}
        </div>

        <div className="flex flex-col items-start w-full px-8 mb-1.5 mt-3">
          <label htmlFor="email" className="text-white text-sm ">
            Email
          </label>
          <input
            
            type="email"
            id="email"
            name="email"
            placeholder="youremail@gmail.com"
            className=" w-full p-3  mt-1 rounded-lg bg-[#1C1C1C]            transition duration-200
           hover:bg-[#242424]
           focus:outline-none
           focus:ring-2 focus:ring-yellow-300 "
            onChange={onChange}
          />
                   {formErrors.email && (
  <p className="mt-1 text-sm text-red-400">
    {formErrors.email}
  </p>
)}
        </div>

        <div className="flex flex-col items-start w-full px-8 mb-1.5 mt-3">
          <label htmlFor="password" className="text-white text-sm ">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="*******"
            className=" w-full p-3  mt-1 rounded-lg bg-[#1C1C1C]            transition duration-200
           hover:bg-[#242424]
           focus:outline-none
           focus:ring-2 focus:ring-yellow-300"
           onChange={onChange}
          />

                   {formErrors.password && (
  <p className="mt-1 text-sm text-red-400">
    {formErrors.password}
  </p>
)}
        </div>
        <div className="px-8 w-full mt-4">
          <button className="w-full  py-3 rounded-lg  text-black  font-bold text-lg bg-yellow-400 hover:bg-yellow-500 " type="submit">
            Signup
          </button>
        </div>
        <p className="text-sm  text-center   w-full text-[#9A9A9A] ">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-300 hover:underline ml-1">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
