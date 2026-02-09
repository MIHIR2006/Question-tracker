"use client"

import { useState } from "react"
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
  ChevronDown
} from "lucide-react"

type Tag = string;

type Question = {
  id: string;
  title: string;
  status: "completed" | "pending";
  difficulty: "Easy" | "Medium" | "Hard";
  tags: Tag[];
  link: string;
  notes?: boolean;
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
  manualProgress?: string;
};


const initialData: Topic[] = [
  {
    id: "arrays-sorting",
    title: "Arrays & Sorting",
    subtopics: [
      {
        id: "easy",
        title: "Easy",
        questions: [
          {
            id: "majority-element",
            title: "Majority Element",
            status: "completed",
            difficulty: "Easy",
            tags: ["Arrays", "HashMap and Set"],
            link: "https://leetcode.com/problems/majority-element/description/",
            starred: true,
            notes: true
          },
          {
            id: "remove-duplicates",
            title: "Remove Duplicates from Sorted Array",
            status: "pending",
            difficulty: "Easy",
            tags: ["Arrays", "Two Pointers"],
            link: "#",
            starred: false,
            notes: false
          }
        ]
      },
      {
        id: "medium",
        title: "Medium",
        questions: [
          {
            id: "search-rotated",
            title: "Search in Rotated Sorted Array",
            status: "pending",
            difficulty: "Medium",
            tags: ["Arrays", "Binary Search"],
            link: "#",
            starred: true,
            notes: true
          },
          {
            id: "3sum",
            title: "3Sum",
            status: "pending",
            difficulty: "Medium",
            tags: ["Arrays", "Two Pointers"],
            link: "#",
            starred: false,
            notes: false
          }
        ]
      },
      {
        id: "hard",
        title: "Hard",
        questions: [
          {
            id: "trapping-rain",
            title: "Trapping Rain Water",
            status: "pending",
            difficulty: "Hard",
            tags: ["Arrays", "Two Pointers"],
            link: "#",
            starred: true,
            notes: true
          }
        ]
      }
    ]
  },
  {
    id: "strings-searching",
    title: "Strings & Searching",
    subtopics: [
      {
        id: "strings-easy",
        title: "Easy",
        questions: [
          {
            id: "valid-anagram",
            title: "Valid Anagram",
            status: "completed",
            difficulty: "Easy",
            tags: ["Strings", "HashTable"],
            link: "#",
            starred: false,
            notes: true
          },
          {
            id: "valid-palindrome",
            title: "Valid Palindrome",
            status: "completed",
            difficulty: "Easy",
            tags: ["Strings", "Two Pointers"],
            link: "#",
            starred: true,
            notes: false
          }
        ]
      },
      {
        id: "strings-medium",
        title: "Medium",
        questions: [
          {
            id: "longest-substring",
            title: "Longest Substring Without Repeating",
            status: "pending",
            difficulty: "Medium",
            tags: ["Strings", "Sliding Window"],
            link: "#",
            starred: true,
            notes: true
          }
        ]
      }
    ]
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    manualProgress: "0 / 11",
    subtopics: []
  },
  {
    id: "trees",
    title: "Trees",
    manualProgress: "0 / 12",
    subtopics: []
  },
  {
    id: "dp",
    title: "Dynamic Programming",
    manualProgress: "1 / 12",
    subtopics: []
  },
  {
    id: "misc",
    title: "Miscellaneous",
    manualProgress: "1 / 8",
    subtopics: []
  }
];

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>(initialData);

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
    if (topic.manualProgress && topic.subtopics.length === 0) {
      return { text: topic.manualProgress, percent: 0 };
    }

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
    <div className="min-h-screen bg-background text-foreground p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Action */}
        <div className="flex justify-end">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4">
            <Plus className="mr-2 h-4 w-4" /> Add <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Main Accordion */}
        <Accordion type="multiple" defaultValue={["arrays-sorting"]} className="w-full space-y-4">
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
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                        <span className="font-medium text-foreground text-base">{topic.title}</span>
                        <span className="text-muted-foreground text-sm font-mono">{progress.text}</span>
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
                    <Accordion type="multiple" defaultValue={["easy", "medium", "hard", "strings-easy", "strings-medium"]} className="w-full space-y-3">
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
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground font-medium">{subtopic.title}</span>
                                  <span className="text-muted-foreground/70 text-xs pt-0.5">{subProgress.text}</span>
                                </div>
                              </AccordionTrigger>
                            </div>

                            <AccordionContent className="pt-2 pb-0">
                              <div className="space-y-2">
                                {subtopic.questions.map((q) => (
                                  <div key={q.id} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-md hover:border-muted-foreground/30 transition-colors group flex-nowrap">
                                    <div className="flex items-center gap-4">
                                      <div
                                        className="cursor-pointer hover:scale-110 transition-transform"
                                        onClick={() => toggleQuestionStatus(topic.id, subtopic.id, q.id)}
                                      >
                                        {q.status === "completed" ? (
                                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-emerald-500" />
                                        )}
                                      </div>
                                      <span className="text-foreground text-sm font-medium select-none">{q.title}</span>
                                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                                    </div>

                                    <div className="flex items-center">
                                      {/* Logo column - fixed width */}
                                      <div className="w-8 flex items-center justify-center">
                                        {q.link && (
                                          <a
                                            href={q.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cursor-pointer hover:opacity-80 transition-opacity flex items-center"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Image
                                              src="/assets/leetcode_dark.png"
                                              alt="LeetCode"
                                              width={20}
                                              height={20}
                                              className="w-5 h-5 object-contain"
                                            />
                                          </a>
                                        )}
                                      </div>

                                      {/* Difficulty column - fixed width */}
                                      <div className="w-16 flex items-center justify-center">
                                        <span className={`text-xs font-semibold
                                        ${q.difficulty === "Easy" ? "text-emerald-500" :
                                            q.difficulty === "Medium" ? "text-yellow-500" :
                                              "text-red-500"
                                          }`}>
                                          {q.difficulty}
                                        </span>
                                      </div>

                                      {/* Tags column - fixed width */}
                                      <div className="w-48 flex items-center justify-end gap-2">
                                        {q.tags.map(tag => (
                                          <span
                                            key={tag}
                                            className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded max-w-[80px] truncate"
                                            title={tag}
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                        {q.difficulty === "Easy" && (
                                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">+1</span>
                                        )}
                                        {q.difficulty === "Hard" && (
                                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">+2</span>
                                        )}
                                      </div>

                                      {/* Icons column - fixed width */}
                                      <div className="w-20 flex items-center justify-end gap-3 pl-4 border-l border-border ml-4">
                                        <Star
                                          className={`h-4 w-4 cursor-pointer hover:scale-110 transition-transform ${q.starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                                          onClick={() => toggleStar(topic.id, subtopic.id, q.id)}
                                        />
                                        <FileText className={`h-4 w-4 cursor-pointer hover:text-foreground transition-colors ${q.notes ? "text-primary" : "text-muted-foreground"}`} />
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
                    null
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
