import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

export const Route = createLazyFileRoute("/journal")({
  component: Journal,
});

interface Note {
  id: string;
  title: string;
  content: string;
}

function Journal() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState<string>("");
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleAddNote = () => {
    if (newNoteTitle.trim() === "" || newNoteContent.trim() === "") return;
    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
    };
    setNotes([...notes, newNote]);
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    setSelectedNote(null);
  };
  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setIsEditing(true);
  };

  const handleUpdateNote = () => {
    if (!selectedNote) return;
    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id
        ? { ...note, title: newNoteTitle, content: newNoteContent }
        : note
    );
    setNotes(updatedNotes);
    setNewNoteTitle("");
    setNewNoteContent("");
    setSelectedNote(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNewNoteTitle("");
    setNewNoteContent("");
    setSelectedNote(null);
    setIsEditing(false);
  };

  // const handleNoteClick = (note: Note) => {
  //   setSelectedNote(note);
  // };

  const handleCloseNote = () => {
    setSelectedNote(null);
  };

  const renderNoteContent = (note: Note) => {
    if (selectedNote && selectedNote.id === note.id) {
      return (
        <div className="mt-2">
          <p className="font-bold">{note.title}</p>
          <p>{note.content}</p>
          <Button onClick={handleCloseNote} className="mt-2">
            Close
          </Button>
        </div>
      );
    } else {
      return <p>{note.title}</p>;
    }
  };

  return (
    <div className="p-4 grid gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Note</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            {isEditing ? (
              <DialogTitle>Edit Note</DialogTitle>
            ) : (
              <DialogTitle>Add a Note</DialogTitle>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
            />

            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
            />
          </div>
          {isEditing ? (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleUpdateNote}>
                Update Note
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={handleAddNote}>
              Add Note
            </Button>
          )}
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="transition-all hover:scale-105">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{note.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderNoteContent(note)}
              {!selectedNote && (
                <div className="w-1/2 flex flex-row justify-around items-center  mt-2">
                  <Button onClick={() => handleEditNote(note)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
