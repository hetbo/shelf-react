// In src/components/DetailsView/DetailsSidebar.jsx
import React, { useState } from 'react';
import { Plus, Check, X, Trash2, Edit } from 'lucide-react';

// A single row of metadata, which can be in view or edit mode
const MetadataRow = ({ meta, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(meta.value);

    const handleUpdate = () => {
        onUpdate(meta.id, { value });
        setIsEditing(false);
    };

    const isJson = (str) => {
        try { JSON.parse(str); } catch (e) { return false; }
        return true;
    }

    // Display parsed JSON nicely if possible
    const displayValue = isJson(meta.value)
        ? JSON.stringify(JSON.parse(meta.value), null, 2)
        : meta.value;

    return (
        <div className="flex items-center justify-between text-sm group">
            <span className="font-semibold text-gray-400 w-1/3 truncate">{meta.key}</span>
            <div className="w-2/3 ml-2">
                {isEditing ? (
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                        />
                        <button onClick={handleUpdate} className="p-1 text-green-400 hover:text-green-300"><Check size={16}/></button>
                        <button onClick={() => setIsEditing(false)} className="p-1 text-red-400 hover:text-red-300"><X size={16}/></button>
                    </div>
                ) : (
                    <pre className="text-gray-200 whitespace-pre-wrap break-all">{displayValue}</pre>
                )}
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEditing && <button onClick={() => setIsEditing(true)} className="p-1 text-blue-400 hover:text-blue-300"><Edit size={14}/></button>}
                <button onClick={() => onDelete(meta.id)} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={14}/></button>
            </div>
        </div>
    );
};

// The form for adding new metadata
const AddMetadataForm = ({ fileId, onAdd }) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault(); // <-- ADD THIS LINE to stop the redirect
        if (!key || !value) return;
        onAdd(fileId, { key, value });
        setKey('');
        setValue('');
        setIsAdding(false);
    };

    if (!isAdding) {
        return (
            <button onClick={() => setIsAdding(true)} className="flex items-center text-sm text-green-400 hover:text-green-300 mt-4">
                <Plus size={16} className="mr-1"/> Add Metadata
            </button>
        )
    }

    return (
        <form onSubmit={handleAdd} className="mt-4 pt-4 border-t border-gray-700 space-y-2">
            <input type="text" placeholder="Key (e.g., Author)" value={key} onChange={e => setKey(e.target.value)} className="bg-gray-900 border border-gray-600 rounded w-full px-2 py-1 text-sm" />
            <input type="text" placeholder="Value" value={value} onChange={e => setValue(e.target.value)} className="bg-gray-900 border border-gray-600 rounded w-full px-2 py-1 text-sm" />
            <div className="flex items-center space-x-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-1 text-sm">Save</button>
                <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-600 hover:bg-gray-500 rounded px-3 py-1 text-sm">Cancel</button>
            </div>
        </form>
    );
};

const DetailsSidebar = ({ item, onAddMetadata, onUpdateMetadata, onDeleteMetadata }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-3 text-green-400 border-b border-gray-700 pb-2">🔎 Details</h3>
            <div className="bg-gray-800 rounded border border-gray-600 p-3 min-h-[24rem]">
                {!item ? (
                    <div className="text-gray-400 text-center py-8">Select an item</div>
                ) : (
                    <div>
                        <div className="font-bold text-yellow-400 mb-4 pb-2 border-b border-gray-700 break-all">{item.name || item.filename}</div>
                        <h4 className="font-semibold text-gray-300 mb-2">Metadata</h4>
                        {item.type === 'file' ? (
                            <div className="space-y-2">
                                {item.metadata && item.metadata.length > 0 ? (
                                    item.metadata.map(meta => (
                                        <MetadataRow key={meta.id} meta={meta} onUpdate={onUpdateMetadata} onDelete={onDeleteMetadata} />
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No metadata for this file.</p>
                                )}
                                <AddMetadataForm fileId={item.id} onAdd={onAddMetadata}/>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Metadata is available for files only.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsSidebar;