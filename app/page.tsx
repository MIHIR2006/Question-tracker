"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Image from "next/image"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  Plus,
  GripVertical,
  CheckCircle2,
  Circle,
  Star,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import sheetData from "@/sheet.json"
import { saveTopics, loadTopics } from "@/lib/storage"
import { TopicDialog } from "@/components/topic-dialog"
import { SubtopicDialog } from "@/components/subtopic-dialog"
import { QuestionDialog, type QuestionFormData } from "@/components/question-dialog"
import { DeleteDialog } from "@/components/delete-dialog"


type SheetQuestion = {
  _id: string
  questionId: {
    name: string
    difficulty: string
    platform: string
    problemUrl: string
    topics: string[]
  }
  topic: string
  title: string
  subTopic: string
  resource: string
  isSolved: boolean
}

type Question = {
  id: string
  title: string
  status: "completed" | "pending"
  difficulty: "Easy" | "Medium" | "Hard" | "Basic"
  platform: string
  link: string
  resource?: string
  topics: string[]
  starred?: boolean
}

type SubTopic = {
  id: string
  title: string
  questions: Question[]
}

type Topic = {
  id: string
  title: string
  subtopics: SubTopic[]
}


function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function transformSheetData(data: any): Topic[] {
  const questions: SheetQuestion[] = data.data.questions
  const topicsMap = new Map<string, Map<string, Question[]>>()

  questions.forEach((q) => {
    const topicName = q.topic
    const subTopicName = q.subTopic

    if (!topicsMap.has(topicName)) {
      topicsMap.set(topicName, new Map())
    }

    const subTopicsMap = topicsMap.get(topicName)!
    if (!subTopicsMap.has(subTopicName)) {
      subTopicsMap.set(subTopicName, [])
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
    }

    subTopicsMap.get(subTopicName)!.push(question)
  })

  const topics: Topic[] = []
  topicsMap.forEach((subTopicsMap, topicName) => {
    const subtopics: SubTopic[] = []
    subTopicsMap.forEach((questions, subTopicName) => {
      subtopics.push({
        id: subTopicName.toLowerCase().replace(/\s+/g, "-"),
        title: subTopicName,
        questions,
      })
    })

    topics.push({
      id: topicName.toLowerCase().replace(/\s+/g, "-"),
      title: topicName,
      subtopics,
    })
  })

  return topics
}

function getPlatformLogo(platform: string) {
  switch (platform.toLowerCase()) {
    case "leetcode":
      return "/assets/leetcode_dark.png"
    case "geeksforgeeks":
      return "/assets/GeeksForGeeks_logo.png"
    case "codestudio":
      return "/assets/codestudio.png"
    default:
      return "/assets/leetcode_dark.png"
  }
}


