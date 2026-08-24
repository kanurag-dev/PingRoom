import { useEffect, useRef, useState } from "react";
import PixelBlast from './PixelBlast';


function App() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const latestMessageId = useRef(null)
    const isFetching = useRef(false);
    const [hasUsername, setHasUsername] = useState(
        !!localStorage.getItem("username")
    );
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const userId = "123";
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    function enterChat(e) {
        e.preventDefault();
        if (!username.trim()) return;
        localStorage.setItem("username", username.trim());
        setUsername(username.trim());
        setHasUsername(true);
    }


    useEffect(() => {
        const getMessages = async () => {
            if (isFetching.current) {
                return;
            }
            isFetching.current = true;
            let url = "https://pingroom-aamq.onrender.com/api/messages";
            if (latestMessageId.current) {
                url += `?after=${latestMessageId.current}`;
            }
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("Failed to load messages");
                }
                const data = await res.json();
                setLoading(false)
                setError("")
                if (data.length === 0) {
                    return;
                }
                latestMessageId.current = data[data.length - 1]._id;
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m._id));
                    const newOnes = data.filter(m => !existingIds.has(m._id));
                    return [...prev, ...newOnes];
                });
            } catch (err) {
                console.log(err);
                setError("Failed to load messages");
            }
            finally {
                isFetching.current = false;
            }
        };
        getMessages();


        const intervalId = setInterval(() => {
            getMessages();
        }, 2000);
        return () => {
            clearInterval(intervalId);
        }
    }, [])
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [messages])



    // useEffect(() => {
    //     const getMessages = async () => {
    //         try {
    //             const res = await fetch("http://localhost:3000/api/messages");
    //             const data = await res.json();

    //             setMessages(data);
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     };

    //     getMessages();
    // }, []);

    async function sendMessage(e) {
        e.preventDefault();

        if (!username.trim() || !text.trim()) return;

        try {
            const res = await fetch("https://pingroom-aamq.onrender.com/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId,
                    username,
                    text
                })
            });
            if (!res.ok) {
                throw new Error("Failed to send message");
            }

            const data = await res.json();
            setMessages(prev => {
                if (prev.some(m => m._id === data._id)) return prev; // just in case
                return [...prev, data];
            });
            setText("");
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="min-h-screen bg-[#0b0b0f]">

            {!hasUsername ? (
                <div className="relative min-h-screen overflow-hidden">
                    <PixelBlast
                        variant="square"
                        pixelSize={4}

                        patternScale={2}
                        patternDensity={1.1}
                        pixelSizeJitter={0}
                        enableRipples
                        rippleSpeed={0.4}
                        rippleThickness={0.12}
                        rippleIntensityScale={1.5}
                        liquid={false}
                        liquidStrength={0.12}
                        liquidRadius={1.2}
                        liquidWobbleSpeed={5}
                        speed={0.5}
                        edgeFade={0.25}
                        color="#B497CF"
                        transparent
                        className="absolute inset-0 z-0"
                    />

                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">

                        <form onSubmit={enterChat} className="pointer-events-auto">
                            <h1 className="text-6xl font-bold font-mono text-white text-center tracking-tight">Ping Room</h1>
                            <p className="mt-3 mb-8 text-center text-slate-400">Enter your username to continue</p>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Username"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none backdrop-blur-sm transition focus:border-purple-300/40 focus:bg-white/10" />
                            <button
                                type="submit"
                                className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-medium text-slate-200 transition hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98]"
                            >Enter Chat</button>
                        </form>
                    </div>
                </div>

            ) : (
    <div className="flex h-screen flex-col bg-gradient-to-b from-[#16161c] to-[#0b0b0f]">

        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <h1 className="text-xl font-bold tracking-tight text-white">
                Ping Room
            </h1>
            <span className="text-sm text-slate-400">
                {username}
            </span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading && (
                <p className="text-center text-sm text-slate-500">Loading messages...</p>
            )}
            {error && (
                <p className="text-center text-sm text-red-400">{error}</p>
            )}

            <div className="mx-auto flex max-w-2xl flex-col gap-2">
                {messages.map((message) => {
                    const isMe = message.username === username;
                    return (
                        <div
                            key={message._id}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                                    isMe

                                        ? "bg-purple-600 text-white"
                                        : "bg-white/10 text-slate-100"
                                }`}
                            >
                                {!isMe && (
                                    <p className="mb-0.5 text-xs font-semibold text-purple-300">
                                        {message.username}
                                    </p>
                                )}
                                <p>{message.text}</p>
                            </div>
                            <span className="mt-1 px-1 text-[10px] text-slate-500">
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef}></div>
            </div>
        </div>
        <form
            onSubmit={sendMessage}
            className="flex items-center gap-3 border-t border-white/5 bg-[#0b0b0f] px-4 py-3"
        >
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-purple-300/40 focus:bg-white/10"
            />
            <button
                type="submit"
                className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-500 active:scale-[0.98]"
            >
                Send
            </button>
        </form>
    </div>
    )}
    </div>
  );
}

export default App;