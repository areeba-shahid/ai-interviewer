import React, { useState, useRef, useEffect } from "react";
import { listen, isSpeechSupported } from "../../utils/speech";
import Button from "../UI/Button";
import toast from "react-hot-toast";

const VoiceRecorder = ({ onTranscription, disabled, isListening }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedText, setRecordedText] = useState(""); // Store interim text
  const [finalTranscript, setFinalTranscript] = useState(""); // Store final transcript

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(""); // Ref to store transcript without causing re-renders

  useEffect(() => {
    if (!isSpeechSupported()) {
      setError(
        "Speech recognition not supported. Please use Chrome, Edge, or Safari."
      );
    }
  }, []);

  // Auto-start listening when isListening becomes true
  useEffect(() => {
    if (isListening && !isRecording && !disabled) {
      startListening();
    } else if (!isListening && isRecording) {
      stopListening();
    }
  }, [isListening]);

  const startListening = async () => {
    try {
      setError(null);
      setIsRecording(true);
      setRecordedText("");
      setFinalTranscript("");
      finalTranscriptRef.current = "";

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Set up audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const updateLevel = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();

      // Initialize speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + " ";
            finalTranscriptRef.current += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        // Update displayed text
        setRecordedText(finalTranscriptRef.current + interimTranscript);
        setFinalTranscript(finalTranscriptRef.current);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Recognition error:", event.error);
        if (event.error === "no-speech") {
          // Just ignore - user might not be speaking yet
        } else if (event.error === "not-allowed") {
          setError("Microphone access denied");
          stopListening();
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to access microphone:", error);
      if (
        error.name === "NotAllowedError" ||
        error.message.includes("permission")
      ) {
        setError(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
      } else if (error.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError(`Failed to access microphone: ${error.message}`);
      }
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setAudioLevel(0);

    // Update final transcript one last time
    setFinalTranscript(finalTranscriptRef.current);
  };

  const handleManualStop = () => {
    stopListening();
  };

  const handleSubmitAnswer = () => {
    if (finalTranscript.trim()) {
      onTranscription(finalTranscript.trim());
      setRecordedText("");
      setFinalTranscript("");
      finalTranscriptRef.current = "";
      toast.success("Answer submitted!");
    } else {
      toast.error("No answer recorded. Please speak first.");
    }
  };

  const handleRetry = () => {
    setError(null);
    setRecordedText("");
    setFinalTranscript("");
    finalTranscriptRef.current = "";
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <div className="text-xs text-gray-600 mb-3">
          <p className="font-medium mb-1">Troubleshooting tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Click the lock icon in your browser's address bar and allow
              microphone
            </li>
            <li>Check if microphone is not muted</li>
            <li>Try a different browser (Chrome works best)</li>
          </ul>
        </div>
        <Button variant="outline" size="sm" onClick={handleRetry}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-center gap-4">
        {isRecording ? (
          <>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Recording... Click Stop when finished
                </span>
              </div>
              {/* Audio level meter */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                />
              </div>
            </div>
            <Button
              onClick={handleManualStop}
              variant="outline"
              size="sm"
              className="ml-2 whitespace-nowrap"
            >
              ⏹️ Stop Recording
            </Button>
          </>
        ) : (
          <div className="text-sm text-gray-500">
            {disabled
              ? "Processing..."
              : "Click 'Start Recording' to begin speaking"}
          </div>
        )}
      </div>

      {/* Live Transcript Display */}
      {recordedText && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Live transcript:</p>
          <p className="text-sm text-gray-700">{recordedText}</p>
        </div>
      )}

      {/* Final Transcript Display */}
      {finalTranscript && !isRecording && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 mb-1">Your recorded answer:</p>
          <p className="text-sm text-gray-700">{finalTranscript}</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {/* Start Button */}
        {!isRecording && !disabled && !finalTranscript && (
          <Button onClick={startListening} variant="primary" className="flex-1">
            🎤 Start Recording
          </Button>
        )}

        {/* Submit Button - Only shows when there's a recorded answer and not recording */}
        {finalTranscript && !isRecording && !disabled && (
          <Button
            onClick={handleSubmitAnswer}
            variant="primary"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            ✅ Submit Answer
          </Button>
        )}

        {/* Clear Button - Shows when there's a transcript but user wants to retry */}
        {finalTranscript && !isRecording && !disabled && (
          <Button
            onClick={() => {
              setFinalTranscript("");
              setRecordedText("");
              finalTranscriptRef.current = "";
            }}
            variant="outline"
            size="sm"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
