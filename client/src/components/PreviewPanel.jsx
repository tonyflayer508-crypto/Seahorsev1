
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
  SandpackLayout,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";

import { detectDependencies } from "../utils/sandpackUtils";
import { useAppContext } from "../context/AppContext";
import SandpackErrorMonitor from "./SandpackErrorMonitor";

/* =========================================================
   Sandpack File Watcher
   Watches file changes inside the Sandpack editor
   and syncs them with local state + database.
========================================================= */

function SandpackFileWatcher({ onLiveFilesChange }) {
  const { sandpack } = useSandpack();
  const { files } = sandpack;

  const { activeProject, updateProjectFiles } = useAppContext();

  const activeProjectRef = useRef(activeProject);

  // Keep the latest project in the ref
  useEffect(() => {
    activeProjectRef.current = activeProject;
  }, [activeProject]);

  useEffect(() => {
    const project = activeProjectRef.current;

    if (!project?.files) return;

    const updatedFiles = {};
    let hasChanges = false;

    for (const [path, fileObj] of Object.entries(files)) {
      const fileCode =
        typeof fileObj === "string"
          ? fileObj
          : fileObj?.code || "";

      updatedFiles[path] = fileCode;

      const originalContent =
        typeof project.files[path] === "string"
          ? project.files[path]
          : project.files[path]?.content;

      if (
        originalContent !== undefined &&
        originalContent !== fileCode
      ) {
        hasChanges = true;
      }
    }

    // Update live files in PreviewPanel
    onLiveFilesChange(updatedFiles);

    // Save changed files to database
    if (hasChanges) {
      updateProjectFiles(updatedFiles);
    }
  }, [files, onLiveFilesChange, updateProjectFiles]);

  return null;
}

/* =========================================================
   Preview Panel
========================================================= */

const PreviewPanel = ({ project, activeFile, showCode }) => {
  const [showErrorOverlay, setShowErrorOverlay] = useState(true);

  // Current live files
  const [liveFiles, setLiveFiles] = useState(project?.files || {});

  // Track project/version changes
  const [prevProjectKey, setPrevProjectKey] = useState(
    `${project?._id}-${project?.version}`
  );

  const currentKey = `${project?._id}-${project?.version}`;

  /* ---------------------------------------------------------
     Update files when project/version changes
  --------------------------------------------------------- */

  useEffect(() => {
    if (prevProjectKey !== currentKey) {
      setPrevProjectKey(currentKey);
      setLiveFiles(project?.files || {});
    }
  }, [currentKey, prevProjectKey, project?.files]);

  /* ---------------------------------------------------------
     Handle Sandpack live file changes
  --------------------------------------------------------- */

  const handleLiveFilesChange = useCallback((newFiles) => {
    setLiveFiles((prev) => {
      let changed = false;

      const prevKeys = Object.keys(prev);
      const newKeys = Object.keys(newFiles);

      // Check if number of files changed
      if (prevKeys.length !== newKeys.length) {
        changed = true;
      }

      // Check file contents
      if (!changed) {
        for (const [path, code] of Object.entries(newFiles)) {
          const previousContent =
            typeof prev[path] === "string"
              ? prev[path]
              : prev[path]?.content;

          if (previousContent !== code) {
            changed = true;
            break;
          }
        }
      }

      return changed ? newFiles : prev;
    });
  }, []);

  /* ---------------------------------------------------------
     Convert project files to Sandpack format
  --------------------------------------------------------- */

  const sandpackFiles = useMemo(() => {
    const spFiles = {};

    for (const [path, content] of Object.entries(liveFiles)) {
      const fileCode =
        typeof content === "string"
          ? content
          : content?.content || "";

      spFiles[path] = {
        code: fileCode,
        active: path === activeFile,
      };
    }

    return spFiles;
  }, [liveFiles, activeFile]);

  /* ---------------------------------------------------------
     Detect dependencies
  --------------------------------------------------------- */

  const dependencies = useMemo(() => {
    return detectDependencies(liveFiles);
  }, [liveFiles]);

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */

  if (!project) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-zinc-400">
        No project selected
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <SandpackProvider
        key={`${project._id}-${project.version}`}
        template="react"
        files={sandpackFiles}
        customSetup={{
          dependencies,
        }}
        options={{
          externalResources: [
            "https://cdn.tailwindcss.com",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
          ],

          classes: {
            "sp-wrapper": "sp-wrapper",
            "sp-layout": "sp-layout",
            "sp-preview": "sp-preview",
          },

          logLevel: 0,
        }}
        theme={{
          colors: {
            surface1: "#ffffff",
            surface2: "#f4f4f5",
            surface3: "#e4e4e7",
            clickable: "#71717a",
            base: "#09090b",
            disabled: "#a1a1aa",
            hover: "#18181b",
            accent: "#18181b",
            error: "#ef4444",
            errorSurface: "#fef2f2",
          },

          font: {
            body: "'Urbanist', system-ui, -apple-system, sans-serif",
            mono: "'Geist Mono', ui-monospace, monospace",
            size: "13px",
            lineHeight: "1.6",
          },
        }}
      >
        {/* Watches editor changes */}
        <SandpackFileWatcher
          onLiveFilesChange={handleLiveFilesChange}
        />

        {/* Watches Sandpack errors */}
        <SandpackErrorMonitor
          onErrorChange={setShowErrorOverlay}
        />

        <SandpackLayout
          style={{
            height: "100%",
            border: "none",
            borderRadius: "0",
            background: "transparent",
          }}
        >
          {/* Code Editor */}
          {showCode && (
            <SandpackCodeEditor
              showTabs
              showInlineErrors
              showLineNumbers
              wrapContent
              style={{
                height: "100%",
                flex: 1,
                minWidth: 0,
              }}
            />
          )}

          {/* Preview */}
          <SandpackPreview
            showNavigator={false}
            showRefreshButton
            showOpenInCodeSandbox={false}
            showSandpackErrorOverlay={showErrorOverlay}
            style={{
              height: "100%",
              flex: showCode ? 1 : 2,
              minWidth: 0,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default PreviewPanel;

