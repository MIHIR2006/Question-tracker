const STORAGE_KEY = "question-tracker-state";

export function saveTopics<T>(topics: T): void {
    try {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
        }
    } catch (e) {
        console.error("Failed to save to localStorage:", e);
    }
}

export function loadTopics<T>(): T | null {
    try {
        if (typeof window !== "undefined") {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data) as T;
            }
        }
    } catch (e) {
        console.error("Failed to load from localStorage:", e);
    }
    return null;
}

export function clearTopics(): void {
    try {
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch (e) {
        console.error("Failed to clear localStorage:", e);
    }
}
