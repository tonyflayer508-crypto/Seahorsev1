import React from "react";

export const LoginLeft = () => {
  return (
    <div
      className="
        hidden lg:flex lg:w-2/5 min-h-screen
        bg-[url('/bg-img.png')]
        bg-cover bg-center bg-no-repeat
        flex-col justify-between
        p-12 shrink-0 select-none
        relative
      "
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Top: Logo + Name */}
      <div className="relative z-10 flex items-center gap-3">
        <img
          src="/logo.svg"
          alt="Builder AI Logo"
          className="w-10 h-10"
        />

        <span className="text-3xl font-semibold text-white">
          Builder AI
        </span>
      </div>

      {/* Bottom Content */}
      <div className="relative z-10">
        <div>
          <h2 className="text-4xl text-white font-semibold leading-snug mb-4 tracking-tight">
            Build your presence on the web
          </h2>

          <p className="text-zinc-300 max-w-lg leading-relaxed">
            Describe what you need, preview instantly, and customize your
            website in real time. Create with clean JSX, verified layouts,
            and instant code exports.
          </p>
        </div>

        <p className="text-zinc-300 text-sm mt-12">
          © {new Date().getFullYear()} BuilderAI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginLeft;