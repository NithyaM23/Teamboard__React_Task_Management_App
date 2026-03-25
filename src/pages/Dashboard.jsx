import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [boards, setBoards] = useState([]);
    const [title, setTitle] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedBoards = JSON.parse(localStorage.getItem("teamboard_boards")) || [];
        setBoards(savedBoards);
    }, []);

    const saveBoards = (newBoards) => {
        setBoards(newBoards);
        localStorage.setItem("teamboard_boards", JSON.stringify(newBoards));
    };

    const handleCreateBoard = () => {
        if(!title.trim())
            return;

        const newBoard = {
            id: Date.now().toString(),
            title: title,
            createdAt: new Date().toISOString(),
        };

        const updatedBoards = [...boards, newBoard];
        saveBoards(updatedBoards);
        setTitle("");
    };

    const openBoard = (id) => {
        navigate(`/board/${id}`);
    };

    const deleteBoard = (id) => {
        const updatedBoards = boards.filter((b) => b.id !== id);
        saveBoards(updatedBoards);
    };

    return (
        <div style={{ padding: "30px"}}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>TeamBoard</h1>
            <p style={{ marginTop: "5px", color: "gray" }}>
                Create boards and manage tasks like Trello
            </p>

            <div style= {{ marginTop: "25px", display: "flex", gap: "10px" }}>
                <input type="text" placeholder="Enter board name...." value={title} onChange={(e) => setTitle(e.target.value)} style={{
                    padding: "10px", 
                    width: "250px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                }}
                />
                <button onClick={handleCreateBoard} style={{
                    padding: "10px 15px",
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    borderRadius: "8px",
                    cursor: "pointer",
                }} >
                    Create Board
                </button>
            </div>

            <h2 style={{ marginTop: "30px", fontSize: "20px" }}>Your Boards</h2>

            {boards.length === 0 ? (
                <p style={{ marginTop: "10px", color: "gray" }}>
                    No boards created yet.
                </p>
            ) : (
                <div style={{ marginTop: "15px", display: "flex", gap: "15px", flexWrap: "wrap", }}
                >
                    {boards.map((board) => (
                        <div key={board.id} style={{ width: "220px", padding: "15px", borderRadius: "12px", border: "1px solid #ddd", background: "#f9fafb",}} >

                            <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
                                {board.title}
                            </h3>

                            <div style={{ marginTop: "15px", display: "flex", gap: "10px"}}>
                                <button onClick={() => openBoard(board.id)} style={{
                                    padding: "8px 10px",
                                    border: "none",
                                    background: "#16a34a",
                                    color: "white",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    flex: 1,
                                }} >
                                    open
                                </button>

                                <button onClick={() => deleteBoard(board.id)} style={{ 
                                    padding: "8px 10px",
                                    border: "none",
                                    background: "#dc2626",
                                    color: "white",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    flex: 1,
                                }} >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}