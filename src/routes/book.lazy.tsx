import { createLazyFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useMediaQuery } from "@uidotdev/usehooks";
export const Route = createLazyFileRoute("/book")({
  component: BookChapter,
});

interface Question {
  question: string;
  answer: string;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
  questions: Question[];
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: "Chapter 1: Introduction to OCD",
    content:
      "Obsessive-Compulsive Disorder (OCD) is a mental health disorder that affects people of all ages and walks of life. It occurs when a person gets caught in a cycle of obsessions and compulsions. Obsessions are unwanted, intrusive thoughts, images, or urges that trigger intensely distressing feelings. Compulsions are behaviors an individual engages in to attempt to get rid of the obsessions and/or decrease their distress.",
    questions: [
      {
        question: "What does OCD stand for?",
        answer: "Obsessive-Compulsive Disorder",
      },
      {
        question: "What are obsessions?",
        answer:
          "unwanted, intrusive thoughts, images, or urges that trigger intensely distressing feelings",
      },
    ],
  },
  {
    id: 2,
    title: "Chapter 2: Understanding Obsessions",
    content:
      "Obsessions are persistent, intrusive thoughts, urges, or images that are experienced as unwanted and distressing. They can vary widely in content and may include fears of contamination, harm, or unacceptable thoughts.",
    questions: [
      {
        question: "What are obsessions?",
        answer:
          "persistent, intrusive thoughts, urges, or images that are experienced as unwanted and distressing",
      },
    ],
  },
];

function BookChapter() {
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  // const navigate = useNavigate();
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [chapterId, setChapterId] = useState<number>(1);
  
  useEffect(() => {
    const chapter = chapters.find((c) => c.id === chapterId);
    setCurrentChapter(chapter || null);
  }, [chapterId]);

  const handleAnswerSubmit = () => {
    const currentQuestion = currentChapter?.questions[currentQuestionIndex];
    if (currentQuestion) {
      setIsCorrect(userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase());
      if (userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
        setFeedbackText("Correct!");
      } else {
        setFeedbackText("Incorrect. Try again.");
      }
    }
  };

 

  const handleNextChapter = () => {
    setChapterId((prevId) => Math.min(prevId + 1, chapters.length));
    setCurrentQuestionIndex(0);
  };

  const handlePrevChapter = () => {
    setChapterId((prevId) => Math.max(prevId - 1, 1));
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="p-4 grid gap-4 ">
      {currentChapter && (
        <Card>
          <CardHeader>
            <CardTitle>{currentChapter.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{currentChapter.content}</p>
            <div className={`flex ${isSmallScreen ? "flex-col" : "flex-row"} justify-between mt-4`}>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevChapter}
                  disabled={chapterId === 1}
                  variant="outline"
                >
                  <ChevronLeft /> Previous Chapter
                </Button>
                <Button
                  onClick={handleNextChapter}
                  disabled={chapterId === chapters.length}
                >
                  Next Chapter <ChevronRight />
                </Button>
              </div>
            </div>
            {chapterId !== chapters.length && (
              <div className={`mt-4 ${isSmallScreen ? "w-full" : ""}`}>
                <div className="grid gap-2">
                  <Label htmlFor="answer">
                    {currentChapter.questions[currentQuestionIndex].question}
                  </Label>
                  <Input
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />
                  <Button onClick={handleAnswerSubmit} className="mt-2">
                    Check Answer
                  </Button>
                  <div
                    className={`${isCorrect === true ? "text-green-500" : isCorrect === false ? "text-red-500" : ""}`}
                  >
                    {feedbackText}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

