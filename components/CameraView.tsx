
import React, { useRef, useState, useEffect } from 'react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  existingImage: string | null;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, existingImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Effect to attach stream to video element once it is rendered
  useEffect(() => {
    let mounted = true;
    
    if (isActive && stream && videoRef.current) {
      const video = videoRef.current;
      
      // Ensure we don't re-assign if it's already set
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        
        const handlePlay = async () => {
          try {
            if (mounted) {
              await video.play();
            }
          } catch (err) {
            console.error("Video play failed:", err);
          }
        };

        video.onloadedmetadata = handlePlay;
      }
    }

    return () => {
      mounted = false;
    };
  }, [isActive, stream]);

  // Cleanup effect to stop camera tracks on unmount or when stream changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera access.");
      }

      let s: MediaStream;
      try {
        // Try ideal high-quality constraints first
        s = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (err) {
        console.warn("Failed with ideal constraints, falling back to basic video", err);
        // Fallback to simplest possible constraints
        s = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(s);
      setIsActive(true);
      setError(null);
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Permission denied. Please allow camera access in your browser settings to continue.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No camera found on this device.");
      } else {
        setError("Could not access camera. It might be used by another application.");
      }
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure canvas matches actual video feed dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the capture if needed (matches the preview)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  if (existingImage && !isActive) {
    return (
      <div className="relative group">
        <img src={existingImage} alt="Captured" className="w-full h-64 object-cover rounded-xl shadow-inner bg-gray-100" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
          <button 
            onClick={startCamera}
            className="px-6 py-2 bg-white text-gray-900 rounded-full font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
          >
            Retake Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
        {isActive ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the selfie view for better UX
          />
        ) : (
          <div className="text-center p-6 bg-white w-full h-full flex flex-col items-center justify-center">
            {error ? (
              <div className="text-red-500 mb-4 px-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-sm font-medium leading-tight">{error}</p>
              </div>
            ) : (
              <div className="text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-3 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.172-1.172A1 1 0 0011.828 3H8.172a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                <p className="text-sm mb-4">Capture your expression for better results</p>
              </div>
            )}
            {!isActive && (
              <button 
                onClick={startCamera}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                Enable Camera
              </button>
            )}
          </div>
        )}
      </div>

      {isActive && (
        <div className="flex gap-3">
          <button 
            onClick={capture}
            className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-xl shadow-pink-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Capture Photo
          </button>
          <button 
            onClick={stopCamera}
            className="px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
