import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { openDB } from "idb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from "@uidotdev/usehooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Moon } from "lucide-react";
import { saveEmotion, loadEmotions } from "@/crypto-js";
export const Route = createLazyFileRoute("/emotions")({
  component: EmotionsTab,
});

interface EmotionData {
  emotion: string;
  reason?: string;
  date: string;
  strength: number;
}

function EmotionsTab() {
  const emotions = [
    { name: "Anxious", emoji: "😟" },
    { name: "Sad", emoji: "😢" },
    { name: "Happy", emoji: "😊" },
    { name: "Angry", emoji: "😡" },
    { name: "Frustrated", emoji: "😤" },
    { name: "Overwhelmed", emoji: "🤯" },
    { name: "Guilty", emoji: "😔" },
    { name: "Ashamed", emoji: "😳" },
    { name: "Other", emoji: "🤔" },
  ];

  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [emotion, setEmotion] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [selectedEmotionData, setSelectedEmotionData] = useState<EmotionData | null>(null);
  const [strength, setStrength] = useState<number>(1);
  const [savedData, setSavedData] = useState<EmotionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadEmotions();
      setSavedData(data);
    };
    fetchData();
  }, []);
  const handleSave = async () => {
    if (emotion && reason) {
      const newData: EmotionData = {
        emotion,
        reason,
        date: new Date().toLocaleDateString(),
        strength,
      };
      const updatedData = [...savedData, newData];
      await saveEmotion(newData);
      setSavedData(updatedData);
      setEmotion("")
      setStrength(1)
      setReason("")
    }
  };

  const getEmotionScore = (emotion: string) => {
    switch (emotion) {
      case "Happy":
        return 2;
      case "Anxious":
      case "Sad":
      case "Angry":
      case "Frustrated":
      case "Overwhelmed":
      case "Guilty":
      case "Ashamed":
        return -1;
      default:
        return 0;
    }
  };

  const chartData = savedData.map((item) => ({
    date: item.date,
    score: getEmotionScore(item.emotion),
    emotion: item.emotion,
    reason: item.reason,
    strength: item.strength,
  }));

  const groupedData = chartData.reduce((acc: any, curr) => {
    acc[curr.date] = (acc[curr.date] || 0) + curr.score;
    return acc;
  }, {});

  const chartDataForGraph = Object.entries(groupedData).map(([date, score]) => ({
    date, score
  }));

  const handleBarClick = (data: any) => {
    const clickedData = chartData.find((item) => item.date === data.date);
    setSelectedEmotionData(clickedData || null);
  };

  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(<span key={i}>★</span>);
    }
    for (let i = count; i < 5; i++) {
      stars.push(<span key={i}>☆</span>);
    }
    return stars;
  };
  const clearAllEntries = async () => {
    const db = await openDB('my-database', 1);
    const tx = db.transaction('emotions', 'readwrite');
    await tx.store.clear();
    await tx.done;
    setSavedData([]);
    localStorage.removeItem('emotionData');
  };

  return (
    <div className="p-4 grid gap-4">
      <Dialog
        open={selectedEmotionData !== null}
        onOpenChange={() => setSelectedEmotionData(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmotionData?.emotion}
            </DialogTitle>
            <DialogDescription>
              Reason: {selectedEmotionData?.reason}
              <br />Strength: {renderStars(selectedEmotionData?.strength || 0)}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 ">
            <Label htmlFor="emotion" className="flex gap-2 items-center">
              <Moon></Moon> Choose your Emotion
            </Label>
            <Select
              onValueChange={setEmotion}
              defaultValue={emotion}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an emotion" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {emotions.map((emotionData) => (
                  <SelectItem
                    key={emotionData.name} value={emotionData.name}>
                    {emotionData.emoji} {emotionData.name}
                  </SelectItem>
                ))}
              </SelectContent>

            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">
              Reason (OCD related thoughts or triggers)
            </Label>
            <Textarea
              className="resize-none"
              placeholder="e.g., I'm feeling anxious because of..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="strength">
              Strength (1-5)
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`p-2 rounded-md ${strength >= num ? "bg-yellow-400" : "bg-gray-300"
                    }`}
                  onClick={() => setStrength(num)}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              How strong is this emotion?
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={clearAllEntries} variant="destructive">
              Clear All Entries
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Saved Emotions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emotion</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Strength</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedData.length > 0 ? (
                savedData.map((data, index) => (



                  <TableRow key={index} className={isSmallScreen ? "text-sm" : ""}>
                    <TableCell>{data.emotion}</TableCell>
                    <TableCell>{data.reason}</TableCell>
                    <TableCell>{data.date}</TableCell>
                    <TableCell>{renderStars(data.strength)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No emotions saved yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Emotion Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {chartData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height={isSmallScreen ? 200 : 300}
                >
                  <BarChart
                    data={chartDataForGraph}
                    onClick={(data) =>
                      handleBarClick(data.activePayload?.[0]?.payload)
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <TableRow>

                  <TableCell colSpan={2} className="text-center">
                    No emotions saved yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
