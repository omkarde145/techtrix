'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, Globe, MessageSquare } from 'lucide-react';
import { 
  SUPPORTED_BHASHINI_LANGUAGES, 
  BhashiniLangCode, 
  generateBeneficiaryAudioScript, 
  playAudioSpeech 
} from '@/lib/engines/bhashiniVoiceEngine';
import { Beneficiary, StageType } from '@/types';

interface BhashiniVoiceAssistantProps {
  beneficiary?: Beneficiary;
  stage?: StageType;
  amount?: number;
  onTranscriptReceived?: (text: string) => void;
}

export function BhashiniVoiceAssistant({
  beneficiary,
  stage = 'plinth',
  amount = 40000,
  onTranscriptReceived,
}: BhashiniVoiceAssistantProps) {
  const [selectedLang, setSelectedLang] = useState<BhashiniLangCode>('hi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [simulatedSent, setSimulatedSent] = useState(false);

  // Generate dynamic voice script
  const scriptText = beneficiary 
    ? generateBeneficiaryAudioScript(beneficiary, stage, amount, selectedLang)
    : `नमस्ते। प्रधानमंत्री आवास योजना ग्रामीण निरीक्षण प्रणाली में आपका स्वागत है।`;

  const handlePlayAudio = async () => {
    setIsPlaying(true);
    await playAudioSpeech(scriptText, selectedLang);
    setIsPlaying(false);
  };

  const handleSendWhatsAppDispatch = () => {
    setSimulatedSent(true);
    setTimeout(() => setSimulatedSent(false), 5000);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulate speech recognition result after 2.5 seconds
      setTimeout(() => {
        setIsRecording(false);
        const sampleDictation = selectedLang === 'hi'
          ? 'प्ललिंथ स्तर का निर्माण कार्य पूर्ण पाया गया। डीपीसी बीम की तराई ठीक से की गई है।'
          : 'Plinth beam completed with approved mix ratio. Curing period satisfied.';
        if (onTranscriptReceived) {
          onTranscriptReceived(sampleDictation);
        }
      }, 2500);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <Volume2 className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Bhashini AI Vernacular Voice &amp; WhatsApp Dispatch</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Digital India
              </span>
            </h4>
            <p className="text-[10px] text-slate-500">Speech-to-text dictation &amp; multi-lingual DBT audio notifications</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as BhashiniLangCode)}
            className="bg-transparent text-xs text-blue-700 font-bold focus:outline-hidden pr-1 cursor-pointer"
          >
            {SUPPORTED_BHASHINI_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-white text-slate-900">
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spoken Script Box */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            Synthesized Spoken Notification:
          </span>
          <span className="text-blue-700 font-bold text-[10px]">
            Target: {beneficiary ? beneficiary.name : 'Beneficiary'} ({beneficiary ? beneficiary.contactNumber : '+91-XXXXX'})
          </span>
        </div>
        <p className="text-xs text-slate-800 leading-relaxed font-medium italic">
          &quot;{scriptText}&quot;
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          {/* Play Audio Button */}
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlaying ? 'Speaking Audio...' : 'Listen to Spoken Audio'}</span>
          </button>

          {/* Dictate Notes Button */}
          {onTranscriptReceived && (
            <button
              onClick={toggleRecording}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                isRecording
                  ? 'bg-rose-50 text-rose-800 border-rose-200 animate-bounce'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-blue-700" />}
              <span>{isRecording ? 'Listening...' : 'Voice Dictate Notes'}</span>
            </button>
          )}
        </div>

        {/* WhatsApp Dispatch Button */}
        <button
          onClick={handleSendWhatsAppDispatch}
          disabled={simulatedSent}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
            simulatedSent
              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}
        >
          {simulatedSent ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice Note Dispatched!</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulate WhatsApp Audio Dispatch</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
