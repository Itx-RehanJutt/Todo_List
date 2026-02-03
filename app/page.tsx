"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Plus,
  Edit2,
  Check,
  X,
  ListTodo,
  Settings,
} from "lucide-react";
import { Toaster, toast } from "sonner";

interface Todo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt?: string;
}

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [newDueDate, setNewDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/todos");
      const result = await response.json();
      if (result.success) {
        setTodos(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTitle.trim()) return;

    try {
      setIsAdding(true);
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          dueDate: newDueDate,
          completed: false,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setTodos([result.data, ...todos]);
        setNewTitle("");
        setNewDescription("");
        setNewPriority("medium");
        setNewDueDate("");
        toast.success("Task created successfully!", {
          description: `"${result.data.title}" has been added to your list.`,
        });
      }
    } catch (error) {
      console.error("Failed to add todo:", error);
      toast.error("Failed to create task", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = async (id: string, currentCompleted: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });

      const result = await response.json();
      if (result.success) {
        setTodos(todos.map((todo) => (todo._id === id ? result.data : todo)));
        const message = !currentCompleted
          ? "Task completed! 🎉"
          : "Task marked as active";
        toast.success(message);
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
      toast.error("Failed to update task", {
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setTodos(todos.filter((todo) => todo._id !== id));
        toast.success("Task deleted", {
          description: "The task has been removed from your list.",
        });
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast.error("Failed to delete task", {
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty", {
        description: "Please enter a task title.",
      });
      return;
    }

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setTodos(todos.map((todo) => (todo._id === id ? result.data : todo)));
        setEditingId(null);
        toast.success("Task updated", {
          description: "Your changes have been saved.",
        });
      }
    } catch (error) {
      console.error("Failed to save edit:", error);
      toast.error("Failed to update task", {
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.filter((t) => !t.completed).length;
  const completionPercentage =
    todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  const renderLoadingSkeletons = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 bg-white">
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="space-y-8">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </div>
          {renderLoadingSkeletons()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-center" />
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <ListTodo className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                  My Tasks
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Stay organized and productive
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs sm:text-sm">
                <span className="hidden sm:inline">Active: </span>
                {activeCount}
              </Badge>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 text-xs sm:text-sm">
                <span className="hidden sm:inline">Done: </span>
                {completedCount}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress Section */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
              Progress
            </h3>
            <span className="text-xs sm:text-sm text-gray-600">
              {completedCount} of {todos.length}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-4 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
              {todos.length}
            </p>
          </Card>
          <Card className="p-3 sm:p-4 bg-white shadow-sm hover:shadow-md transition">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {activeCount}
            </p>
          </Card>
          <Card className="p-3 sm:p-4 bg-white shadow-sm hover:shadow-md transition hidden sm:block">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {completedCount}
            </p>
          </Card>
        </div>

        {/* Add Todo Section */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-white shadow-lg">
          <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Add New Task
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <Input
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
              className="w-full text-sm sm:text-base"
            />
            <Input
              placeholder="Task description (optional)..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Select
                value={newPriority}
                onValueChange={(value: any) => setNewPriority(value)}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full text-sm sm:text-base"
              />
            </div>
            <Button
              onClick={addTodo}
              disabled={isAdding || !newTitle.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-sm sm:text-base font-semibold"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Filter Section */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
            className="rounded-full text-xs sm:text-sm"
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
            size="sm"
            className="rounded-full text-xs sm:text-sm"
          >
            Active
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            size="sm"
            className="rounded-full text-xs sm:text-sm"
          >
            Completed
          </Button>
        </div>

        {/* Todo List */}
        <Card className="bg-white shadow-lg overflow-hidden">
          {filteredTodos.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <ListTodo className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-500 text-base sm:text-lg font-medium px-2">
                {filter === "all"
                  ? "No tasks yet. Create one to get started!"
                  : `No ${filter} tasks.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTodos.map((todo) => (
                <div
                  key={todo._id}
                  className="p-3 sm:p-4 hover:bg-blue-50 transition duration-200"
                >
                  {editingId === todo._id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="font-semibold text-sm sm:text-base"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        className="text-sm sm:text-base"
                      />
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => saveEdit(todo._id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size="sm"
                          variant="outline"
                          className="text-xs sm:text-sm"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() =>
                            toggleTodo(todo._id, todo.completed)
                          }
                          className="mt-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3
                              className={`font-semibold text-sm sm:text-base wrap-break-word ${
                                todo.completed
                                  ? "line-through text-gray-400"
                                  : "text-gray-800"
                              }`}
                            >
                              {todo.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium shrink-0 ${getPriorityColor(
                                todo.priority,
                              )}`}
                            >
                              {todo.priority}
                            </Badge>
                          </div>
                          {todo.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 wrap-break-word">
                              {todo.description}
                            </p>
                          )}
                          {todo.dueDate && (
                            <p className="text-xs text-gray-500">
                              📅 Due:{" "}
                              {new Date(todo.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 ml-2 shrink-0">
                        <Button
                          onClick={() => startEditing(todo)}
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:bg-blue-100 p-1 sm:p-2 h-auto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-100 p-1 sm:p-2 h-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="mx-4 sm:mx-0">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-base sm:text-lg">
                                Delete Task
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-xs sm:text-sm">
                                Are you sure you want to delete "{todo.title}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-3 justify-end pt-2">
                              <AlertDialogCancel className="text-xs sm:text-sm">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTodo(todo._id)}
                                className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
