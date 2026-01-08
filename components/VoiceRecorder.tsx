
import React, { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (base64: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          onRecordingComplete(reader.result as string);
        };
        reader.readAsDataURL(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Microphone access is required for voice analysis.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
      <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
      <p className="flex-1 text-sm font-medium text-indigo-900">
        {isRecording ? "Listening to your voice..." : "Voice mode (Optional)"}
      </p>
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          isRecording 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-white text-indigo-600 shadow-sm hover:shadow-md'
        }`}
      >
        {isRecording ? "Stop Recording" : "Record Audio"}
      </button>
    </div>
  );
};

export default VoiceRecorder;
