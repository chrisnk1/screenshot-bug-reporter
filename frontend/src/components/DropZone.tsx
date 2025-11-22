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
        relative group cursor-pointer
        rounded-xl p-12 text-center
        border border-dashed transition-all duration-300 ease-out
        ${isDragActive
                    ? 'border-primary-900 bg-primary-50 scale-[1.01]'
                    : 'border-primary-200 bg-surface hover:border-primary-400 hover:bg-primary-50'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center space-y-6">
                {/* Icon */}
                <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
                    ${isDragActive ? 'bg-primary-200 text-primary-900' : 'bg-primary-100 text-primary-500 group-hover:text-primary-900 group-hover:bg-primary-200'}
                `}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <p className="text-lg font-medium text-primary-900">
                        {isDragActive ? 'Drop to upload' : 'Click or drag screenshot'}
                    </p>
                    <p className="text-sm text-primary-400 font-light">
                        PNG, JPG, WebP up to 10MB
                    </p>
                </div>
            </div>
        </div>
    );
}
