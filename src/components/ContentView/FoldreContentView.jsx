import React from 'react';
import FolderItem from './FolderItem';
import FileItem from './FileItem';

const FolderContentView = ({ content, onFolderOpen, onItemSelected, selectedItem }) => {
    const { folders = [], files = [] } = content || {};

    return (
        <div className="bg-gray-800 rounded border border-gray-600 p-2 max-h-96 overflow-y-auto">
            {folders.length === 0 && files.length === 0 ? (
                <div className="text-gray-400 text-center py-8">Folder is empty</div>
            ) : (
                <div className="space-y-1">
                    {folders.map(folder => (
                        <FolderItem
                            key={`folder-${folder.id}`}
                            folder={folder}
                            onOpen={onFolderOpen}
                            onSelect={onItemSelected}
                            isSelected={selectedItem?.type === 'folder' && selectedItem?.id === folder.id}
                        />
                    ))}
                    {files.map(file => (
                        <FileItem
                            key={`file-${file.id}`}
                            file={file}
                            onSelect={onItemSelected}
                            isSelected={selectedItem?.type === 'file' && selectedItem?.id === file.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FolderContentView;