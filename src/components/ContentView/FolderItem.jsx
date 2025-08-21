import React from 'react';
import { Folder } from 'lucide-react';

const FolderItem = ({ folder, onSelect, onOpen, isSelected }) => (
    <div
        className={`flex items-center p-2 hover:bg-gray-700 cursor-pointer rounded transition-colors ${
            isSelected ? 'bg-blue-800' : ''
        }`}
        onClick={() => onSelect(folder)}
        onDoubleClick={() => onOpen(folder)}
    >
        <Folder size={20} className="mr-3 text-yellow-400 flex-shrink-0" />
        <span className="text-sm text-gray-200 truncate">{folder.name}</span>
    </div>
);

export default FolderItem;