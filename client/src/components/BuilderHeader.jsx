import React from 'react'
import { ArrowLeftIcon, Code2Icon, DownloadIcon,  ExternalLinkIcon,  EyeIcon, GlobeIcon, Loader2Icon, } from "lucide-react";


const BuilderHeader = ({
  projectName,
  version,
  showCode,
  publishing,
  onToggleShowCode,
  onOpenPreview,
  onPublish,
  onDownload,
  onBack,
  onLogout,
}) => {
  return (
    <header className="h-12 w-full flex items-center justify-between px-4 border-b border-purple-300/50 bg-gradient-to-r from-purple-100/80 via-violet-100/70 to-indigo-100/80 backdrop-blur-2xl shrink-0">
  <div className="flex items-center gap-2">
    
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer bg-gradient-to-r from-red-500 to-purple-600 text-white hover:from-red-600 hover:to-purple-700"
    >
      <ArrowLeftIcon size={16} />
    </button>

    <img
      src="/logo.svg"
      alt="Logo"
      className="invert size-5"
    />
    <span className='text-sm font-semibold truncate max-w-38 md:max-w-50'>
        {projectName}</span>
        <span className='text-[10px] font-medium text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded'>v{version}</span>
    </div>

    <div className='flex items-center gap-2'>
        <button onClick={onToggleShowCode}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer 
        ${showCode ? "bg-purple-700 text-white" : ""}`}>
            {showCode ?(
                <>
                <EyeIcon size={13}/> preview
                </>
            ) : (
                <>
                <Code2Icon size={13}/> Code
                </>
            )}
        </button>
        <button onClick={onOpenPreview}
        className='inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 hover:border-purple-300'>
         <ExternalLinkIcon size={14}/> OpenPreview
        </button>

        <button onClick={onPublish} disabled={publishing}
        className='inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 hover:border-purple-300'>
            {publishing ? <Loader2Icon size={13} className='animate-spin'/> : <GlobeIcon size={14}/>} Publish
        </button>
 
        <button onClick={onDownload}
        className='inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 hover:border-purple-300'>
            <DownloadIcon size={13}/> Export
          </button>
    
        <button onClick={onLogout}
        className='inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer bg-gradient-to-r from-red-500 to-purple-600 text-white hover:from-red-600 hover:to-purple-700'>
            Sign out
          </button>

    </div>
</header>
  );
};

export default BuilderHeader;