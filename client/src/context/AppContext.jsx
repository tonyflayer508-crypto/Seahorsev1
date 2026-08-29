import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const navigate = useNavigate();

  // =========================
  // AUTH STATES
  // =========================

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // =========================
  // PROJECT STATES
  // =========================

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [activeProject, setActiveProject] = useState(null);
  const [loadingActiveProject, setLoadingActiveProject] = useState(false);

  const [chatLoading, setChatLoading] = useState(false);
  const [generatingProject, setGeneratingProject] = useState(false);

  const [activeFile, setActiveFile] = useState("/App.js");
  const [showCode, setShowCode] = useState(false);

  // =========================
  // CHECK SESSION
  // =========================

  const checkSession = useCallback(async () => {
    try {
      const { data } = await api.get("/api/auth/me");

      setUser(data.user);
    } catch (error) {
      console.error("Session check failed:", error);

      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [])

  // =========================
  // LOGIN
  // =========================

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password,
      });

      setUser(data.user);

      toast.success("Welcome back!");

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);

      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Invalid email or password";

      toast.error(errMsg);

      throw new Error(errMsg);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      setUser(data.user);

      toast.success("Account created successfully!");

      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);

      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Registration failed";

      toast.error(errMsg);

      throw new Error(errMsg);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");

      setUser(null);
      setProjects([]);
      setActiveProject(null);

      toast.success("Logged out successfully");

      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);

      toast.error("Logout failed");
    }
  };

  // =========================
  // LOAD ALL PROJECTS
  // =========================

  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoadingProjects(false);
      return;
    }

    try {
      setLoadingProjects(true);

      const { data } = await api.get("/api/projects");

      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);

      toast.error("Failed to load projects list");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  // =========================
  // LOAD SINGLE PROJECT
  // =========================

  const loadProject = useCallback(
    async (id, silent = false) => {
      if (!user || !id) return;

      if (!silent) {
        setLoadingActiveProject(true);
      }

      try {
        const { data } = await api.get(`/api/projects/${id}`);

        setActiveProject(data);

        // Default file selection
        const files = Object.keys(data?.files || {});

        if (files.length > 0) {
          setActiveFile((prev) => {
            if (files.includes(prev)) return prev;

            if (files.includes("/App.js")) {
              return "/App.js";
            }

            return files[0];
          });
        }
      } catch (err) {
        console.error("Failed to load project:", err);

        if (!silent) {
          toast.error("Failed to load project details");

          navigate("/");
        }
      } finally {
        if (!silent) {
          setLoadingActiveProject(false);
        }
      }
    },
    [navigate, user]
  );

  // =========================
  // POLL PROJECT STATUS
  // =========================

  useEffect(() => {
    if (!activeProject?._id || !user) return;

    const isOngoing =
      activeProject.status === "generating" ||
      activeProject.status === "pending" ||
      activeProject.status === "revising";

    if (!isOngoing) {
      setChatLoading(false);
      return;
    }

    setChatLoading(true);

    const interval = setInterval(() => {
      loadProject(activeProject._id, true);
    }, 2000);

    return () => clearInterval(interval);
  }, [
    activeProject?._id,
    activeProject?.status,
    loadProject,
    user,
  ]);

  // =========================
  // GENERATE PROJECT
  // =========================

  const handleGenerate = useCallback(
    async (prompt) => {
      if (!user) {
        toast.error("Please log in first");
        return;
      }

      setGeneratingProject(true);

      try {
        const { data } = await api.post("/api/projects", {
          prompt,
        });

        toast.success("AI Agent is planning your project...");

        navigate(`/builder/${data._id}`);
      } catch (err) {
        console.error("Failed to generate project:", err);

        toast.error(
          err?.response?.data?.error ||
          "Failed to generate project"
        );
      } finally {
        setGeneratingProject(false);
      }
    },
    [navigate, user]
  );

  // =========================
  // DELETE PROJECT
  // =========================

  const handleDelete = useCallback(
    async (id) => {
      if (!user || !id) return;

      try {
        await api.delete(`/api/projects/${id}`);

        setProjects((prev) =>
          prev.filter((project) => project._id !== id)
        );

        if (activeProject?._id === id) {
          setActiveProject(null);
        }

        toast.success("Project deleted successfully");
      } catch (err) {
        console.error("Failed to delete project:", err);

        toast.error(
          err?.response?.data?.error ||
          "Failed to delete project"
        );
      }
    },
    [user, activeProject?._id]
  );

 const handleChat = useCallback(
  async (prompt)=>{
        if (!activeProject || !user) return;
        setChatLoading(true)
        try {
          const { data } = await api.post(`/api/projects/${activeProject._id}/chat`,
        {prompt});
        setActiveProject(data)
        if(data.errors && data.errors.length > 0){
          toast.error(`${data.errors.length} revision patch(es) failed`);  
        }else{
          toast.success(`Updated to version ${data.version}`);
        }
        } catch (err) {
          console.error("Revision request failed:",err);
          toast.error(err?.response?.data?.error || "Revision request failed");   
        }finally{
          setChatLoading(false)
        }
  },[activeProject,user]  
 )

 const debouncedSave = React.useMemo(
  ()=>debounce(async (files, id) => {
    try {
      await api.put(`/api/projects/${id}/files`,{files})
    } catch (err) {
            console.error("Failed to auto-save files:" , err);
            toast.error("Faild to save code modifications");
    }  
  }, 1000),[],
 )
 useEffect(()=>{
  return ()=>{
    debouncedSave.cancel();
  }
 },[debounce])


const updateProjectFiles = useCallback(
  async (files) => {
    if(!activeProject || !user) return;
    debouncedSave(files, activeProject._id)
  },[activeProject, user,debouncedSave]
)

  return (
    <AppContext.Provider
      value={{
        // Auth
        user,
        loadingUser,
        login,
        register,
        logout,
        updateProjectFiles,

        // Projects
        projects,
        loadingProjects,
        loadProjects,

        activeProject,
        loadingActiveProject,
        loadProject,

        // Chat / generation
        chatLoading,
        generatingProject,
        handleGenerate,
        handleDelete,

        // Files / UI
        activeFile,
        setActiveFile,
        showCode,
        setShowCode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// =========================
// CUSTOM HOOK
// =========================

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error(
      "useAppContext must be used within an AppContextProvider"
    );
  }

  return context;
}