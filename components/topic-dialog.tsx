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

interface TopicDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (name: string) => void
    defaultName?: string
    mode: "add" | "rename"
}

export function TopicDialog({
    open,
    onOpenChange,
    onSubmit,
    defaultName = "",
    mode,
}: TopicDialogProps) {
    const [name, setName] = useState(defaultName)

    useEffect(() => {
        if (open) {
            setName(defaultName)
        }
    }, [open, defaultName])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSubmit(name.trim())
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add" ? "Add New Topic" : "Rename Topic"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="topic-name">Topic Name</Label>
                            <Input
                                id="topic-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter topic name..."
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim()}>
                            {mode === "add" ? "Add Topic" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
