import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Volume2, VolumeX } from "lucide-react";
import { RecordAnswer } from "./record-answer";

export const QuestionSection = ({ questions }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebCam, setIsWebCam] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [activeTab, setActiveTab] = useState(questions[0]?.question);

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentSpeech(null);
  };

  const handlePlayQuestion = (qst) => {
    if (isPlaying) {
      stopSpeech();
      return;
    }
    
    if ("speechSynthesis" in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(qst);
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
      setCurrentSpeech(speech);

      speech.onend = () => {
        setIsPlaying(false);
        setCurrentSpeech(null);
      };
    }
  };

  useEffect(() => {
    if (activeTab && "speechSynthesis" in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(activeTab);
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
      setCurrentSpeech(speech);

      speech.onend = () => {
        setIsPlaying(false);
        setCurrentSpeech(null);
      };
    }
    
    return () => {
      stopSpeech();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const advanceToNextQuestion = () => {
    const currentIndex = questions.findIndex(q => q.question === activeTab);
    if (currentIndex !== -1 && currentIndex < questions.length - 1) {
      setActiveTab(questions[currentIndex + 1].question);
    }
  };

  const handleAnswerSaved = (feedback) => {
    if (feedback && "speechSynthesis" in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(feedback);
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
      setCurrentSpeech(speech);

      speech.onend = () => {
        setIsPlaying(false);
        setCurrentSpeech(null);
        advanceToNextQuestion();
      };
    } else {
      advanceToNextQuestion();
    }
  };

  return (
    <div className="w-full min-h-96 border rounded-md p-4">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-12"
        orientation="vertical">
        
        <TabsList className="bg-transparent w-full flex flex-wrap items-center justify-start gap-4">
          {questions?.map((tab, i) =>
          <TabsTrigger
            className={cn(
              "data-[state=active]:bg-emerald-200 data-[state=active]:shadow-md text-xs px-2"
            )}
            key={tab.question}
            value={tab.question}>
              {`Question #${i + 1}`}
            </TabsTrigger>
          )}
        </TabsList>

        {questions?.map((tab, i) =>
        <TabsContent key={i} value={tab.question}>
            <p className="text-base text-left tracking-wide text-neutral-500">
              {tab.question}
            </p>

            <div className="w-full flex items-center justify-end">
              <TooltipButton
              content={isPlaying ? "Stop" : "Start"}
              icon={
              isPlaying ?
              <VolumeX className="min-w-5 min-h-5 text-muted-foreground" /> :
              <Volume2 className="min-w-5 min-h-5 text-muted-foreground" />
              }
              onClick={() => handlePlayQuestion(tab.question)} />
            </div>

            <RecordAnswer
            question={tab}
            isWebCam={isWebCam}
            setIsWebCam={setIsWebCam}
            onAnswerSaved={handleAnswerSaved} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};