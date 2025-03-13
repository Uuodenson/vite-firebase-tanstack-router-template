import { createLazyFileRoute, redirect, Link } from "@tanstack/react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

export const Route = createLazyFileRoute("/chat")({
    component: ChatPage,
});

interface Message {
    role: "user" | "assistant";
    content: string;
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
    console.log(geminiApiKey)
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



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
            const lowerCaseInput = input.toLowerCase();
            if (lowerCaseInput.includes("kill myself") || lowerCaseInput.includes("suicide") || lowerCaseInput.includes("hurt myself")) {
                setIsEmergency(true);
            }
            const foundEmotion = emotions.find(e => lowerCaseInput.includes(e.name.toLowerCase()));
            if (foundEmotion) {
                setIsEmotion(true);
                setEmotion(foundEmotion.name);
                setReason(input)
            }
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

            const chat = model.startChat({
                history: messages.map((message) => {
                    return {
                        role: message.role,

                        parts: [{ text: message.content }]
                    };
                }),
            });

            const result = await chat.sendMessage(input);
            const response = await result.response;
            const generatedText = response.text().replace(/^(.*?)(\n\n|$)/, '');


            if (user) await saveChatMessage({ role: "assistant", content: generatedText });
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages]
                const lastIndex = updatedMessages.length - 1
                updatedMessages[lastIndex].content = generatedText
                return updatedMessages
            });
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
            tos.warning("Emergency detected", { description: "Please click on the button to get help." })
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
                    <div className="p-2">
                        <Button asChild>
                            <Link to={"/emergency"}>Emergency</Link>
                        </Button>
                    </div>
                )}
                <CardContent className="grid gap-4">
                    <ScrollArea className={`h-[500px] overflow-y-auto ${isSmallScreen ? "w-full" : ""}`} ref={chatContainerRef}>
                        <div className="flex flex-col gap-2">
                            {messages.map((message, index) => (
                                <Fragment key={index}>
                                    <div
                                        className={`p-2 rounded-md ${message.role === "user"
                                            ? "bg-blue-100 self-end"
                                            : "bg-gray-100 self-start"
                                            }`}
                                    >
                                        {message.content}
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
            <div className="flex gap-2">
            <Button onClick={handleSendMessage} disabled={isLoading}>
                Send
            </Button>
                        <Button onClick={handleNewChat} variant="outline">
                            New Chat
                        </Button>
            </div>
        </div>
    );
}