function SortableQuestionItem({
  q,
  topicId,
  subtopicId,
  toggleQuestionStatus,
  toggleStar,
  onEdit,
  onDelete,
}: {
  q: Question
  topicId: string
  subtopicId: string
  toggleQuestionStatus: (topicId: string, subTopicId: string, questionId: string) => void
  toggleStar: (topicId: string, subTopicId: string, questionId: string) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-3 bg-card border border-border rounded-md hover:border-muted-foreground/30 transition-colors group"
    >
      <div className="flex items-center gap-3 w-full md:flex-1 md:min-w-0 mb-3 md:mb-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
        </div>
        <div
          className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
          onClick={() => toggleQuestionStatus(topicId, subtopicId, q.id)}
        >
          {q.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-emerald-500" />
          )}
        </div>
        <span className="text-foreground text-sm font-medium select-none truncate">
          {q.title}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:flex-shrink-0 justify-between md:justify-end">
        <div className="flex items-center gap-4">

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


          <div className="w-auto md:w-16 flex items-center justify-start md:justify-center">
            <span
              className={`text-xs font-semibold ${q.difficulty === "Easy" || q.difficulty === "Basic"
                ? "text-emerald-500"
                : q.difficulty === "Medium"
                  ? "text-yellow-500"
                  : "text-red-500"
                }`}
            >
              {q.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">

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


          <div className="w-auto md:w-20 flex items-center justify-end gap-2 pl-2 md:pl-4 border-l border-border">
            <Star
              className={`h-4 w-4 cursor-pointer hover:scale-110 transition-transform ${q.starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                }`}
              onClick={(e) => {
                e.stopPropagation()
                toggleStar(topicId, subtopicId, q.id)
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}


function SortableSubtopicItem({
  subtopic,
  topicId,
  subProgress,
  toggleQuestionStatus,
  toggleStar,
  onRenameSubtopic,
  onDeleteSubtopic,
  onEditQuestion,
  onDeleteQuestion,
  questionSensors,
  onQuestionDragEnd,
}: {
  subtopic: SubTopic
  topicId: string
  subProgress: { text: string; percent: number }
  toggleQuestionStatus: (topicId: string, subTopicId: string, questionId: string) => void
  toggleStar: (topicId: string, subTopicId: string, questionId: string) => void
  onRenameSubtopic: () => void
  onDeleteSubtopic: () => void
  onEditQuestion: (q: Question) => void
  onDeleteQuestion: (q: Question) => void
  questionSensors: ReturnType<typeof useSensors>
  onQuestionDragEnd: (event: DragEndEvent) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtopic.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem
        value={subtopic.id}
        className="border border-border rounded-md overflow-hidden"
      >
        <div className="relative">

          <div className="absolute top-0 left-0 w-full h-[2px] bg-muted z-20 pointer-events-none">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${subProgress.percent}%` }}
            />
          </div>
          <AccordionTrigger className="px-4 py-2 hover:no-underline bg-card text-sm group">
            <div className="flex items-center justify-between w-full pr-4 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                </div>
                <span className="text-muted-foreground font-medium truncate">
                  {subtopic.title}
                </span>
                <span className="text-muted-foreground/70 text-xs pt-0.5 flex-shrink-0">
                  {subProgress.text}
                </span>
              </div>
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div role="button" tabIndex={0} className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onRenameSubtopic}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={onDeleteSubtopic}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </AccordionTrigger>
        </div>

        <AccordionContent className="pt-2 pb-0">
          <DndContext
            sensors={questionSensors}
            collisionDetection={closestCenter}
            onDragEnd={onQuestionDragEnd}
          >
            <SortableContext
              items={subtopic.questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {subtopic.questions.map((q) => (
                  <SortableQuestionItem
                    key={q.id}
                    q={q}
                    topicId={topicId}
                    subtopicId={subtopic.id}
                    toggleQuestionStatus={toggleQuestionStatus}
                    toggleStar={toggleStar}
                    onEdit={() => onEditQuestion(q)}
                    onDelete={() => onDeleteQuestion(q)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </AccordionContent>
      </AccordionItem>
    </div>
  )
}


type SortableTopicItemProps = {
  topic: Topic
  progress: { text: string; percent: number }
  toggleQuestionStatus: (topicId: string, subTopicId: string, questionId: string) => void
  toggleStar: (topicId: string, subTopicId: string, questionId: string) => void
  calculateSubtopicProgress: (subtopic: SubTopic) => { text: string; percent: number }
  onAddSubtopic: () => void
  onAddQuestion: () => void
  onRenameTopic: () => void
  onDeleteTopic: () => void
  onRenameSubtopic: (subtopic: SubTopic) => void
  onDeleteSubtopic: (subtopic: SubTopic) => void
  onEditQuestion: (subtopicId: string, q: Question) => void
  onDeleteQuestion: (subtopicId: string, q: Question) => void
  subtopicSensors: ReturnType<typeof useSensors>
  questionSensors: ReturnType<typeof useSensors>
  onSubtopicDragEnd: (event: DragEndEvent) => void
  onQuestionDragEnd: (subtopicId: string, event: DragEndEvent) => void
}

function SortableTopicItem({
  topic,
  progress,
  toggleQuestionStatus,
  toggleStar,
  calculateSubtopicProgress,
  onAddSubtopic,
  onAddQuestion,
  onRenameTopic,
  onDeleteTopic,
  onRenameSubtopic,
  onDeleteSubtopic,
  onEditQuestion,
  onDeleteQuestion,
  subtopicSensors,
  questionSensors,
  onSubtopicDragEnd,
  onQuestionDragEnd,
}: SortableTopicItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} suppressHydrationWarning>
      <AccordionItem
        value={topic.id}
        className="border border-border bg-card rounded-[4px] overflow-hidden"
      >
        <div className="relative">

          <div className="absolute top-0 left-0 w-full h-[3px] bg-muted z-20 pointer-events-none">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card data-[state=open]:bg-card border-b border-transparent data-[state=open]:border-border transition-colors relative z-10 group">
            <div className="flex items-center justify-between w-full pr-4 min-w-0">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  suppressHydrationWarning
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                </div>
                <span className="font-medium text-foreground text-base truncate">
                  {topic.title}
                </span>
                <span className="text-muted-foreground text-sm font-mono flex-shrink-0">
                  {progress.text}
                </span>
              </div>
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div role="button" tabIndex={0} className="inline-flex items-center h-8 text-muted-foreground hover:text-foreground hover:bg-muted px-3 rounded-md text-sm font-medium cursor-pointer transition-colors">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onAddSubtopic}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-topic
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAddQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>


                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div role="button" tabIndex={0} className="inline-flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onRenameTopic}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={onDeleteTopic}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </AccordionTrigger>
        </div>

        <AccordionContent className="p-4 bg-background">
          {topic.subtopics.length > 0 ? (
            <DndContext
              sensors={subtopicSensors}
              collisionDetection={closestCenter}
              onDragEnd={onSubtopicDragEnd}
            >
              <SortableContext
                items={topic.subtopics.map((st) => st.id)}
                strategy={verticalListSortingStrategy}
              >
                <Accordion type="multiple" className="w-full space-y-3">
                  {topic.subtopics.map((subtopic) => {
                    const subProgress = calculateSubtopicProgress(subtopic)
                    return (
                      <SortableSubtopicItem
                        key={subtopic.id}
                        subtopic={subtopic}
                        topicId={topic.id}
                        subProgress={subProgress}
                        toggleQuestionStatus={toggleQuestionStatus}
                        toggleStar={toggleStar}
                        onRenameSubtopic={() => onRenameSubtopic(subtopic)}
                        onDeleteSubtopic={() => onDeleteSubtopic(subtopic)}
                        onEditQuestion={(q) => onEditQuestion(subtopic.id, q)}
                        onDeleteQuestion={(q) => onDeleteQuestion(subtopic.id, q)}
                        questionSensors={questionSensors}
                        onQuestionDragEnd={(event) =>
                          onQuestionDragEnd(subtopic.id, event)
                        }
                      />
                    )
                  })}
                </Accordion>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No sub-topics yet. Click &quot;+ Add&quot; to create one.
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </div>
  )
}


export default function Home() {
  const initialTopics = useMemo(() => transformSheetData(sheetData), [])
  const [topics, setTopicsState] = useState<Topic[]>(initialTopics)
  const [mounted, setMounted] = useState(false)


  useEffect(() => {
    const saved = loadTopics<Topic[]>()
    if (saved) {
      setTopicsState(saved)
    }
    setMounted(true)
  }, [])


  const setTopics = useCallback(
    (updater: Topic[] | ((prev: Topic[]) => Topic[])) => {
      setTopicsState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        saveTopics(next)
        return next
      })
    },
    []
  )



  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [topicDialogMode, setTopicDialogMode] = useState<"add" | "rename">("add")
  const [topicDialogDefault, setTopicDialogDefault] = useState("")
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)


  const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false)
  const [subtopicDialogMode, setSubtopicDialogMode] = useState<"add" | "rename">("add")
  const [subtopicDialogDefault, setSubtopicDialogDefault] = useState("")
  const [subtopicTargetTopicId, setSubtopicTargetTopicId] = useState<string | null>(null)
  const [editingSubtopicId, setEditingSubtopicId] = useState<string | null>(null)


  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [questionDialogMode, setQuestionDialogMode] = useState<"add" | "edit">("add")
  const [questionDialogDefault, setQuestionDialogDefault] = useState<Partial<QuestionFormData>>({})
  const [questionTargetTopicId, setQuestionTargetTopicId] = useState<string | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editingQuestionSubtopicId, setEditingQuestionSubtopicId] = useState<string | null>(null)


  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: string
    name: string
    action: () => void
  }>({ type: "", name: "", action: () => { } })


  const topicSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const subtopicSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const questionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )


  const handleTopicDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setTopics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSubtopicDragEnd = (topicId: string, event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setTopics((prev) =>
        prev.map((topic) => {
          if (topic.id !== topicId) return topic
          const oldIndex = topic.subtopics.findIndex((st) => st.id === active.id)
          const newIndex = topic.subtopics.findIndex((st) => st.id === over.id)
          return { ...topic, subtopics: arrayMove(topic.subtopics, oldIndex, newIndex) }
        })
      )
    }
  }

  const handleQuestionDragEnd = (
    topicId: string,
    subtopicId: string,
    event: DragEndEvent
  ) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setTopics((prev) =>
        prev.map((topic) => {
          if (topic.id !== topicId) return topic
          return {
            ...topic,
            subtopics: topic.subtopics.map((sub) => {
              if (sub.id !== subtopicId) return sub
              const oldIndex = sub.questions.findIndex((q) => q.id === active.id)
              const newIndex = sub.questions.findIndex((q) => q.id === over.id)
              return { ...sub, questions: arrayMove(sub.questions, oldIndex, newIndex) }
            }),
          }
        })
      )
    }
  }


  const toggleQuestionStatus = (topicId: string, subTopicId: string, questionId: string) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic
        return {
          ...topic,
          subtopics: topic.subtopics.map((sub) => {
            if (sub.id !== subTopicId) return sub
            return {
              ...sub,
              questions: sub.questions.map((q) => {
                if (q.id !== questionId) return q
                return {
                  ...q,
                  status: q.status === "completed" ? "pending" : "completed",
                } as Question
              }),
            }
          }),
        }
      })
    )
  }

  const toggleStar = (topicId: string, subTopicId: string, questionId: string) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic
        return {
          ...topic,
          subtopics: topic.subtopics.map((sub) => {
            if (sub.id !== subTopicId) return sub
            return {
              ...sub,
              questions: sub.questions.map((q) => {
                if (q.id !== questionId) return q
                return { ...q, starred: !q.starred } as Question
              }),
            }
          }),
        }
      })
    )
  }


  const openAddTopicDialog = () => {
    setTopicDialogMode("add")
    setTopicDialogDefault("")
    setEditingTopicId(null)
    setTopicDialogOpen(true)
  }

  const openRenameTopicDialog = (topic: Topic) => {
    setTopicDialogMode("rename")
    setTopicDialogDefault(topic.title)
    setEditingTopicId(topic.id)
    setTopicDialogOpen(true)
  }

  const handleTopicSubmit = (name: string) => {
    if (topicDialogMode === "add") {
      setTopics((prev) => [
        ...prev,
        { id: generateId("topic"), title: name, subtopics: [] },
      ])
    } else if (editingTopicId) {
      setTopics((prev) =>
        prev.map((t) => (t.id === editingTopicId ? { ...t, title: name } : t))
      )
    }
  }

  const confirmDeleteTopic = (topic: Topic) => {
    setDeleteTarget({
      type: "Topic",
      name: topic.title,
      action: () => {
        setTopics((prev) => prev.filter((t) => t.id !== topic.id))
      },
    })
    setDeleteDialogOpen(true)
  }


  const openAddSubtopicDialog = (topicId: string) => {
    setSubtopicDialogMode("add")
    setSubtopicDialogDefault("")
    setSubtopicTargetTopicId(topicId)
    setEditingSubtopicId(null)
    setSubtopicDialogOpen(true)
  }

  const openRenameSubtopicDialog = (topicId: string, subtopic: SubTopic) => {
    setSubtopicDialogMode("rename")
    setSubtopicDialogDefault(subtopic.title)
    setSubtopicTargetTopicId(topicId)
    setEditingSubtopicId(subtopic.id)
    setSubtopicDialogOpen(true)
  }

  const handleSubtopicSubmit = (name: string) => {
    if (!subtopicTargetTopicId) return
    if (subtopicDialogMode === "add") {
      setTopics((prev) =>
        prev.map((t) => {
          if (t.id !== subtopicTargetTopicId) return t
          return {
            ...t,
            subtopics: [
              ...t.subtopics,
              { id: generateId("subtopic"), title: name, questions: [] },
            ],
          }
        })
      )
    } else if (editingSubtopicId) {
      setTopics((prev) =>
        prev.map((t) => {
          if (t.id !== subtopicTargetTopicId) return t
          return {
            ...t,
            subtopics: t.subtopics.map((st) =>
              st.id === editingSubtopicId ? { ...st, title: name } : st
            ),
          }
        })
      )
    }
  }

  const confirmDeleteSubtopic = (topicId: string, subtopic: SubTopic) => {
    setDeleteTarget({
      type: "Sub-topic",
      name: subtopic.title,
      action: () => {
        setTopics((prev) =>
          prev.map((t) => {
            if (t.id !== topicId) return t
            return {
              ...t,
              subtopics: t.subtopics.filter((st) => st.id !== subtopic.id),
            }
          })
        )
      },
    })
    setDeleteDialogOpen(true)
  }


  const openAddQuestionDialog = (topicId: string) => {
    setQuestionDialogMode("add")
    setQuestionDialogDefault({})
    setQuestionTargetTopicId(topicId)
    setEditingQuestionId(null)
    setEditingQuestionSubtopicId(null)
    setQuestionDialogOpen(true)
  }

  const openEditQuestionDialog = (topicId: string, subtopicId: string, q: Question) => {
    setQuestionDialogMode("edit")
    setQuestionDialogDefault({
      title: q.title,
      difficulty: q.difficulty,
      platform: q.platform,
      link: q.link,
      resource: q.resource || "",
      subTopicId: subtopicId,
    })
    setQuestionTargetTopicId(topicId)
    setEditingQuestionId(q.id)
    setEditingQuestionSubtopicId(subtopicId)
    setQuestionDialogOpen(true)
  }

  const handleQuestionSubmit = (data: QuestionFormData) => {
    if (!questionTargetTopicId) return

    if (questionDialogMode === "add") {
      const newQuestion: Question = {
        id: generateId("question"),
        title: data.title,
        status: "pending",
        difficulty: data.difficulty,
        platform: data.platform,
        link: data.link,
        resource: data.resource || undefined,
        topics: [],
        starred: false,
      }
      setTopics((prev) =>
        prev.map((t) => {
          if (t.id !== questionTargetTopicId) return t
          return {
            ...t,
            subtopics: t.subtopics.map((st) => {
              if (st.id !== data.subTopicId) return st
              return { ...st, questions: [...st.questions, newQuestion] }
            }),
          }
        })
      )
    } else if (editingQuestionId && editingQuestionSubtopicId) {
      setTopics((prev) =>
        prev.map((t) => {
          if (t.id !== questionTargetTopicId) return t


          if (editingQuestionSubtopicId !== data.subTopicId) {
            let movedQuestion: Question | null = null
            const withRemoved = t.subtopics.map((st) => {
              if (st.id !== editingQuestionSubtopicId) return st
              movedQuestion =
                st.questions.find((q) => q.id === editingQuestionId) || null
              return {
                ...st,
                questions: st.questions.filter((q) => q.id !== editingQuestionId),
              }
            })
            if (movedQuestion) {
              const mq = movedQuestion as Question
              const updated: Question = {
                ...mq,
                title: data.title,
                difficulty: data.difficulty,
                platform: data.platform,
                link: data.link,
                resource: data.resource || undefined,
              }
              return {
                ...t,
                subtopics: withRemoved.map((st) => {
                  if (st.id !== data.subTopicId) return st
                  return { ...st, questions: [...st.questions, updated] }
                }),
              }
            }
          }


          return {
            ...t,
            subtopics: t.subtopics.map((st) => {
              if (st.id !== editingQuestionSubtopicId) return st
              return {
                ...st,
                questions: st.questions.map((q) => {
                  if (q.id !== editingQuestionId) return q
                  return {
                    ...q,
                    title: data.title,
                    difficulty: data.difficulty,
                    platform: data.platform,
                    link: data.link,
                    resource: data.resource || undefined,
                  }
                }),
              }
            }),
          }
        })
      )
    }
  }

  const confirmDeleteQuestion = (
    topicId: string,
    subtopicId: string,
    q: Question
  ) => {
    setDeleteTarget({
      type: "Question",
      name: q.title,
      action: () => {
        setTopics((prev) =>
          prev.map((t) => {
            if (t.id !== topicId) return t
            return {
              ...t,
              subtopics: t.subtopics.map((st) => {
                if (st.id !== subtopicId) return st
                return {
                  ...st,
                  questions: st.questions.filter((qq) => qq.id !== q.id),
                }
              }),
            }
          })
        )
      },
    })
    setDeleteDialogOpen(true)
  }


  const calculateTopicProgress = (topic: Topic) => {
    let completed = 0
    let total = 0
    topic.subtopics.forEach((sub) => {
      sub.questions.forEach((q) => {
        total++
        if (q.status === "completed") completed++
      })
    })
    const percent = total > 0 ? (completed / total) * 100 : 0
    return { text: `${completed} / ${total}`, percent }
  }

  const calculateSubtopicProgress = (subtopic: SubTopic) => {
    let completed = 0
    const total = subtopic.questions.length
    subtopic.questions.forEach((q) => {
      if (q.status === "completed") completed++
    })
    const percent = total > 0 ? (completed / total) * 100 : 0
    return { text: `${completed} / ${total}`, percent }
  }


  const questionDialogSubtopics = useMemo(() => {
    if (!questionTargetTopicId) return []
    const topic = topics.find((t) => t.id === questionTargetTopicId)
    return topic?.subtopics.map((st) => ({ id: st.id, title: st.title })) || []
  }, [questionTargetTopicId, topics])


  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">{sheetData.data.sheet.name}</h1>
            <p className="text-muted-foreground text-sm max-w-3xl">
              {sheetData.data.sheet.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openAddTopicDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        <DndContext
          sensors={topicSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTopicDragEnd}
        >
          <SortableContext
            items={topics.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Accordion type="multiple" className="w-full space-y-4">
              {topics.map((topic) => {
                const progress = calculateTopicProgress(topic)
                return (
                  <SortableTopicItem
                    key={topic.id}
                    topic={topic}
                    progress={progress}
                    toggleQuestionStatus={toggleQuestionStatus}
                    toggleStar={toggleStar}
                    calculateSubtopicProgress={calculateSubtopicProgress}
                    onAddSubtopic={() => openAddSubtopicDialog(topic.id)}
                    onAddQuestion={() => openAddQuestionDialog(topic.id)}
                    onRenameTopic={() => openRenameTopicDialog(topic)}
                    onDeleteTopic={() => confirmDeleteTopic(topic)}
                    onRenameSubtopic={(st) => openRenameSubtopicDialog(topic.id, st)}
                    onDeleteSubtopic={(st) => confirmDeleteSubtopic(topic.id, st)}
                    onEditQuestion={(subtopicId, q) =>
                      openEditQuestionDialog(topic.id, subtopicId, q)
                    }
                    onDeleteQuestion={(subtopicId, q) =>
                      confirmDeleteQuestion(topic.id, subtopicId, q)
                    }
                    subtopicSensors={subtopicSensors}
                    questionSensors={questionSensors}
                    onSubtopicDragEnd={(e) => handleSubtopicDragEnd(topic.id, e)}
                    onQuestionDragEnd={(subtopicId, e) =>
                      handleQuestionDragEnd(topic.id, subtopicId, e)
                    }
                  />
                )
              })}
            </Accordion>
          </SortableContext>
        </DndContext>

        {topics.length === 0 && (
          <div className="text-center text-muted-foreground py-16 border border-dashed border-border rounded-lg">
            <p className="text-lg mb-2">No topics yet</p>
            <p className="text-sm">Click the &quot;+ Add&quot; button above to create your first topic.</p>
          </div>
        )}
      </div>


      <TopicDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        onSubmit={handleTopicSubmit}
        defaultName={topicDialogDefault}
        mode={topicDialogMode}
      />

      <SubtopicDialog
        open={subtopicDialogOpen}
        onOpenChange={setSubtopicDialogOpen}
        onSubmit={handleSubtopicSubmit}
        defaultName={subtopicDialogDefault}
        mode={subtopicDialogMode}
      />

      <QuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        onSubmit={handleQuestionSubmit}
        defaultData={questionDialogDefault}
        mode={questionDialogMode}
        subtopics={questionDialogSubtopics}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={deleteTarget.action}
        itemName={deleteTarget.name}
        itemType={deleteTarget.type}
      />
    </div>
  )
}
