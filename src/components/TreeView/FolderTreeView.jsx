import React from 'react';
import FolderNode from './FolderNode';

const FolderTreeView = ({ folders, expandedFolders, selectedFolder, loadingFolders, onToggle, onSelect }) => {

    // The recursive rendering logic now lives inside this component
    const renderNodes = (folderList, level = 0) => {
        return folderList.map(folder => (
            <React.Fragment key={folder.id}>
                <FolderNode
                    folder={folder}
                    level={level}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    isExpanded={expandedFolders.has(folder.id)}
                    isSelected={selectedFolder?.id === folder.id}
                    isLoading={loadingFolders.has(folder.id)}
                />
                {expandedFolders.has(folder.id) && folder.children && (
                    renderNodes(folder.children, level + 1)
                )}
            </React.Fragment>
        ));
    };

    return (
        <div className="bg-gray-800 rounded border border-gray-600 p-2 max-h-96 overflow-y-auto">
            {folders.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No folders found</div>
            ) : (
                renderNodes(folders)
            )}
        </div>
    );
};

export default FolderTreeView;