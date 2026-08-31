"use client";
import React from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
interface LoginForm {
  name: string;
  email: string;
  password: string;
}
export default function Login() {


  
      const router = useRouter()
    const [user, setUser] = useState<LoginForm>({
      name:"",
      email:"",
      password:""
    })
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    console.log(user)
  };
  
  const onLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("/api/auth/login", user);
  
      console.log(response.data);
  
      router.push("/");
    } catch (error) {
      console.log("Something went wrong");
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex w-full max-w-md flex-col items-center bg-black rounded-4xl p-8 shadow-2xl gap-3" onSubmit={onLogin}>
        <h1 className="font-bold text-3xl text-white ">Login</h1>
        <p className="text-sm  text-center   w-full text-[#9A9A9A] ">
          Enter your credentials to access your account
        </p>



        <div className="flex flex-col items-start w-full px-8 mb-1.5 mt-3">
          <label htmlFor="email" className="text-white text-sm ">
            Email
          </label>
          <input
          name="email"
            type="email"
            id="email"
            placeholder="youremail@gmail.com"
            className=" w-full p-3  mt-1 rounded-lg bg-[#1C1C1C]            transition duration-200
           hover:bg-[#242424]
           focus:outline-none
           focus:ring-2 focus:ring-yellow-300 "
           onChange={onChange}
          />
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
        </div>
        <div className="px-8 w-full mt-4">
          <button type="submit" className="w-full  py-3 rounded-lg  text-black  font-bold text-lg bg-yellow-400 hover:bg-yellow-500 ">
            Login
          </button>
        </div>
        <p className="text-sm  text-center   w-full text-[#9A9A9A] ">
          Don't have an account?
          <Link href="/signup" className="text-yellow-300 hover:underline ml-1">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
