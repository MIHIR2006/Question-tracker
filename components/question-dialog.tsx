"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface QuestionFormData {
    title: string
    difficulty: "Easy" | "Medium" | "Hard" | "Basic"
    platform: string
    link: string
    resource: string
    subTopicId: string
}

interface QuestionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: QuestionFormData) => void
    defaultData?: Partial<QuestionFormData>
    mode: "add" | "edit"
    subtopics: { id: string; title: string }[]
}

const EMPTY_FORM: QuestionFormData = {
    title: "",
    difficulty: "Easy",
    platform: "LeetCode",
    link: "",
    resource: "",
    subTopicId: "",
}

export function QuestionDialog({
    open,
    onOpenChange,
    onSubmit,
    defaultData,
    mode,
    subtopics,
}: QuestionDialogProps) {
    const [form, setForm] = useState<QuestionFormData>(EMPTY_FORM)

    useEffect(() => {
        if (open) {
            setForm({
                ...EMPTY_FORM,
                ...defaultData,
                subTopicId: defaultData?.subTopicId || subtopics[0]?.id || "",
            })
        }
    }, [open, defaultData, subtopics])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (form.title.trim() && form.link.trim() && form.subTopicId) {
            onSubmit({ ...form, title: form.title.trim(), link: form.link.trim() })
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add" ? "Add New Question" : "Edit Question"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="q-title">Question Title</Label>
                            <Input
                                id="q-title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Two Sum"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Difficulty</Label>
                                <Select
                                    value={form.difficulty}
                                    onValueChange={(v) =>
                                        setForm({
                                            ...form,
                                            difficulty: v as QuestionFormData["difficulty"],
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                        <SelectItem value="Basic">Basic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Platform</Label>
                                <Select
                                    value={form.platform}
                                    onValueChange={(v) => setForm({ ...form, platform: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LeetCode">LeetCode</SelectItem>
                                        <SelectItem value="GeeksForGeeks">GeeksForGeeks</SelectItem>
                                        <SelectItem value="CodeStudio">CodeStudio</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="q-link">Problem Link</Label>
                            <Input
                                id="q-link"
                                value={form.link}
                                onChange={(e) => setForm({ ...form, link: e.target.value })}
                                placeholder="https://leetcode.com/problems/..."
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="q-resource">
                                Resource Link{" "}
                                <span className="text-muted-foreground text-xs">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="q-resource"
                                value={form.resource}
                                onChange={(e) => setForm({ ...form, resource: e.target.value })}
                                placeholder="https://youtube.com/..."
                            />
                        </div>

                        {subtopics.length > 0 && (
                            <div className="grid gap-2">
                                <Label>Sub-topic</Label>
                                <Select
                                    value={form.subTopicId}
                                    onValueChange={(v) => setForm({ ...form, subTopicId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sub-topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subtopics.map((st) => (
                                            <SelectItem key={st.id} value={st.id}>
                                                {st.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!form.title.trim() || !form.link.trim() || !form.subTopicId}
                        >
                            {mode === "add" ? "Add Question" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
