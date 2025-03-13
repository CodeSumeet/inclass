import React, { useState } from "react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt = "Image" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = () => {
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={openPreview}
        className="cursor-pointer hover:opacity-90 transition-opacity max-w-full rounded-md"
      />

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-800 hover:bg-gray-200"
              onClick={closePreview}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
