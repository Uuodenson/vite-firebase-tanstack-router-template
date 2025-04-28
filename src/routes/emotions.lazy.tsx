import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { openDB } from "idb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@uidotdev/usehooks";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Moon, Trash2 } from "lucide-react";
import { saveEmotion, loadEmotions, decryptData, deleteEmotion } from "@/crypto-js";
import { db, firebase_app } from "@/helpers/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import EmotionChart from "@/components/emotionData";

export const Route = createLazyFileRoute("/emotions")({
  component: EmotionsTab,
});

// Rest of the interfaces and ShareDataDialog component remain the same...

function EmotionsTab() {
  const [savedData, setSavedData] = useState<any[]>([]);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    const loadSavedEmotions = async () => {
      const emotions = await loadEmotions();
      setSavedData(emotions);
    };
    loadSavedEmotions();
  }, []);
  const clearAllEntries = async () => {
    try {
      const db = await openDB("my-database", 1);
      const tx = db.transaction("emotions", "readwrite");
      await tx.store.clear();
      await tx.done;
      setSavedData([]);
      localStorage.removeItem("emotionData");
    } catch (error) {
      console.error("Error clearing entries:", error);
    }
  };

  const handleDelete = (item: { date: string; emotion: string; reason: string }) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (deleteItem) {
      try {
        await deleteEmotion(deleteItem);
        setSavedData(prevData => 
          prevData.filter(data => 
            !(data.date === deleteItem.date && 
              data.emotion === deleteItem.emotion && 
              data.reason === deleteItem.reason)
          )
        );
        setDeleteItem(null);
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Track Your Emotions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 animate-slideUp">
                <Select onValueChange={setSelectedEmotion} value={selectedEmotion}>
                  <SelectTrigger>
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="angry">Angry</SelectItem>
                    <SelectItem value="anxious">Anxious</SelectItem>
                    <SelectItem value="frustrated">Frustrated</SelectItem>
                    <SelectItem value="overwhelmed">Overwhelmed</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea 
                  placeholder="What made you feel this way?"
                  className="min-h-[100px] resize-none"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <Button 
                  className="w-full" 
                  onClick={async () => {
                    if (!selectedEmotion || !reason) return;
                    const newEmotion = {
                      emotion: selectedEmotion,
                      reason: reason,
                      date: new Date().toLocaleString(),
                      strength: 3
                    };
                    await saveEmotion(newEmotion);
                    setSavedData([...savedData, newEmotion]);
                    setSelectedEmotion("");
                    setReason("");
                  }}
                  disabled={!selectedEmotion || !reason}
                >
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Your Emotion History</CardTitle>
            </CardHeader>
            <CardContent>
              <EmotionChart />
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slideUp">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Clear All Entries</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your emotion entries.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex justify-end gap-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllEntries}>Delete All</AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Emotion</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  savedData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.emotion}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this emotion entry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex justify-end gap-2">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item)}>Delete</AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EmotionsTab;
