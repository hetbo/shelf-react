import React from 'react';
import { File as FileIcon } from 'lucide-react';
import {filesize} from 'filesize';

const FileItem = ({ file, onSelect, isSelected }) => (
    <div
        className={`flex items-center p-2 hover:bg-gray-700 cursor-pointer rounded transition-colors ${
            isSelected ? 'bg-blue-800' : ''
        }`}
        onClick={() => onSelect(file)}
    >
        <FileIcon size={20} className="mr-3 text-gray-400 flex-shrink-0" />
        <div className="flex-1 truncate">
            <div className="text-sm text-gray-200 truncate">{file.filename}</div>
        </div>
        <div className="text-xs text-gray-500 ml-4">{filesize(file.size || 0)}</div>
    </div>
);

export default FileItem;