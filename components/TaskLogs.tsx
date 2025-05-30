'use client';

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  TrendingUp,
  Activity,
  AlertCircle,
  Timer,
  Archive,
  FileText,
  Code,
  Globe,
  Zap
} from 'lucide-react';
import { TaskLog } from '../types';
import dayjs from 'dayjs';

interface TaskLogsProps {
  logs: TaskLog[];
  onRefresh: () => void;
}

export default function TaskLogs({ logs, onRefresh }: TaskLogsProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTaskName, setSearchTaskName] = useState('');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
    const statusMatch = filterStatus === 'all' || log.status === filterStatus;
    const nameMatch = !searchTaskName || (log as any).task_name?.toLowerCase().includes(searchTaskName.toLowerCase());
    return statusMatch && nameMatch;
  });
  }, [logs, filterStatus, searchTaskName]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(log => log.status === 'success').length;
    const error = logs.filter(log => log.status === 'error').length;
    const avgExecutionTime = logs.length > 0 
      ? Math.round(logs.reduce((sum, log) => sum + log.execution_time, 0) / logs.length)
      : 0;
    
    return { total, success, error, avgExecutionTime };
  }, [logs]);

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  };

  const getHttpStatusBadge = (status?: number) => {
    if (!status) return <span className="text-muted-foreground">-</span>;
    const isSuccess = status >= 200 && status < 300;
    return (
      <Badge variant={isSuccess ? "default" : "destructive"} className={
        isSuccess 
          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800" 
          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
      }>
        <Globe className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-muted rounded-lg">
            <Archive className="h-5 w-5 text-foreground" />
          </div>
    <div>
            <h3 className="text-xl font-semibold text-foreground">Execution Logs</h3>
            <p className="text-sm text-muted-foreground">Monitor task execution history and performance</p>
          </div>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Executions</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">All time executions</p>
          </CardContent>
          </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Count</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-green-600">{stats.success}</div>
            <p className="text-sm text-muted-foreground mt-1">Successful executions</p>
          </CardContent>
          </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed Count</CardTitle>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-red-600">{stats.error}</div>
            <p className="text-sm text-muted-foreground mt-1">Failed executions</p>
          </CardContent>
          </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Execution Time</CardTitle>
              <Timer className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-amber-600">{stats.avgExecutionTime}ms</div>
            <p className="text-sm text-muted-foreground mt-1">Average response time</p>
          </CardContent>
          </Card>
      </div>

      {/* Filters */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Failed</SelectItem>
                </SelectContent>
            </Select>
            </div>
            
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search task name..."
              value={searchTaskName}
              onChange={(e) => setSearchTaskName(e.target.value)}
                className="flex-1"
            />
            </div>
            
            <Button onClick={onRefresh} variant="outline" size="lg" className="shadow-sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log table */}
      <Card className="border shadow-sm py-0">
        <CardContent className="p-0">
          <div className="bg-card rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="font-semibold text-foreground py-4">Task Name</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-foreground">HTTP Status</TableHead>
                  <TableHead className="hidden sm:table-cell font-semibold text-foreground">Execution Time</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold text-foreground">Executed At</TableHead>
                  <TableHead className="hidden xl:table-cell font-semibold text-foreground">Error Message</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50 transition-colors border-b">
                    <TableCell className="font-medium text-foreground py-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span>{(log as any).task_name || 'Unknown Task'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getHttpStatusBadge(log.response_status)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{log.execution_time}ms</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {dayjs(log.executed_at).format('YYYY-MM-DD HH:mm:ss')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell max-w-48 truncate">
                      {log.error_message ? (
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-red-600 text-sm truncate" title={log.error_message}>
                            {log.error_message}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center text-xl">
                                <FileText className="h-5 w-5 mr-2" />
                                Execution Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border shadow-sm">
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center">
                                      <Activity className="h-4 w-4 mr-2" />
                                      Basic Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-muted-foreground">Task Name:</span>
                                      <span className="text-sm font-semibold">{(log as any).task_name || 'Unknown Task'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                      {getStatusBadge(log.status)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-muted-foreground">HTTP Status:</span>
                                      {getHttpStatusBadge(log.response_status)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-muted-foreground">Execution Time:</span>
                                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                        <Timer className="h-3 w-3 mr-1" />
                                        {log.execution_time}ms
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-muted-foreground">Executed At:</span>
                                      <span className="text-sm font-mono text-foreground">
                                        {dayjs(log.executed_at).format('YYYY-MM-DD HH:mm:ss')}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {log.error_message && (
                                  <Card className="border shadow-sm border-red-200 bg-red-50/50">
                                    <CardHeader>
                                      <CardTitle className="text-base flex items-center text-red-800">
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        Error Message
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-red-700 text-sm break-words font-mono bg-card p-3 rounded border">
                                        {log.error_message}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                              
                              {log.response_body && (
                                <Card className="border shadow-sm">
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center">
                                      <Code className="h-4 w-4 mr-2" />
                                      Response Content
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="bg-muted border rounded-lg overflow-hidden">
                                      <div className="bg-muted/50 px-3 py-2 border-b">
                                        <span className="text-xs font-medium text-muted-foreground">Response Body</span>
                                      </div>
                                      <pre className="p-4 text-sm overflow-auto max-h-64 whitespace-pre-wrap text-foreground font-mono">
                                        {log.response_body}
                                      </pre>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Archive className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">No execution logs found</h3>
                    <p className="text-muted-foreground mt-1">
                      {logs.length === 0 
                        ? "No tasks have been executed yet" 
                        : "No logs match your current filters"
                      }
                    </p>
                  </div>
                  {logs.length === 0 && (
                    <Button variant="outline" className="mt-4">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Create Your First Task
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
