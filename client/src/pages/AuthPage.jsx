import React from 'react'
import LoginLeft from '../components/LoginLeft';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useAppContext } from '../context/AppContext';

const AuthPage = ({mode}) => {

  const {login, register} = useAppContext()
  const navigate = useNavigate()


    const [error,setError] = useState("")
    const [loading, setloading] = useState(false)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);



    const isLogin = mode ==="login";

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setloading(true)

        try {
            const trimmedName = name.trim();
            const trimmedEmail = email.trim();

            if (!isLogin && trimmedName.length < 2) {
                throw new Error("Please enter your full name");
            }

            if (password.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }

            if(mode === "login"){
                await login(trimmedEmail, password)
            }else{
                await register(trimmedName, trimmedEmail, password)
            }
            navigate("/")
        } catch (err) {
           setError(err.message || (mode === "login" ? "Invalid email or password" : 
            "Registration failed")); 
        }finally{
            setloading(false)
        }
    }

    return (
       <div className='min-h-screen bg-white flex text-zinc-900 font-sans'>
        {/* Left Panel - Branding */}
         <LoginLeft/>

        {/* Right Panel - Branding */}
           <div className='flex-1 flex items-center justify-center p-8'>
            <div className='w-full max-w-sm'>

                <div className='mb-10'>
                    <h1 className='text-3xl font-medium tracking-tight text-zinc-900 mb-1.5
                    font-sans'>{isLogin ? "Sign in" : "Create an account"}</h1>
                    <p className='text-sm text-zinc-400'>
                        {isLogin ? "Enter your credentials to access your website builder." :
                         "Get started by entering your registration details"}
                    </p>
                </div>
                 {error && <div className='mb-6 p-3 border border-red-200 bg-red-50
                 text-red-700 text-xs rounded'>{error}</div>}


                <form className='space-y-6' onSubmit={handleSubmit}>
                    {!isLogin &&(
                    <div>
                        <label className='block text-[11px] font-semibold text-zinc-400
                        uppercase tracking-widest mb-2'>
                            FULL NAME
                        </label>
                       <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-black rounded-md
                            focus:outline-none focus:ring-1 focus:ring-black
                            text-sm text-zinc-900 bg-white
                            placeholder:text-zinc-400"
                            placeholder="Pradeep"
                             />
                    </div>

                    )}
                     <div>
                        <label className='block text-[11px] font-semibold text-zinc-400
                        uppercase tracking-widest mb-2'>
                            Email Address
                        </label>
                       <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-black rounded-md
                            focus:outline-none focus:ring-1 focus:ring-black
                            text-sm text-zinc-900 bg-white
                            placeholder:text-zinc-400"
                            placeholder="Your@example.com"
                             />
                             </div>

                     <div>
                        <label className='block text-[11px] font-semibold text-zinc-400
                        uppercase tracking-widest mb-2'>
                            PASSWORD
                        </label>
                        <div className='relative'>
                            <input
                            type={showPassword ? "text" : "password" }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-4 py-3 border border-black rounded-lg
                            focus:outline-none focus:border-violet-950 text-sm text-zinc-900
                            bg-transparent placeholder-zinc-300 pr-12"
                            placeholder="●●●●●●●●●"/>
                            <button type='button' onClick={()=> setShowPassword(!showPassword)}
                                className='absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300
                                hover:text-zinc-600 flex items-center justify-center
                                cursor-pointer transition-colors'>
                                    {showPassword ? <EyeOffIcon size={19}/> : <EyeIcon size={19}/>}

                            </button>

                        </div>
                       
                    </div>
                         <button
                         type="submit"
                         disabled={loading}
                         className="w-full py-2.5
                         bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500
                         text-white font-semibold
                         hover:scale-[1.02]
                         disabled:opacity-40
                         flex items-center justify-center
                         cursor-pointer mt-2 rounded-lg
                          transition-all"
                    >
                         {loading && (
                         <Loader2Icon className="animate-spin h-3.5 w-3.5 mr-2" />
                        )}

                         {isLogin ? "Sign in" : "Sign up"}
                        </button>

                </form>
                <p className='text-sm text-zinc-400 mt-8 pt-6 border-t border-zinc-100
                font-sans'>
                    {isLogin ? (
                        <>
                        New to BuilderAI?{" "}
                        <Link to="/register" className='text-blue-900 font-medium
                        hover:underline'>
                        Create an account
                        </Link>
                        </>
                    ) : (
                        <>
                        Already have an account?{" "}
                        <Link to="/login" className='text-blue-900 font-medium
                        hover:underline'>
                        Sign in here
                        </Link>
                        
                        </>
                    )}
                </p>
            </div>
         </div>

       </div>
    )
}

export default AuthPage