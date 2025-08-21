import React from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';

const FolderNode = ({ folder, level = 0, onToggle, onSelect, isExpanded, isSelected, isLoading }) => {
    const hasChildren = folder.has_children;

    return (
        <div>
            <div
                className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer rounded transition-colors ${
                    isSelected ? 'bg-blue-900 text-blue-200' : 'text-gray-200'
                }`}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={() => onSelect(folder)}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(folder.id); }}
                        className="mr-1 p-1 hover:bg-gray-600 rounded transition-colors"
                    >
                        {isLoading ? ( <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div> )
                            : isExpanded ? ( <ChevronDown size={14} /> ) : ( <ChevronRight size={14} /> )}
                    </button>
                ) : ( <div className="w-6"></div> )}

                {isExpanded ? ( <FolderOpen size={16} className="mr-2 text-yellow-400" /> )
                    : ( <Folder size={16} className="mr-2 text-yellow-400" /> )}
                <span className="text-sm font-medium">{folder.name}</span>
            </div>
        </div>
    );
};

export default FolderNode;