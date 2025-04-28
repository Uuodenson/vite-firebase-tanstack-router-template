import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { usePapaParse } from "react-papaparse"; // For parsing CSV files
import { Chart } from "react-chartjs-2"; // For rendering the emotion chart
import "chart.js/auto"; // Automatically register Chart.js components
import { Button } from "@/components/ui/button";
import { decryptData } from "@/crypto-js";
import { Label } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { openDB } from "idb";

interface UsedShareKey {
  key: string;
  used: boolean;
  usedAt?: Date;
}

export const Route = createFileRoute("/therapeut/client_data")({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: ClientData,
});



interface AccessFormProps {
  onAccess: (key: string) => void;
}

function AccessForm({ onAccess }: AccessFormProps) {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAccess(key);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-md mx-auto p-4">
      <div className="grid gap-2">
        <input
          id="key"
          type="text"
          className="w-full p-2 border rounded-md"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter share key"
          required
        />
      </div>
      <Button type="submit">Access Data</Button>
    </form>
  );
}

export default function ClientData() {
  const [clientData, setClientData] = useState<any[]>([]);
  const [emotionCounts, setEmotionCounts] = useState<Record<string, number>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFirstTimeDialog, setShowFirstTimeDialog] = useState(false);
  const { readString } = usePapaParse();

  const verifyAccess = async (key: string) => {
    try {
        const db = await openDB('my-database', 0, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('usedShareKeys')) {
              db.createObjectStore('usedShareKeys', { keyPath: 'key' });
            }
          }
        });

        // Check if key has been used before
        const usedKeysTx = db.transaction('usedShareKeys', 'readwrite');
        const usedKeysStore = usedKeysTx.objectStore('usedShareKeys');
        const keyUsage = await usedKeysStore.get(key);

        if (keyUsage?.used) {
          setIsAuthenticated(true);
        } else {
          // Mark key as used
          await usedKeysStore.put({
            key,
            used: true,
            usedAt: new Date()
          });
          setShowFirstTimeDialog(true);
        }

        // Load shared data from IndexedDB
        const tx = db.transaction('emotions', 'readonly');
        const store = tx.objectStore('emotions');
        const allEntries = await store.getAll();

        // Filter entries with matching share key
        const sharedData = allEntries
          .map(entry => decryptData(entry.data))
          .filter(data => data.shareKey === key);

        if (sharedData.length === 0) {
          alert('No data found for this share key');
          return;
        }

        setClientData(sharedData);

        // Process emotions
        const emotionMap: Record<string, number> = {};
        sharedData.forEach((data: any) => {
          const emotion = data.emotion;
          if (emotion) {
            emotionMap[emotion] = (emotionMap[emotion] || 0) + 1;
          }
        });
        setEmotionCounts(emotionMap);
    } catch (error) {
      console.error('Error verifying access:', error);
      alert('Failed to verify access. Please try again.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const csvData = reader.result as string;
        readString(csvData, {
          header: true,
          complete: (results) => {
            console.log("Parsed CSV Data:", results.data); // Debug log
            const data = results.data.filter((row: any) => row && Object.keys(row).length > 0); // Filter out empty rows
            setClientData(data);

            // Process emotions
            const emotionMap: Record<string, number> = {};
            data.forEach((row: any) => {
              const emotion = row?.Emotion?.trim(); // Ensure column name matches case-sensitive CSV header
              if (emotion) {
                emotionMap[emotion] = (emotionMap[emotion] || 0) + 1;
              }
            });
            alert(`Emotions found: ${Object.keys(emotionMap).join(", ")}`); // Alert the user about the emotions found
            setEmotionCounts(emotionMap);
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const emotionData = {
    labels: Object.keys(emotionCounts),
    datasets: [
      {
        label: "Emotion Count",
        data: Object.values(emotionCounts),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#FF9F40",
          "#4BC0C0",
          "#9966FF",
          "#FF6384",
          "#C9CBCF",
          "#FFCD56",
        ],
      },
    ],
  };

  return (
    <>
      <Dialog open={showFirstTimeDialog} onOpenChange={setShowFirstTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>First Time Access</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>This is your first time accessing this shared data. The share key has been marked as used.</p>
            <p>You can continue to access this data in the future using the same credentials.</p>
            <Button className="mt-4" onClick={() => {
              setShowFirstTimeDialog(false);
              setIsAuthenticated(true);
            }}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="p-4">
        {!isAuthenticated ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">Access Client Data</h1>
            <AccessForm onAccess={verifyAccess} />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Client Data</h1>
            <div className="overflow-auto max-h-64 border p-2">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    {clientData.length > 0 &&
                      Object.keys(clientData[0]).map((key) => (
                        <th key={key} className="border border-gray-300 px-2 py-1">
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {clientData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, i) => (
                        <td
                          key={i}
                          className="border border-gray-300 px-2 py-1 text-center"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Emotion Chart</h2>
              <Chart
                type="bar"
                data={emotionData}
                options={{
                  plugins: {
                    legend: {
                      display: true,
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Emotion Types",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Count",
                      },
                    },
                  },
                }}
              />
            </div>
          </>)
        }
      </div>
    </>
  );
}