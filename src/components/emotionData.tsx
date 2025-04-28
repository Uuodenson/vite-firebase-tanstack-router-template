import { openDB } from "idb";
import { loadEmotions, saveEmotion, decryptData } from "@/crypto-js";
import { EmotionData } from "@/routes/emotions.lazy";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { useMediaQuery } from "@uidotdev/usehooks";
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { DialogHeader } from "./ui/dialog";
import { useState, useEffect } from "react";

type TimeRange = 'day' | 'week' | 'month' | 'year';

function EmotionChart() {
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

  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [emotion, setEmotion] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [selectedEmotionData, setSelectedEmotionData] = useState<EmotionData | null>(null);
  const [strength, setStrength] = useState<number>(1);
  const [savedData, setSavedData] = useState<EmotionData[]>([]);
  const [deleteItem, setDeleteItem] = useState<EmotionData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('day');

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadEmotions();
      setSavedData(data);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (emotion && reason) {
      const currentDate = new Date().toLocaleDateString();
      
      // Prüfe auf doppelte Einträge am selben Tag
      const existingEntry = savedData.find(
        entry => entry.date === currentDate && 
                entry.emotion === emotion && 
                entry.reason === reason
      );
      
      if (existingEntry) {
        return; // Verhindere doppelte Einträge
      }

      const newData: EmotionData = {
        emotion,
        reason,
        date: currentDate,
        strength,
      };

      // Begrenze die Anzahl der gespeicherten Datenpunkte auf 30 Tage
      let updatedData = [...savedData, newData];
      if (updatedData.length > 30) {
        updatedData = updatedData.slice(-30); // Behalte nur die letzten 30 Einträge
      }

      await saveEmotion(newData);
      setSavedData(updatedData);
      setEmotion("");
      setStrength(1);
      setReason("");
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

  const filterDataByTimeRange = (data: EmotionData[]) => {
    const now = new Date();
    return data.filter(item => {
      const itemDate = new Date(item.date);
      switch (timeRange) {
        case 'day':
          return itemDate.toDateString() === now.toDateString();
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return itemDate >= weekStart;
        case 'month':
          return itemDate.getMonth() === now.getMonth() && 
                 itemDate.getFullYear() === now.getFullYear();
        case 'year':
          return itemDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const chartData = filterDataByTimeRange(savedData).map((item) => ({
    date: item.date,
    score: getEmotionScore(item.emotion),
    emotion: item.emotion,
    reason: item.reason || "",
    strength: item.strength,
  }));

  const groupedData = chartData.reduce((acc: any, curr) => {
    acc[curr.date] = (acc[curr.date] || 0) + curr.score;
    return acc;
  }, {});

  const chartDataForGraph = Object.entries(groupedData).map(([date, score]) => ({
    date,
    score,
  }));

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      const clickedData = chartData.find(
        (item) => item.date === data.activePayload[0].payload.date
      );
      setSelectedEmotionData(clickedData ?? null);
    }
  };

  const renderStars = (count: number) => {
    const validCount = Math.max(0, Math.min(count, 5));
    const stars = [];
    for (let i = 0; i < validCount; i++) {
      stars.push(
        <span className="" key={i}>
          ★
        </span>
      );
    }
    for (let i = validCount; i < 5; i++) {
      stars.push(<span key={i}>☆</span>);
    }
    return stars;
  };

  const clearAllEntries = async () => {
    const db = await openDB("my-database", 1);
    const tx = db.transaction("emotions", "readwrite");
    await tx.store.clear();
    await tx.done;
    setSavedData([]);
    localStorage.removeItem("emotionData");
  };

  const handleDelete = async (item: EmotionData) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (deleteItem) {
      try {
        const result = await deleteEmotion(deleteItem);
        if (result) {
          setSavedData(prevData => 
            prevData.filter(data => 
              !(data.date === deleteItem.date && 
                data.emotion === deleteItem.emotion && 
                data.reason === deleteItem.reason)
            )
          );
          setDeleteItem(null);
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Eintrags:', error);
      }
    }
  };

  return (
    <div className="p-4 grid gap-4">
      <Dialog
        open={selectedEmotionData !== null}
        onOpenChange={() => setSelectedEmotionData(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEmotionData?.emotion}</DialogTitle>
            <DialogDescription className="grid gap-2">
              <p>Reason: {selectedEmotionData?.reason}</p>
              <br />
              Strength:{" "}
              <div className="flex gap-2">
                {renderStars(selectedEmotionData?.strength || 0)}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Emotion Chart</CardTitle>
          <div className="flex gap-2 mb-4">
            <Button
              variant={timeRange === 'day' ? 'default' : 'outline'}
              onClick={() => setTimeRange('day')}
            >
              Tag
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              onClick={() => setTimeRange('week')}
            >
              Woche
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              onClick={() => setTimeRange('month')}
            >
              Monat
            </Button>
            <Button
              variant={timeRange === 'year' ? 'default' : 'outline'}
              onClick={() => setTimeRange('year')}
            >
              Jahr
            </Button>
          </div>
          <Button
            onClick={async () => {
              const csvHeaders = "Date,Score,Emotion,Reason,Strength\n";
              const csvRows = chartData.map(
                (e) =>
                  `${e.date},${e.score},"${e.emotion}","${e.reason}",${e.strength}`
              );
              const csvContent = `data:text/csv;charset=utf-8,${csvHeaders}${csvRows.join("\n")}`;

              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "emotions.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Export Data
          </Button>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={isSmallScreen ? 200 : 300}
            >
              <LineChart
                data={chartData}
                onClick={(data) =>
                  handleBarClick(data.activePayload?.[0]?.payload)
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background/95 p-2 rounded-lg border shadow-lg">
                          <p className="font-semibold">{data.date}</p>
                          <p>Score: {data.score}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 6, fill: "#8884d8" }}
                  activeDot={{ r: 8, fill: "#8884d8", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center">No emotions saved yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EmotionChart;
