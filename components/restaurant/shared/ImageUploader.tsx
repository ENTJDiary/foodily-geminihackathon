import React, { useRef } from 'react';
import { compressImage } from '../../../utils/imageCompression';

interface ImageUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    gridCols?: 2 | 3 | 4;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    images,
    onImagesChange,
    maxImages = 12,
    gridCols = 2,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const remainingSlots = maxImages - images.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        console.log(`🖼️ Processing ${filesToProcess.length} images...`);

        const newImages: string[] = [];
        for (const file of filesToProcess) {
            try {
                const originalSize = ((file as File).size / 1024).toFixed(2);
                console.log(`Original: ${originalSize}KB`);

                const compressed = await compressImage(file as File);
                const compressedSize = ((compressed.length * 0.75) / 1024).toFixed(2);
                console.log(`Compressed: ${compressedSize}KB (${((1 - parseFloat(compressedSize) / parseFloat(originalSize)) * 100).toFixed(0)}% reduction)`);

                newImages.push(compressed);
            } catch (error) {
                console.error('Failed to compress image:', error);
                alert('Failed to process one or more images. Please try again.');
            }
        }

        onImagesChange([...images, ...newImages]);
        e.target.value = '';
    };

    const handleRemoveImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
    };

    return (
        <div className={`grid grid-cols-${gridCols} gap-4`}>
            {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm">
                    <img src={img} className="w-full h-full object-cover" alt={`Upload ${idx + 1}`} />
                    <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        type="button"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}

            {images.length < maxImages && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-white border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition-all group"
                >
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Add Photo</span>
                    <span className="text-[9px] font-bold text-slate-300">{images.length}/{maxImages}</span>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
            />
        </div>
    );
};

export default ImageUploader;
