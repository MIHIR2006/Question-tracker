# Question Tracker

An interactive, single-page web application for managing a hierarchical set of coding questions organized by topics and sub-topics. Built as part of the Codolio SDE sheet management assignment.

## Features

- **Hierarchical Organization** -- Questions are grouped under topics and sub-topics with collapsible accordion sections.
- **Full CRUD Operations** -- Create, rename, and delete topics, sub-topics, and questions through intuitive dialogs.
- **Drag and Drop Reordering** -- Reorder topics, sub-topics, and questions by dragging them to the desired position using grip handles.
- **Progress Tracking** -- Visual progress bars on each topic and sub-topic showing completion status (e.g., 5/20).
- **Question Status** -- Mark questions as completed or pending with a single click.
- **Star / Bookmark** -- Star important questions for quick reference.
- **Platform Links** -- Direct links to the problem on LeetCode, GeeksForGeeks, or CodeStudio with platform logos.
- **Resource Links** -- Optional YouTube tutorial links displayed alongside questions.
- **Difficulty Indicators** -- Color-coded difficulty labels (Easy, Medium, Hard, Basic).
- **Dark / Light Mode** -- Theme toggle with system preference detection via `next-themes`.
- **Responsive Design** -- Fully responsive layout that works on mobile, tablet, and desktop.
- **Local Storage Persistence** -- All changes (edits, reordering, stars, progress) are saved to `localStorage` and restored on page load.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Accordion, Button, Dialog, Dropdown Menu, Input, Label, Select) |
| Drag and Drop | dnd-kit (core, sortable, utilities) |
| Icons | Lucide React |
| Theming | next-themes |
| Persistence | Browser localStorage |
| Data Source | Static JSON fetched from the Codolio public API |

## Project Structure

```
question-tracker/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main page with all CRUD, DnD, and rendering logic
│   └── globals.css         # Global styles and Tailwind config
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── topic-dialog.tsx    # Add / Rename topic dialog
│   ├── subtopic-dialog.tsx # Add / Rename sub-topic dialog
│   ├── question-dialog.tsx # Add / Edit question dialog
│   ├── delete-dialog.tsx   # Delete confirmation dialog
│   └── theme-provider.tsx  # Dark/light mode provider
├── lib/
│   ├── utils.ts            # Tailwind merge utility
│   └── storage.ts          # localStorage save/load/clear helpers
├── public/assets/          # Platform logos (LeetCode, GFG, CodeStudio, YouTube)
└── sheet.json              # Sample dataset from Codolio API
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or Bun

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/MIHIR2006/Question-tracker.git
cd Question-tracker
```

Using npm:

```bash
npm install
```

Using Bun:

```bash
bun install
```

### Running Locally

Start the development server:

Using npm:

```bash
npm run dev
```

Using Bun:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

Or with Bun:

```bash
bun run build
bun run start
```

## Usage

- Click the **Add** button in the header to create a new topic.
- Expand a topic and click its **Add** button to add a sub-topic or question.
- Use the three-dot menu on any topic, sub-topic, or question to rename, edit, or delete it.
- Drag the grip handle on the left of any item to reorder it within its group.
- Click the circle icon next to a question to toggle its completion status.
- Click the star icon to bookmark a question.
- All changes are automatically saved to localStorage and persist across page reloads.
