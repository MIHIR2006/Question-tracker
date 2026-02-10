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

interface SubtopicDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (name: string) => void
    defaultName?: string
    mode: "add" | "rename"
}

export function SubtopicDialog({
    open,
    onOpenChange,
    onSubmit,
    defaultName = "",
    mode,
}: SubtopicDialogProps) {
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
                        {mode === "add" ? "Add New Sub-topic" : "Rename Sub-topic"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="subtopic-name">Sub-topic Name</Label>
                            <Input
                                id="subtopic-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter sub-topic name..."
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
                            {mode === "add" ? "Add Sub-topic" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
