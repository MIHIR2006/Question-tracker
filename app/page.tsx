"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  MoreVertical,
  Plus,
  GripVertical,
  CheckCircle2,
  Circle,
  ExternalLink,
  Star,
  FileText,
  ChevronDown,
  Youtube
} from "lucide-react"
import sheetData from "@/sheet.json"

type SheetQuestion = {
  _id: string;
  questionId: {
    name: string;
    difficulty: string;
    platform: string;
    problemUrl: string;
    topics: string[];
  };
  topic: string;
  title: string;
  subTopic: string;
  resource: string;
  isSolved: boolean;
};

type Question = {
  id: string;
  title: string;
  status: "completed" | "pending";
  difficulty: "Easy" | "Medium" | "Hard" | "Basic";
  platform: string;
  link: string;
  resource?: string;
  topics: string[];
  starred?: boolean;
};

type SubTopic = {
  id: string;
  title: string;
  questions: Question[];
};

type Topic = {
  id: string;
  title: string;
  subtopics: SubTopic[];
};

// Transform sheet.json data into our UI structure
function transformSheetData(data: any): Topic[] {
  const questions: SheetQuestion[] = data.data.questions;
  const topicsMap = new Map<string, Map<string, Question[]>>();

  questions.forEach((q) => {
    const topicName = q.topic;
    const subTopicName = q.subTopic;

    if (!topicsMap.has(topicName)) {
      topicsMap.set(topicName, new Map());
    }

    const subTopicsMap = topicsMap.get(topicName)!;
    if (!subTopicsMap.has(subTopicName)) {
      subTopicsMap.set(subTopicName, []);
    }

    const question: Question = {
      id: q._id,
      title: q.questionId.name,
      status: q.isSolved ? "completed" : "pending",
      difficulty: q.questionId.difficulty as any,
      platform: q.questionId.platform,
      link: q.questionId.problemUrl,
      resource: q.resource,
      topics: q.questionId.topics,
      starred: false,
    };

    subTopicsMap.get(subTopicName)!.push(question);
  });

  const topics: Topic[] = [];
  topicsMap.forEach((subTopicsMap, topicName) => {
    const subtopics: SubTopic[] = [];
    subTopicsMap.forEach((questions, subTopicName) => {
      subtopics.push({
        id: subTopicName.toLowerCase().replace(/\s+/g, '-'),
        title: subTopicName,
        questions
      });
    });

    topics.push({
      id: topicName.toLowerCase().replace(/\s+/g, '-'),
      title: topicName,
      subtopics
    });
  });

  return topics;
}

function getPlatformLogo(platform: string) {
  switch (platform.toLowerCase()) {
    case 'leetcode':
      return '/assets/leetcode_dark.png';
    case 'geeksforgeeks':
      return '/assets/GeeksForGeeks_logo.png';
    case 'codestudio':
      return '/assets/codestudio.png'; 
    default:
      return '/assets/leetcode_dark.png';
  }
}

