'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { MicIcon, MicOffIcon } from 'lucide-react';
import { toast } from 'sonner';

export function SpeechToText({
  onTranscript,
}: {
  onTranscript: (transcript: string) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startListening = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const options = { mimeType: 'audio/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          toast.error(`${options.mimeType} is not supported on this browser.`);
          return;
        }
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
          console.log('Audio Blob:', audioBlob);
          audioChunksRef.current = [];
          const apiKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;

          if (!apiKey) {
            toast.error('Azure Speech API key is not configured.');
            return;
          }

          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');
          console.log('FormData:', formData);

          try {
            const response = await fetch('https://ritan-mcxuafvh-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o-transcribe/audio/transcriptions?api-version=2025-03-01-preview', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
              body: formData,
            });

            console.log('Azure Response:', response);

            if (response.ok) {
              const data = await response.json();
              console.log('Transcription Data:', data);
              onTranscript(data.text);
            } else {
              const error = await response.json();
              console.error('Azure Error:', error);
              toast.error(`ERROR: ${error.error.message}`);
            }
          } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Failed to transcribe audio.');
          }
        };
        mediaRecorderRef.current.start();
        setIsListening(true);
      } catch (error) {
        toast.error('Microphone access denied.');
      }
    } else {
      toast.error('Audio recording is not supported by your browser.');
    }
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return (
    <Button
      data-testid="speech-to-text-button"
      className="rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      }}
      variant="ghost"
    >
      {isListening ? <MicOffIcon size={14} /> : <MicIcon size={14} />}
    </Button>
  );
}
