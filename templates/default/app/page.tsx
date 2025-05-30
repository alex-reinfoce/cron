"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Play,
  Pause,
  Trash2,
  TestTube,
  RefreshCw,
  Clock,
  MoreHorizontal,
  Activity,
  Target,
  Calendar,
  Timer,
  BarChart3,
  Settings,
  Zap,
  CheckCircle2,
  PauseCircle,
  ExternalLink,
  Archive,
} from "lucide-react";
import { Task, TaskFormData, TaskLog } from "../types";
import { getCronDescription } from "../lib/cronUtils";
import TaskForm from "@/components/TaskForm";
import TaskLogs from "@/components/TaskLogs";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "sonner";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchLogs();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        toast.error("Failed to fetch tasks");
      }
    } catch (error) {
      toast.error("Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        toast.error("Failed to fetch logs");
        setLogs([]);
      }
    } catch (error) {
      toast.error("Error fetching logs");
      setLogs([]);
    }
  };

  const handleSubmit = async (values: TaskFormData) => {
    try {
      const taskData = {
        ...values,
        headers: values.headers.reduce((acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        }, {} as Record<string, string>),
      };

      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        toast.success(
          editingTask
            ? "Task updated successfully"
            : "Task created successfully"
        );
        setModalVisible(false);
        setEditingTask(null);
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Error saving task");
    }
  };

  const handleStatusToggle = async (task: Task) => {
    try {
      const newStatus = task.status === "active" ? "paused" : "active";
      const response = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(
          `Task ${newStatus === "active" ? "activated" : "paused"} successfully`
        );
          fetchTasks();
      } else {
        toast.error("Failed to update task status");
      }
    } catch (error) {
      toast.error("Error updating task status");
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
        fetchTasks();
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  const handleTest = async (task: Task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/test`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success("Task executed successfully");
        } else {
          toast.error(`Task execution failed: ${result.error}`);
        }
        fetchLogs();
      } else {
        toast.error("Failed to test task");
      }
    } catch (error) {
      toast.error("Error testing task");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge
          variant="default"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
      >
        <PauseCircle className="h-3 w-3 mr-1" />
        Paused
      </Badge>
    );
  };

  const getTaskTypeBadge = (type: string) => {
    if (type === "business") {
      return (
        <Badge
          variant="default"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
        >
          <Target className="h-3 w-3 mr-1" />
          Business
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
      >
        <Zap className="h-3 w-3 mr-1" />
        Keep Alive
      </Badge>
    );
  };

  // Statistics
  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => t.status === "active").length,
    paused: tasks.filter((t) => t.status === "paused").length,
    business: tasks.filter((t) => t.task_type === "business").length,
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Activity className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Cron Task Platform
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enterprise-level scheduled task management
                  </p>
                </div>
              </div>
            <Button 
                onClick={() => setModalVisible(true)}
                size="lg"
                className="shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Task
            </Button>
            </div>
        </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground mt-1">All scheduled tasks</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Tasks
                  </CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                <p className="text-sm text-muted-foreground mt-1">Currently running</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Paused Tasks
                  </CardTitle>
                  <PauseCircle className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-orange-600">{stats.paused}</div>
                <p className="text-sm text-muted-foreground mt-1">Temporarily stopped</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Business Tasks
                  </CardTitle>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-blue-600">{stats.business}</div>
                <p className="text-sm text-muted-foreground mt-1">Business workflows</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="border shadow-sm">
            <CardContent className="p-8">
              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                  <TabsTrigger
                    value="tasks"
                    className="flex items-center space-x-2 text-base"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Task Management</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="logs"
                    className="flex items-center space-x-2 text-base"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Execution Logs</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Settings className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">
                            Task Management
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Create, edit, and manage your scheduled tasks
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={fetchTasks}
                        variant="outline"
                        size="lg"
                        className="shadow-sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>

                    <div className="bg-card rounded-lg border shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">
                              Task Name
                            </TableHead>
                            <TableHead className="font-semibold">
                              Type
                            </TableHead>
                            <TableHead className="font-semibold">
                              Status
                            </TableHead>
                            <TableHead className="hidden md:table-cell font-semibold">
                              URL
                            </TableHead>
                            <TableHead className="hidden lg:table-cell font-semibold">
                              Schedule
                            </TableHead>
                            <TableHead className="hidden xl:table-cell font-semibold">
                              Created
                            </TableHead>
                            <TableHead className="font-semibold text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tasks.map((task) => (
                            <TableRow
                              key={task.id}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium text-foreground">
                                {task.name}
                              </TableCell>
                              <TableCell>
                                {getTaskTypeBadge(task.task_type)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(task.status)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell max-w-64 truncate">
                                <a
                                  href={task.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 hover:underline flex items-center"
                                >
                                  <span className="truncate">{task.url}</span>
                                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                                </a>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span className="text-sm">
                                    {getCronDescription(task.cron_expression)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden xl:table-cell text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span className="text-sm">
                                    {task.created_at
                                      ? new Date(
                                          task.created_at
                                        ).toLocaleDateString()
                                      : "-"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingTask(task);
                                          setModalVisible(true);
                                        }}
                                        className="flex items-center"
                                      >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Edit Task
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleStatusToggle(task)}
                                        className="flex items-center"
                                      >
                                        {task.status === "active" ? (
                                          <>
                                            <PauseCircle className="h-4 w-4 mr-2" />
                                            Pause Task
                                          </>
                                        ) : (
                                          <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Activate Task
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleTest(task)}
                                        className="flex items-center"
                                      >
                                        <TestTube className="h-4 w-4 mr-2" />
                                        Test Execute
                                      </DropdownMenuItem>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="flex items-center text-red-600 focus:text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Task
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center">
                                              <Trash2 className="h-5 w-5 mr-2 text-red-600" />
                                              Delete Task
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete "
                                              <strong>{task.name}</strong>"?
                                              This action cannot be undone and
                                              will remove all associated
                                              execution logs.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleDelete(task.id!)
                                              }
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {tasks.length === 0 && !loading && (
                        <div className="text-center py-16">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-muted rounded-full">
                              <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-foreground">
                                No tasks found
                              </h3>
                              <p className="text-muted-foreground mt-1">
                                Create your first task to get started with
                                automation
                              </p>
                            </div>
                            <Button
                              onClick={() => setModalVisible(true)}
                              className="mt-4"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create First Task
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="mt-8">
                  <TaskLogs logs={logs} onRefresh={fetchLogs} />
                </TabsContent>
              </Tabs>
            </CardContent>
        </Card>

          {/* Create/Edit task modal */}
          <Dialog
          open={modalVisible}
            onOpenChange={(open) => {
              if (!open) {
            setModalVisible(false);
            setEditingTask(null);
              }
            }}
          >
            <DialogContent 
              className="dialog-content w-[95vw] max-w-[1200px] max-h-[95vh] overflow-hidden p-0" 
              style={{
                transform: 'translate(-50%, -50%)',
                animation: 'none',
                transition: 'none'
              }}
            >
              <DialogHeader className="px-6 py-4 border-b bg-muted/30">
                <DialogTitle className="flex items-center text-2xl font-bold">
                  {editingTask ? (
                    <>
                      <div className="p-2 bg-muted rounded-lg mr-3">
                        <Settings className="h-5 w-5 text-foreground" />
                      </div>
                      <span className="text-foreground">Edit Task</span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-muted rounded-lg mr-3">
                        <Plus className="h-5 w-5 text-foreground" />
                      </div>
                      <span className="text-foreground">Create New Task</span>
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="px-6 py-4">
          <TaskForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setModalVisible(false);
              setEditingTask(null);
            }}
            initialValues={editingTask}
          />
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AuthGuard>
  );
}
