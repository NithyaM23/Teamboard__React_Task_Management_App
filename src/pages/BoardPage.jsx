import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { defaultLists } from "../utils/boardData";
import { FaTrash, FaEdit, FaCheck, FaPlus } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function BoardPage() {
    const { id } = useParams();

    const [lists, setLists] = useState(defaultLists);
    const [taskInputs, setTaskInputs] = useState({});
    const [taskDescriptions, setTaskDescriptions] = useState({});
    const [taskDueDates, setTaskDueDates] = useState({});
    const [taskPriorities, setTaskPriorities] = useState({});
    const [taskLabels, setTaskLabels] = useState({});

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedText, setEditedText] = useState("");

    const [editingListId, setEditingListId] = useState(null);
    const [editedListTitle, setEditedListTitle] = useState("");

    const [newListTitle, setNewListTitle] = useState("");
    const [showListInput, setShowListInput] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [sortType, setSortType] = useState({});


//load data 
useEffect(() => {
    const saved = localStorage.getItem(`board_${id}`);

    if(saved) {
        try {
            const parsed = JSON.parse(saved);

            if(Array.isArray(parsed) && parsed.length>0) {
                setLists(parsed);
            } else {
                setLists(defaultLists);
                localStorage.setItem(`board_${id}`,
                    JSON.stringify(defaultLists)
                );
            }
        } catch (error) {
            setLists(defaultLists);
        }
    } else {
        setLists(defaultLists);
        localStorage.setItem(`board_${id}`,
                JSON.stringify(defaultLists)
            );
    }
}, [id]);

const saveLists = (newLists) => {
    setLists(newLists);
    localStorage.setItem(`board_${id}`, JSON.stringify(newLists));
};

//task functions
const addTask = (listId) => {
    const text = taskInputs[listId];
    if(!text || !text.trim()) return;

    const newTask = {
        id: Date.now().toString(),
        text: text,
        description: taskDescriptions[listId] || "",
        dueDate: taskDueDates[listId] || "",
        priority: taskPriorities[listId] || "Medium",
        label: taskLabels[listId] || "",
        completed: false,
    };

    const updatedLists = lists.map((list) => {
        if(list.id === listId) {
            return{...list, tasks: [...list.tasks, newTask]};
        }
        return list;
    });

    saveLists(updatedLists);

    //reset inputs
    setTaskInputs({
        ...taskInputs, 
        [listId]: ""
    });

    setTaskDescriptions({
        ...taskDescriptions, 
        [listId]: ""
    });

    setTaskDueDates({
        ...taskDueDates, 
        [listId]: ""
    });

    setTaskPriorities({
        ...taskPriorities, 
        [listId]: "Medium"
    });

    setTaskLabels({
        ...taskLabels, 
        [listId]: ""
    });
};

const deleteTask = (listId, taskId) => {
    if(!window.confirm("Are you sure you want to delete this task?")) return;

    const updatedLists = lists.map((list) => {
        if(list.id === listId) {
            return{
                ...list,
                tasks: list.tasks.filter((task) => task.id !== taskId),
            };
        }
        return list;
    });

    saveLists(updatedLists);
};

const toggleTaskComplete = (listId, taskId) => {
    const updatedLists = lists.map((list) => {
        if(list.id === listId) {
            return {
                ...list,
                tasks: list.tasks.map((task) =>
                    task.id === taskId
                        ?{...task, completed: !task.completed}
                        : task
                ),
            };
        }
        return list;
    });

    saveLists(updatedLists);
};

const saveEditedTask = (listId, taskId) => {
    if(!editedText.trim()) return;

    const updatedLists = lists.map((list) => {
        if(list.id === listId) {
            return {
                ...list,
                tasks: list.tasks.map((task) =>
                    task.id === taskId ? {...task, text: editedText} : task),
            };
        }
        return list;
    });

    saveLists(updatedLists);
    setEditingTaskId(null);
    setEditedText("");
};

//list functions
const addNewList = () => {
    if(!newListTitle.trim()) return;

    const newList = {
        id: Date.now().toString(),
        title: newListTitle,
        tasks: [],
    };

    const updatedLists = [...lists, newList];

    saveLists(updatedLists);
    setNewListTitle("");
    setShowListInput(false);
};

const deleteList = (listId) => {
    if(!window.confirm("Delete this entire list?")) return;
    
    const updatedLists = lists.filter((list) => list.id !== listId);
    saveLists(updatedLists);
};

const saveEditedList = (listId) => {
    if(!editedListTitle.trim()) return;

    const updatedLists = lists.map((list) =>
        list.id === listId ? {...list, title: editedListTitle} : list
    );

    saveLists(updatedLists);
    setEditingListId(null);
    setEditedListTitle("");
};

