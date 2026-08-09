import { useEffect, useRef, useState } from "react";

function App() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const latestMessageId = useRef(null)
    const isFetching = useRef(false);
    const [username, setUsername] = useState("");
    const userId = "123";
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                setMessages(prev => [...prev, ...data])
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
            latestMessageId.current = data._id;

            setMessages(prev => [...prev, data]);
            setText("");
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div>
            <h1>YAP OUT</h1>

            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
            />
            {loading && <p>Loading messages...</p>}
            {error && <p>{error}</p>}

            <div>
                {messages.map((message) => (
                    <p key={message._id}>
                        <strong>{message.username}:</strong>{" "}
                        {message.text}{" "}
                        <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                    </p>
                ))}
                <div ref={messagesEndRef}></div>

            </div>

            <form onSubmit={sendMessage}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                />

                <button type="submit">
                    Send
                </button>
            </form>
        </div>
    );
}

export default App;