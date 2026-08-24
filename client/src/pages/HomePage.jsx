import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Promptinput } from "../components/Promptinput";
import ShapesDots from "../components/ShapesDots";
import { homeTags } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, ClockIcon, TrashIcon } from "lucide-react";
import moment from "moment";

const HomePage = () => {

 const navigate = useNavigate()



  const {
    user,
    generatingProject,
    handleGenerate,
    logout,
    projects,
    loadingProjects,
    loadProjects,
  } = useAppContext();

  useEffect(()=>{
    loadProjects()
    },[loadProjects])

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        font-sans
        text-white
        bg-[url('/bg-img.png')]
        bg-cover
        bg-center
        bg-no-repeat
      "
    >
      {/* ================= DARK OVERLAY ================= */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          bg-black/30
        "
      />

      {/* ================= SHAPES DOTS ================= */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[1]
          opacity-20
        "
      >
        <ShapesDots
          width="100%"
          height="100%"
          cellSize={40}
          influenceRadiusVmin={25}
          attackTime={0.05}
          releaseTime={0.2}
          idleScale={0.1}
          minPeakScale={1}
          maxPeakScale={3}
          burstSpeed={1200}
          burstThickness={180}
          backgroundColor="transparent"
          shapes={[
            "circle",
            "triangle",
            "square",
          ]}
          dpr={3}
          opacity={1}
          animationMode="off"
          animationSpeed={1}
          overlapGuard={0.86}
        />
      </div>

      {/* ================= WEBSITE CONTENT ================= */}

      <div className="relative z-10 min-h-screen">

        {/* ================= NAVBAR ================= */}

        <nav
          className="
            sticky
            top-0
            z-20
            flex
            items-center
            justify-between
            px-6
            py-4
          "
        >
          {/* Logo */}

          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="BuilderAI logo"
              className="size-6"
            />

            <span
              className="
                text-xl
                font-semibold
                tracking-tight
              "
            >
              BuilderAI
            </span>
          </div>

          {/* User */}

          <div
            className="
              flex
              items-center
              gap-4
              text-sm
              font-medium
              text-zinc-300
            "
          >
            <span>
              {user?.name}
            </span>

           <button
  onClick={logout}
  className="
    cursor-pointer
    rounded-md
    border
    border-purple-400/30
    bg-gradient-to-r
    from-purple-600
    via-violet-600
    to-fuchsia-600
    px-4
    py-2
    text-xs
    font-medium
    text-white
    shadow-lg
    shadow-purple-500/20
    transition-all
    duration-300
    hover:scale-105
    hover:from-purple-500
    hover:via-violet-500
    hover:to-fuchsia-500
    hover:shadow-purple-500/40
    active:scale-95
  "
>
  Sign out
</button>
          </div>
        </nav>

        {/* ================= HERO ================= */}

        <main
          className="
            flex
            min-h-[calc(100vh-72px)]
            flex-col
            items-center
            justify-center
            px-6
            pb-20
          "
        >
          <div
            className="
              flex
              w-full
              max-w-2xl
              flex-col
              items-center
            "
          >
            {/* Promo Badge */}

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-white/20
                bg-white/10
                p-1.5
                pr-3
                text-[13px]
                text-white/90
                backdrop-blur-md
              "
            >
              <span
                className="
                  rounded-full
                  bg-red-700
                  px-3
                  py-1
                  text-[11px]
                  font-medium
                  tracking-wider
                "
              >
                PROMO
              </span>

              <span>
                Create your first project for free.
              </span>
            </div>

            {/* Title */}

            <h1
              className="
                mt-4
                max-w-2xl
                text-center
                text-4xl
                font-medium
                text-white
                md:text-6xl
              "
            >
              Let's build your app together
            </h1>

            {/* Description */}

            <p
              className="
                mt-4
                max-w-xl
                text-center
                text-sm
                leading-relaxed
                text-white/65
                md:text-base
              "
            >
              Describe your idea and watch AI design,
              structure, and launch your website instantly.
              No coding required.
            </p>

            {/* Prompt Input */}

            <div className="mt-6 w-full">
              <Promptinput
                onSubmit={handleGenerate}
                loading={generatingProject}
                placeholder="Create a portfolio website..."
                variant="glass"
                autoFocus/>
            </div>

            {/* Scrolling Marquee tags */}

           <div className="masked-marquee mt-4 w-full max-w-2xl overflow-hidden py-1">
           <div className="animate-marquee flex w-max gap-3">
                {homeTags.map((tag, i) => (
            <button
                key={i}
                onClick={() => handleGenerate(tag)}
                disabled={generatingProject}
                className="
                shrink-0
                cursor-pointer
                rounded-full
                border
                border-white/25
                 bg-white/10
                 px-4
                 py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-white/20
                disabled:cursor-not-allowed
                disabled:opacit">
                {tag}
             </button>
                ))}
            </div>
            </div>
           {/* ALL Projects */}

{!loadingProjects && projects.length > 0 && (
  <div className="mt-12 w-full">
    <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
      
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-100">
        ALL PROJECTS
      </p>

      <span className="text-xs font-normal text-zinc-100">
        {projects.length}{" "}
        {projects.length === 1 ? "project" : "projects"}
      </span>
    </div>

   <div className="space-y-2 max-h-[80vh] overflow-y-auto pr-1">
  {projects.map((p) => (
    <div
      key={p._id}
      className="
        bg-white/5
        border border-white/10
        rounded-lg
        px-4 py-3
        flex items-center justify-between
        group
        hover:border-white/20
        hover:bg-white/10
        cursor-pointer
        backdrop-blur-md
        transition-all
      "
      onClick={() => navigate(`/builder/${p._id}`)}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {p.name}
        </p>

        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-zinc-300 flex items-center gap-1">
            <ClockIcon size={10} />

            {moment(p.updatedAt || p.createdAt).fromNow()}
          </span>

          <span className="text-xs text-white/60 font-medium">
            v{p.version}
          </span>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                  <button onClick={(e)=>{
                    e.stopPropagation();
                    handleDelete(p._id)
                  }} 
                  className="p-1.5 rounded-md text-zinc-200 hover:text-red-400
                  hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashIcon size={14}/>
                  </button>
                  <ArrowRightIcon
                          size={14}
                          className="
                          text-pink-500
                          transition-all
                          duration-300
                          ease-out
                          group-hover:text-pink-400
                          group-hover:translate-x-1.5"/>
              </div>

            </div>
        ))}

    </div>

  </div>
)}

          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;