//drag
const onDragEnd = ({ source, destination }) => {
    if(!destination) return;

    const sourceList = lists.find((l) => l.id === source.droppableId);
    const destList = lists.find((l) => l.id === destination.droppableId);

    const draggedTask = sourceList.tasks[source.index];

    let newLists = lists.map((list) => {
        if(list.id === source.droppableId) {
            const newTasks = [...list.tasks];
            newTasks.splice(source.index, 1);
            return{...list, tasks:newTasks};
        }
        return list;
    });

    newLists = newLists.map((list) => {
        if(list.id === destination.droppableId) {
            const newTasks = [...list.tasks];
            newTasks.splice(destination.index, 0, draggedTask);
            return{...list, tasks: newTasks};
        }
        return list;
    });

    saveLists(newLists);
};

//sort
const sortTasks = (tasks, type) => {
    let sorted = [...tasks];

    if(type === "priority") {
        const order = {High: 1, Medium: 2, Low: 3};
        sorted.sort((a,b) => order[a.priority] - order[b.priority]);
    }

    if(type === "dueDate") {
        sorted.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    if(type === "alphabet") {
        sorted.sort((a,b) => a.text.localeCompare(b.text));
    }

    return sorted;
};

//UI
return (
    <div style={{padding: "30px"}}>
        <Link to="/" style={{color:"#2563eb", textDecoration:"none"}}>
            Back to Dashboard
        </Link>

        <h1 style={{marginTop:"20px", fontSize:"28px", fontWeight:"bold"}}>
            TeamBoard Workspace
        </h1>

        <input 
            type="text"
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{marginTop:"15px", padding:"8px", width:"300px", borderRadius:"6px", border:"1px solid #ccc"}}
        />

        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{display:"flex", gap:"15px", marginTop:"25px", overflowX:"auto"}}>
                {lists.map((list) => (
                    <Droppable droppableId={list.id} key={list.id}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                    minWidth:"400px", 
                                    padding:"15px",
                                    background:"#f9fafb",
                                    borderRadius:"12px",
                                    border:"1px solid #ddd",
                                    borderTop:`4px solid ${list.color || "#2563eb"}`
                                }}>
                                    <h2 style={{
                                        display:"flex",
                                        justifyContent:"space-between",
                                        alignItems:"center"
                                    }} >
                                        {editingListId === list.id ? (
                                            <input 
                                                value={editedListTitle}
                                                onChange={(e) => setEditedListTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if(e.key === "Enter") {
                                                        saveEditedList(list.id);
                                                    }
                                                }}
                                                style={{
                                                    flex:1,
                                                    padding:"6px",
                                                    borderRadius:"6px",
                                                    border:"1px solid #ccc"
                                                }}
                                            />
                                        ) : (
                                            <span 
                                                style={{cursor:"pointer"}}
                                                onClick={() => {
                                                    setEditingListId(list.id);
                                                    setEditedListTitle(list.title);
                                                }} >
                                                    {list.title}
                                                </span>
                                        )}

                                        <div style={{marginTop:"8px"}}>
                                            <select value = {sortType[list.id] || ""} onChange={(e) => setSortType ({
                                                ...sortType,
                                                [list.id]: e.target.value
                                            })}

                                            style={{
                                                width:"100%",
                                                padding:"6px",
                                                borderRadius:"6px",
                                                border:"1px solid #ccc"
                                            }}>
                                                <option value="">Sort Tasks</option>
                                                <option value="priority">Priority</option>
                                                <option value="dueDate">Due Date</option>
                                                <option value="alphabet">A-Z</option>
                                            </select>
                                        </div>

                                        <span style={{
                                            background:"#2563eb",
                                            color:"white", borderRadius:"12px", 
                                            padding:"2px 8px", 
                                            fontSize:"12px",
                                            fontWeight:"bold"
                                        }} >
                                            {list.tasks.length}
                                        </span>

                                        <FaTrash 
                                        size={20} 
                                        style={{cursor:"pointer", color:"red"}}
                                        onClick={() => deleteList(list.id)} />
                                    </h2>
                                    
                                    {/*Add Task Section*/}
                                    <div style={{
                                        marginTop:"10px", 
                                        display:"flex",
                                        gap:"8px",
                                        alignItems:"center",
                                        flexWrap:"wrap"
                                    }}>
                                        <input
                                            type="text"
                                            placeholder="Add a task..."
                                            value={taskInputs[list.id] || ""}
                                            onChange={(e) => setTaskInputs({
                                                ...taskInputs,
                                                [list.id]: e.target.value,
                                            })}
                                            style={{
                                                flex:2, 
                                                padding:"8px",
                                                borderRadius:"6px",
                                                border:"1px solid #ccc",
                                                minWidth:"120px"
                                            }}
                                            onKeyDown={(e) => {
                                                if(e.key === "Enter") {
                                                    addTask(list.id);
                                                }
                                            }}
                                        />

                                        <textarea 
                                            placeholder="Task description..."
                                            value={taskDescriptions[list.id] || ""}
                                            onChange={(e) => setTaskDescriptions ({
                                                ...taskDescriptions,
                                                [list.id]: e.target.value
                                            })}
                                            style={{
                                                width:"100%",
                                                padding:"8px",
                                                borderRadius:"6px",
                                                border:"1px solid #ccc",
                                                marginTop:"6px"
                                            }} 
                                        />

                                        {/*Due Date*/}
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split("T")[0]}
                                            value={taskDueDates[list.id] || ""}
                                            onChange={(e) => setTaskDueDates ({
                                                ...taskDueDates,
                                                [list.id]: e.target.value,
                                            })} 
                                            style={{
                                                flex:1,
                                                padding:"8px",
                                                borderRadius:"6px",
                                                border:"1px solid #ccc",
                                                minWidth:"120px"
                                            }}
                                        />

                                        <select
                                            value={taskPriorities[list.id] || "Medium"}
                                            onChange={(e) =>
                                                setTaskPriorities({
                                                    ...taskPriorities,
                                                    [list.id]: e.target.value,
                                                })
                                            }
                                            style={{
                                                flex:1,
                                                padding:"8px",
                                                borderRadius:"6px",
                                                border:"1px solid #ccc"
                                            }}>
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                        </select>

                                        <select 
                                            value={taskLabels[list.id] || ""}
                                            onChange={(e) => setTaskLabels({
                                                ...taskLabels,
                                                [list.id]: e.target.value
                                            })}
                                            style={{
                                                flex:1,
                                                padding:"8px",
                                                borderRadius:"6px",
                                                border:"1px solid #ccc"
                                            }}
                                        >
                                            <option value="">No Label</option>
                                            <option value="Design">Design</option>
                                            <option value="Bug">Bug</option>
                                            <option value="Feature">Feature</option>
                                            <option value="Research">Research</option>
                                        </select>

                                        <button 
                                            onClick={() => addTask(list.id)}
                                            style={{
                                                padding:"8px 12px",
                                                background:"#2563eb",
                                                color:"white",
                                                border:"none",
                                                borderRadius:"6px",
                                                cursor:"pointer",
                                                flexShrink:0
                                            }}
                                        >
                                            Add Task
                                        </button>
                                    </div>

                                    {/*Tasks*/}
                                    <div style={{marginTop:"15px"}}>
                                        {sortTasks(
                                            list.tasks.filter(task =>
                                                task.text.toLowerCase().includes(searchText.toLowerCase())
                                            ),
                                            sortType[list.id]
                                        ).map((task, index) => (
                                            <Draggable
                                                key={task.id}
                                                draggableId={task.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => {
                                                    const today = new Date();
                                                    const due = task.dueDate ? new Date(task.dueDate) : null;
                                                    const isOverdue = due && due < today && !task.completed;

                                                    return (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                background:isOverdue ? "#fecaca" : "white",
                                                                padding:"12px",
                                                                borderRadius:"10px",
                                                                marginBottom:"10px",
                                                                border:"1px solid #e5e7eb",
                                                                boxShadow:snapshot.isDragging ? "0 8px 20px rgba(0,0,0,0.15)" : "0 1px 2px rgba(0,0,0,0.05)",
                                                                transform:snapshot.isDragging ? "rotate(2deg)" : "none",
                                                                transition:"all 0.2s ease",
                                                                cursor:"grab",
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display:"flex",
                                                                    justifyContent:"space-between",
                                                                    alignItems:"center",
                                                                    gap:"8px"
                                                                }}
                                                            >
                                                                {/*Left side(text edit input)*/}
                                                                {editingTaskId === task.id ? (
                                                                    <input
                                                                    value={editedText}
                                                                    onChange={(e) => setEditedText(e.target.value)}
                                                                    style={{
                                                                        flex:1,
                                                                        padding:"6px",
                                                                        borderRadius:"6px",
                                                                        border:"1px solid #ccc"
                                                                    }} />
                                                                ) : (
                                                                    <div
                                                                        style={{
                                                                            display:"flex",
                                                                            alignItems:"center",
                                                                            gap:"8px",
                                                                            flex:1
                                                                        }}
                                                                    >
                                                                        <input
                                                                        type="checkbox"
                                                                        checked={task.completed}
                                                                        onChange={() =>
                                                                            toggleTaskComplete(list.id, task.id)
                                                                        } 
                                                                        />
                                                                        <div
                                                                            style={{
                                                                                textDecoration: task.completed ? "line-through" : "none",
                                                                                color: task.completed ? "#9ca3af" : "black"
                                                                            }}
                                                                        >
                                                                            {task.text}
                                                                            {task.description && (
                                                                                <div style={{
                                                                                    fontSize:"13px", 
                                                                                    color:"#6b7280",
                                                                                    marginTop:"4px"
                                                                                }} >
                                                                                {task.description}
                                                                                </div>

                                                                            )}
                                                                            <div 
                                                                                style ={{
                                                                                    fontSize:"12px", 
                                                                                    fontWeight:"bold",
                                                                                    color:task.priority === "High" ? "#dc2626" : task.priority === "Medium" ? "#f59e0b" : "#16a34a"
                                                                                }}>
                                                                                    {task.priority}
                                                                            </div>

                                                                            {task.dueDate && (
                                                                                <small
                                                                                    style={{color:"#6b7280"}}>
                                                                                        Due: {task.dueDate}
                                                                                </small>  
                                                                            )}

                                                                            {isOverdue && (
                                                                                <div
                                                                                    style={{
                                                                                        color:"#dc2626",
                                                                                        fontWeight:"bold",
                                                                                        fontSize:"12px",
                                                                                        marginTop:"4px"
                                                                                    }}
                                                                                >
                                                                                    overdue
                                                                                </div>
                                                                            )}

                                                                            {task.label && (
                                                                                <div
                                                                                    style={{
                                                                                        background: task.label === "Bug" ? "#dc2626" : task.label === "Feature" ? "#2563eb" : task.label === "Design" ? "#7c3aed" : "#059669",
                                                                                        color:"white",
                                                                                        padding:"2px 8px",
                                                                                        borderRadius:"12px",
                                                                                        fontSize:"11px",
                                                                                        display:"inline-block",
                                                                                        marginBottom:"6px"
                                                                                    }} >
                                                                                        {task.label}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        

                                                                    </div>
                                                                )}

                                                                {/*Right side(Icons)*/}
                                                                <div
                                                                style={{
                                                                    display:"flex",
                                                                    gap:"6px"
                                                                }}>
                                                                    {editingTaskId === task.id ? (
                                                                        <FaCheck
                                                                        style={{cursor:"pointer", color:"green"}}
                                                                        onClick={() => saveEditedTask(list.id, task.id)} />
                                                                        ) : (
                                                                            <FaEdit
                                                                            style={{cursor:"pointer", color:"#2563eb"}}
                                                                            onClick={()=> {
                                                                                setEditingTaskId(task.id);
                                                                                setEditedText(task.text);
                                                                            }} />
                                                                        )
                                                                        }

                                                                        <FaTrash
                                                                        style={{cursor:"pointer", color:"red"}}
                                                                        onClick={() => 
                                                                            deleteTask(list.id, task.id)} />
                                                                

                                                            </div>

                                                        </div>
                                                    </div>
                                                    );
                                                }}

                                            </Draggable>
                                        ))}

                                    </div>

                                    {provided.placeholder}
                                </div>
                        )}
                    </Droppable> 
                ))}

                {/*Add New List Section*/}
                <div style={{minWidth:"300px"}}>
                    {showListInput ? (
                        <div style={{
                            background:"#f3f4f6",
                            padding:"15px",
                            borderRadius:"12px",
                            border:"1px solid #ddd"
                        }}>
                            <input 
                                type="text"
                                placeholder="Enter list title..."
                                value={newListTitle}
                                onChange={(e) =>
                                    setNewListTitle(e.target.value)
                                }
                                style={{width:"100%", padding:"8px", borderRadius:"6px", border:"1px solid #ccc", marginBottom:"8px"}} 
                            />
                                <div style={{display:"flex", gap:"8px"}}>
                                    <button
                                        onClick={addNewList}
                                        style={{flex:1, padding:"8px", background:"#2563eb", color:"white", border:"none", borderRadius:"6px", cursor:"pointer"}}
                                    >
                                        Add List
                                    </button>

                                    <button
                                        onClick={() =>
                                            setShowListInput(false)
                                        }
                                        style={{flex:1, padding:"8px", background:"#e5e7eb", border:"none", borderRadius:"6px", cursor:"pointer"}} >
                                            Cancel
                                        </button>
                                </div>
                            </div>
                    ) : (
                        <button
                            onClick={() => setShowListInput(true)}
                            style={{width:"100%", padding:"14px", background:"#e5e7eb", border:"none", borderRadius:"12px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", fontWeight:"bold"}}>
                                <FaPlus />
                                Add Another List
                            </button>
                    )}
                </div>
            </div>
        </DragDropContext>
    </div>
);
}
