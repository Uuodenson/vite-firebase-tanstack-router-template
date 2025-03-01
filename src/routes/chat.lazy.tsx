import { createLazyFileRoute, redirect } from "@tanstack/react-router";
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
import { saveChatMessage, loadChatMessages } from "@/crypto-js";

export const Route = createLazyFileRoute("/chat")({
    component: ChatPage,
});

interface Message {
    role: "user" | "assistant";
    content: string;
}

function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);


    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        const loadMessages = async () => {
            const loadedMessages = await loadChatMessages();
            setMessages(loadedMessages);
        };
        loadMessages();
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
        if (input.trim() === "") return;

        const userMessage: Message = { role: "user", content: input };
        await saveChatMessage(userMessage);
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");
        setIsLoading(true);
        try {
            const assistantMessage: Message = { role: "assistant", content: "" };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);


            const response = await fetch(

                "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
                geminiApiKey,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: input }],
                            },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                tos("Error", {
                    description: "Failed to connect to the server. Please check your internet connection.",
                    action: {
                        label: "Go Back",
                        onClick: () => redirect({ to: "/", throw: true })
                    }

                });
                return;
            }
            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;
            await saveChatMessage({ role: "assistant", content: generatedText });
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages]
                const lastIndex = updatedMessages.length - 1
                updatedMessages[lastIndex].content = generatedText
                return updatedMessages
            });
        } catch (error) {
            tos("Error", {
                description: "Something went wrong. Please try again later.",
                action: {
                    label: "Go Back",
                    onClick: () => redirect({
                        to: "/signin",
                        search: {
                          redirect: location.href,
                        },
                      })
                }

            });
        } finally {
            setIsLoading(false);
        }
        ;
    };

    return (
        <div className="p-4 grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <Moon></Moon> Chat with Gemini
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <ScrollArea className="h-[500px] overflow-y-auto" ref={chatContainerRef}>
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
                    <Button onClick={handleSendMessage} disabled={isLoading}>
                        Send
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
