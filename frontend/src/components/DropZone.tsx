import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropZoneProps {
    onFileSelected: (file: File) => void;
    disabled?: boolean;
}

export function DropZone({ onFileSelected, disabled }: DropZoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelected(acceptedFiles[0]);
        }
    }, [onFileSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        multiple: false,
        disabled,
    });

    return (
        <div
            {...getRootProps()}
            className={`
        glass rounded-2xl p-12 text-center cursor-pointer
        transition-all duration-300 transform
        ${isDragActive ? 'scale-105 border-primary-400 bg-primary-500/20' : 'hover:scale-102 hover:border-primary-500/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center space-y-4">
                {/* Icon */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center animate-pulse-slow">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Text */}
                <div>
                    <h3 className="text-2xl font-bold mb-2">
                        {isDragActive ? 'Drop your screenshot here' : 'Drag & drop a screenshot'}
                    </h3>
                    <p className="text-gray-300">
                        or click to browse • PNG, JPG, GIF, WebP
                    </p>
                </div>

                {/* Hint */}
                <div className="mt-4 px-6 py-3 glass rounded-lg">
                    <p className="text-sm text-gray-300">
                        💡 <span className="font-semibold">Tip:</span> Include error messages and URLs in your screenshot for best results
                    </p>
                </div>
            </div>
        </div>
    );
}