export default function Home() {
  const initialTopics = useMemo(() => transformSheetData(sheetData), []);
  const [topics, setTopics] = useState<Topic[]>(initialTopics);

  const toggleQuestionStatus = (topicId: string, subTopicId: string, questionId: string) => {
    setTopics(prev => prev.map(topic => {
      if (topic.id !== topicId) return topic;

      const newSubtopics = topic.subtopics.map(sub => {
        if (sub.id !== subTopicId) return sub;

        const newQuestions = sub.questions.map(q => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            status: q.status === "completed" ? "pending" : "completed"
          } as Question;
        });

        return { ...sub, questions: newQuestions };
      });

      return { ...topic, subtopics: newSubtopics };
    }));
  };

  const toggleStar = (topicId: string, subTopicId: string, questionId: string) => {
    setTopics(prev => prev.map(topic => {
      if (topic.id !== topicId) return topic;
      const newSubtopics = topic.subtopics.map(sub => {
        if (sub.id !== subTopicId) return sub;
        const newQuestions = sub.questions.map(q => {
          if (q.id !== questionId) return q;
          return { ...q, starred: !q.starred } as Question;
        });
        return { ...sub, questions: newQuestions };
      });
      return { ...topic, subtopics: newSubtopics };
    }));
  };

  const calculateTopicProgress = (topic: Topic) => {
    let completed = 0;
    let total = 0;

    topic.subtopics.forEach(sub => {
      sub.questions.forEach(q => {
        total++;
        if (q.status === "completed") completed++;
      });
    });

    const percent = total > 0 ? (completed / total) * 100 : 0;
    return { text: `${completed} / ${total}`, percent };
  };

  const calculateSubtopicProgress = (subtopic: SubTopic) => {
    let completed = 0;
    let total = subtopic.questions.length;
    subtopic.questions.forEach(q => {
      if (q.status === "completed") completed++;
    });
    const percent = total > 0 ? (completed / total) * 100 : 0;
    return { text: `${completed} / ${total}`, percent };
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Sheet Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">{sheetData.data.sheet.name}</h1>
            <p className="text-muted-foreground text-sm max-w-3xl">{sheetData.data.sheet.description}</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Main Accordion */}
        <Accordion type="multiple" className="w-full space-y-4">
          {topics.map((topic) => {
            const progress = calculateTopicProgress(topic);

            return (
              <AccordionItem
                key={topic.id}
                value={topic.id}
                className="border border-border bg-card rounded-[4px] overflow-hidden"
              >
                <div className="relative">
                  {/* Progress Bar for Topic */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-muted z-20 pointer-events-none">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-in-out"
                      style={{ width: `${progress.percent}%` }}
                    />

                  </div>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card data-[state=open]:bg-card border-b border-transparent data-[state=open]:border-border transition-colors relative z-10 group">
                    <div className="flex items-center justify-between w-full pr-4 min-w-0">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                        <span className="font-medium text-foreground text-base truncate">{topic.title}</span>
                        <span className="text-muted-foreground text-sm font-mono flex-shrink-0">{progress.text}</span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button asChild variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted px-3">
                          <div role="button">
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </div>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                          <div role="button">
                            <MoreVertical className="h-4 w-4" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>

                <AccordionContent className="p-4 bg-background">
                  {topic.subtopics.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-3">
                      {topic.subtopics.map((subtopic) => {
                        const subProgress = calculateSubtopicProgress(subtopic);
                        return (
                          <AccordionItem key={subtopic.id} value={subtopic.id} className="border border-border rounded-md overflow-hidden">
                            <div className="relative">
                              {/* Progress Bar for Subtopic */}
                              <div className="absolute top-0 left-0 w-full h-[2px] bg-muted z-20 pointer-events-none">
                                <div
                                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                                  style={{ width: `${subProgress.percent}%` }}
                                />
                              </div>
                              <AccordionTrigger className="px-4 py-2 hover:no-underline bg-card text-sm group">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <span className="text-muted-foreground font-medium truncate">{subtopic.title}</span>
                                  <span className="text-muted-foreground/70 text-xs pt-0.5 flex-shrink-0">{subProgress.text}</span>
                                </div>
                              </AccordionTrigger>
                            </div>

                            <AccordionContent className="pt-2 pb-0">
                              <div className="space-y-2">
                                {subtopic.questions.map((q) => (
                                  <div key={q.id} className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-3 bg-card border border-border rounded-md hover:border-muted-foreground/30 transition-colors group">
                                    <div className="flex items-center gap-4 w-full md:flex-1 md:min-w-0 mb-3 md:mb-0">
                                      <div
                                        className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                                        onClick={() => toggleQuestionStatus(topic.id, subtopic.id, q.id)}
                                      >
                                        {q.status === "completed" ? (
                                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-emerald-500" />
                                        )}
                                      </div>
                                      <span className="text-foreground text-sm font-medium select-none truncate">{q.title}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:flex-shrink-0 justify-between md:justify-end">
                                      <div className="flex items-center gap-4">
                                        {/* YouTube Resource Link */}
                                        {q.resource && (
                                          <a
                                            href={q.resource}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cursor-pointer hover:opacity-80 transition-opacity flex items-center"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Watch tutorial"
                                          >
                                            <Image
                                              src="/assets/Youtube.png"
                                              alt="YouTube"
                                              width={20}
                                              height={20}
                                              className="w-5 h-5 object-contain"
                                            />
                                          </a>
                                        )}

                                        {/* Platform Logo */}
                                        <a
                                          href={q.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="cursor-pointer hover:opacity-80 transition-opacity flex items-center"
                                          onClick={(e) => e.stopPropagation()}
                                          title={`Open on ${q.platform}`}
                                        >
                                          <Image
                                            src={getPlatformLogo(q.platform)}
                                            alt={q.platform}
                                            width={20}
                                            height={20}
                                            className="w-5 h-5 object-contain"
                                          />
                                        </a>

                                        {/* Difficulty */}
                                        <div className="w-auto md:w-16 flex items-center justify-start md:justify-center">
                                          <span className={`text-xs font-semibold ${q.difficulty === "Easy" || q.difficulty === "Basic" ? "text-emerald-500" :
                                            q.difficulty === "Medium" ? "text-yellow-500" :
                                              "text-red-500"
                                            }`}>
                                            {q.difficulty}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">
                                        {/* Topics/Tags */}
                                        <div className="w-auto md:w-48 flex items-center justify-end gap-2">
                                          {q.topics.slice(0, 2).map((topic, idx) => (
                                            <span
                                              key={idx}
                                              className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded max-w-[80px] md:max-w-[100px] truncate"
                                              title={topic}
                                            >
                                              {topic}
                                            </span>
                                          ))}
                                          {q.topics.length > 2 && (
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                              +{q.topics.length - 2}
                                            </span>
                                          )}
                                        </div>

                                        {/* Action Icons */}
                                        <div className="w-auto md:w-16 flex items-center justify-end gap-3 pl-2 md:pl-4 border-l border-border">
                                          <Star
                                            className={`h-4 w-4 cursor-pointer hover:scale-110 transition-transform ${q.starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleStar(topic.id, subtopic.id, q.id);
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                    </Accordion>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No questions available</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}
