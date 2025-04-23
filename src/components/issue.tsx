import { MessageCircle, ChevronDown, Filter, MoreHorizontal } from 'lucide-react';

export default function GitHubIssueList() {
  return (
    <div className="bg-[#0e0e0e] text-gray-100 rounded-md overflow-hidden border border-gray-700">
      {/* Header row */}
      <div className="flex items-center p-2 bg-[#0a0a0a] border-b border-gray-700 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-700" />
            <span className="flex items-center gap-1 text-gray-300">
              Open
              <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs ml-1">1</span>
            </span>
          </div>
          
          <span className="flex items-center gap-1 text-gray-400">
            Closed
            <span className="bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full text-xs ml-1">0</span>
          </span>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:bg-gray-700 rounded-md">
            Author
            <ChevronDown size={16} />
          </button>
          
          <button className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:bg-gray-700 rounded-md">
            <Filter size={16} />
          </button>
          
          <button className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:bg-gray-700 rounded-md">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
      
      {/* Issue item */}
      <div className="flex items-start gap-2 p-2 hover:bg-[#0a0a09] border-b border-gray-700 text-sm">
        <div className="pt-1">
          <input type="checkbox" className="rounded border-gray-700" />
        </div>
        
        <div className="flex-shrink-0 mt-1">
          <div className="w-4 h-4 bg-green-900 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="white">
              <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
            </svg>
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-200">Temp</span>
            <span className="bg-red-900 text-red-300 px-2 py-0.5 rounded-full text-xs">bug</span>
          </div>
          
          <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <span className="flex items-center gap-1">
              <MessageCircle size={12} />
              2
            </span>
            <span className="ml-1">#16 •</span>
            <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
            <span>gunssgar opened on Feb 24</span>
          </div>
        </div>
      </div>
    </div>
  );
}