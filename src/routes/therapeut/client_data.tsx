import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { usePapaParse } from "react-papaparse"; // For parsing CSV files
import { Chart } from "react-chartjs-2"; // For rendering the emotion chart
import "chart.js/auto"; // Automatically register Chart.js components

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



export default function ClientData() {
  const [clientData, setClientData] = useState<any[]>([]);
  const [emotionCounts, setEmotionCounts] = useState<Record<string, number>>({});
  const { readString } = usePapaParse();

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
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Client Data</h1>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-4"
        />
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
      </div>
    </>
  );
}