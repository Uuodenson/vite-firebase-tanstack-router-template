import { createLazyFileRoute, redirect, Link } from "@tanstack/react-router";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SafetySetting } from "@google/generative-ai";
import { useState, useEffect, useRef, Fragment } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast as tos } from "sonner"
import { Moon } from "lucide-react";
import { saveChatMessage, loadChatMessages, saveEmotion } from "@/crypto-js";
import { useAuthContext } from "@/helpers/authContext";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";

export const Route = createLazyFileRoute("/chat")({
    component: ChatPage,
});
interface DataData {
    date: string;
    content: string;
    title: string;
    emotion: string;
    reason?: string;
    strength: number;
}
type ResponseType = "question" | "emotion" | "journal" | "emergency";
interface ResponseChat {
    type: ResponseType[],
    content: string;
    data: { Emotion: DataData, Journal: DataData }
}

interface Message {
    role: "user" | "assistant";
    content: string;
    resp?: ResponseChat;
}
interface EmotionData {
    emotion: string;
    reason?: string;
    date: string;
    strength: number;
}

function ChatPage() {
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const { user } = useAuthContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isEmergency, setIsEmergency] = useState(false);
    const [isEmotion, setIsEmotion] = useState(false);
    const [emotion, setEmotion] = useState<string>('');
    const [reason, setReason] = useState<string>('');

    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const Safety: SafetySetting = {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings: [Safety] },);



    useEffect(() => {
        const loadMessages = async () => {
            if (user) {
                const loadedMessages = await loadChatMessages();
                setMessages(loadedMessages);
            }
        };
        if (user) loadMessages();
    }, []);

    useEffect(() => {
        localStorage.setItem("chatMessages", JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth",
        });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    };

    const handleSendMessage = async () => {
        setIsEmergency(false)
        if (input.trim() === "") return;

        const userMessage: Message = { role: "user", content: input };
        if (user) await saveChatMessage(userMessage);
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");
        setIsLoading(true);
        try {
            const assistantMessage: Message = { role: "assistant", content: "" };
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
            // const lowerCaseInput = input.toLowerCase();
            // if (lowerCaseInput.includes("kill myself") || lowerCaseInput.includes("suicide") || lowerCaseInput.includes("hurt myself")) {
            //     setIsEmergency(true);
            // }
            // const foundEmotion = emotions.find(e => lowerCaseInput.includes(e.name.toLowerCase()));
            // if (foundEmotion) {
            //     setIsEmotion(true);
            //     setEmotion(foundEmotion.name);
            //     setReason(input)
            // }
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

            const chat = model.startChat({
                history: messages.map((message) => {
                    return {
                        role: message.role,

                        parts: [{ text: message.content }]
                    };
                }),
            });
            const task = import.meta.env.VITE_TASK_EXPLAINED;
            const result = await chat.sendMessage(task + input);
            const response = result.response;
            let generatedText;
            try {
                generatedText = response.text()
                    .trim()
                    .replace(/^```(json)?\n?/g, '')
                    .replace(/\n?```$/g, '')
                    .replace(/^\s*\n+/g, '');
                console.log(generatedText)
                // Validate JSON before parsing
                const parsedResponse: ResponseChat = JSON.parse(generatedText);
                if (parsedResponse.type.includes("emergency")) {
                    setIsEmergency(true)
                }
                if (user) {
                    // Speichere die Chat-Nachricht
                    await saveChatMessage({
                        role: "assistant",
                        content: parsedResponse.content,
                        resp: parsedResponse
                    });

                    // Wenn es eine Emotion gibt, speichere sie
                    if (parsedResponse.type.includes("emotion") && parsedResponse.data) {
                        const emotionData: EmotionData = {
                            emotion: parsedResponse.data.Emotion.emotion,
                            reason: parsedResponse.data.Emotion.reason,
                            date: parsedResponse.data.Emotion.date || new Date().toLocaleDateString(),
                            strength: parsedResponse.data.Emotion.strength || 3
                        };
                        await saveEmotion(emotionData);
                        tos.success("Emotion wurde gespeichert");
                    }
                }

                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastIndex = updatedMessages.length - 1;
                    updatedMessages[lastIndex].content = parsedResponse.content;
                    updatedMessages[lastIndex].resp = parsedResponse;
                    return updatedMessages;
                });
            } catch (error) {
                // Handle invalid JSON response
                const errorMessage = "Invalid response format from AI";
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastIndex = updatedMessages.length - 1;
                    updatedMessages[lastIndex].content = errorMessage;
                    return updatedMessages;
                });
                tos.error("Error", {
                    description: "Invalid response format. Please try again.",
                    action: {
                        label: "Retry",
                        onClick: () => setInput(input)
                    }
                });
            }
        } catch (error) {
            tos.error("Error", {
                description: "Something went wrong. Please try again later.",
                action: {
                    label: "Go Back",
                    onClick: () => redirect({
                        to: "/chat"
                    })
                }

            });
        }
        if (isEmotion) {
            const newData: EmotionData = {
                emotion,
                reason,
                date: new Date().toLocaleDateString(),
                strength: 3,
            };
            await saveEmotion(newData);
            setIsEmotion(false)
            setEmotion("")
            setReason("")
        }
        if (isEmergency) {
            redirect({
                to: "/emergency"
            })
            tos.warning("Emergency detected", { description: "Please click on the button to get help." })
            setIsEmergency(false);
        } else {
            setIsLoading(false);
        }
    };
    const handleNewChat = () => {
        setMessages([]);
        localStorage.removeItem("chatMessages");
    };
    return (
        <div className="p-4 grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <Moon></Moon> Chat with Gemini
                    </CardTitle>
                </CardHeader>
                {isEmergency && (
                    <div className="p-2 w-screen h-screen bg-white z-30">
                        <Button asChild>
                            <Link to={"/emergency"}>Emergency</Link>
                        </Button>
                    </div>
                )}
                <CardContent className="grid gap-4">
                    <ScrollArea className={`h-50 overflow-y-auto ${isSmallScreen ? "w-full" : ""}`} ref={chatContainerRef}>
                        <div className="flex flex-col gap-2">
                            {messages.map((message, index) => (
                                <Fragment key={index}>
                                    <div
                                        className={`p-2 rounded-md ${message.role === "user"
                                            ? "bg-primary self-end"
                                            : "bg-secondary self-start"
                                            }`}
                                    >
                                        <p>{message.content}</p>
                                        <div>
                                            {(message.resp?.type.find((res) => { return res == "emotion" })) && (
                                                <Button onClick={() => {
                                                    const newData: EmotionData = {
                                                        emotion: message.resp?.data.Emotion.emotion || "Error",
                                                        reason: message.resp?.data.Emotion.reason,
                                                        date: message.resp?.data.Emotion.date || new Date().toLocaleDateString(),
                                                        strength: message.resp?.data.Emotion.strength || 3
                                                    };
                                                    saveEmotion(newData);
                                                    tos.success("Emotion wurde gespeichert");
                                                }}>Emotion speichern</Button>
                                            )}
                                            {(message.resp?.type.find((res) => { return res == "journal" })) && (
                                                <Button onClick={() => { }}>Save Journal</Button>
                                            )}
                                        </div>
                                    </div>
                                </Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="grid gap-2 ">
                        <Textarea
                            id="message"
                            placeholder="Type your message here..."
                            value={input}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-lg shadow-lg p-6">
                    <DialogHeader>
                        <DialogTitle>Alles was du hier reinschreibst wird nicht gespeichert</DialogTitle>
                        <DialogTrigger>
                            <Button variant={"outline"} >Close</Button>
                        </DialogTrigger>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <div className="flex gap-2">
                <Button variant={"outline"} onClick={handleSendMessage} disabled={isLoading}>
                    Send
                </Button>
                <Button onClick={handleNewChat} variant="outline">
                    New Chat
                </Button>
            </div>
        </div>
    );
}
