'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Plus, 
  Minus, 
  Settings, 
  Globe, 
  Target, 
  Clock, 
  Zap, 
  Calendar, 
  Code, 
  FileText,
  Link,
  Play,
  Hash,
  Timer,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TaskFormData, Task } from '../types';
import { cronSchedules, validateCronExpression } from '../lib/cronUtils';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const taskFormSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  task_type: z.enum(["business", "keep_alive"], {
    required_error: "Please select task type",
  }),
  url: z.string().url("Please enter a valid URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"], {
    required_error: "Please select request method",
  }),
  schedule_type: z.string().min(1, "Please select execution frequency"),
  custom_cron: z.string().optional(),
  headers: z.array(z.object({
    key: z.string().min(1, "Header key is required"),
    value: z.string().min(1, "Header value is required"),
  })).optional(),
  body: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSubmit: (values: TaskFormData) => void;
  onCancel: () => void;
  initialValues?: Task | null;
}

export default function TaskForm({ onSubmit, onCancel, initialValues }: TaskFormProps) {
  const [scheduleType, setScheduleType] = useState('hourly');
  const [showCustomCron, setShowCustomCron] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      task_type: "business",
      url: "",
      method: "GET",
      schedule_type: "hourly",
      custom_cron: "",
      headers: [],
      body: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "headers",
  });

  // Sync scheduleType state when initialValues change
  useEffect(() => {
    if (initialValues) {
      const matchedSchedule = cronSchedules.find(s => s.expression === initialValues.cron_expression);
      const scheduleValue = matchedSchedule?.value || 'custom';
      setScheduleType(scheduleValue);
      setShowCustomCron(scheduleValue === 'custom');
      
      // Convert headers from Record to Array
      const headersArray = Object.entries(initialValues.headers || {}).map(([key, value]) => ({ key, value }));
      
      // Set form values
      form.reset({
        name: initialValues.name,
        task_type: initialValues.task_type as "business" | "keep_alive",
        url: initialValues.url,
        method: initialValues.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        schedule_type: scheduleValue,
        custom_cron: scheduleValue === 'custom' ? initialValues.cron_expression : "",
        headers: headersArray,
        body: initialValues.body || "",
      });
    } else {
      setScheduleType('hourly');
      setShowCustomCron(false);
      form.reset();
    }
  }, [initialValues, form]);

  const handleScheduleTypeChange = (value: string) => {
    setScheduleType(value);
    setShowCustomCron(value === 'custom');
    form.setValue('schedule_type', value);
    
    if (value !== 'custom') {
      const selectedSchedule = cronSchedules.find(s => s.value === value);
      if (selectedSchedule) {
        form.setValue('custom_cron', selectedSchedule.expression);
      }
    }
  };

  const handleSubmit = (values: TaskFormValues) => {
    const cronExpression = values.schedule_type === 'custom' 
      ? values.custom_cron 
      : cronSchedules.find(s => s.value === values.schedule_type)?.expression;

    const formData: TaskFormData = {
      name: values.name,
      task_type: values.task_type,
      url: values.url,
      method: values.method,
      schedule_type: values.schedule_type,
      custom_cron: values.custom_cron,
      headers: values.headers || [],
      body: values.body || '',
    };

    onSubmit(formData);
  };

  return (
    <div className="w-full max-h-[calc(90vh-120px)] overflow-y-auto overflow-x-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-muted rounded-full px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Task Configuration</span>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <Card className="w-full border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-foreground">
                <div className="p-2 bg-muted rounded-lg mr-3">
                  <Settings className="h-4 w-4 text-foreground" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full space-y-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
            name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="flex items-center font-semibold text-muted-foreground">
                        <FileText className="h-4 w-4 mr-2" />
                        Task Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter a descriptive task name" 
                          {...field} 
                          className="w-full h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
            name="task_type"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="flex items-center font-semibold text-muted-foreground">
                        <Target className="h-4 w-4 mr-2" />
                        Task Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Select task type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="business">
                            <div className="flex items-center">
                              <Target className="h-4 w-4 mr-2 text-blue-600" />
                              Business Task
                            </div>
                          </SelectItem>
                          <SelectItem value="keep_alive">
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-green-600" />
                              Keep Alive
                            </div>
                          </SelectItem>
                        </SelectContent>
            </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Request Configuration */}
          <Card className="w-full border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-foreground">
                <div className="p-2 bg-muted rounded-lg mr-3">
                  <Globe className="h-4 w-4 text-foreground" />
                </div>
                Request Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full space-y-4">
              <FormField
                control={form.control}
            name="url"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="flex items-center font-semibold text-muted-foreground">
                      <Link className="h-4 w-4 mr-2" />
                      Request URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/api/endpoint" 
                        {...field} 
                        className="w-full h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
            name="method"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="flex items-center font-semibold text-muted-foreground">
                      <Hash className="h-4 w-4 mr-2" />
                      Request Method
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GET">
                          <span className="font-mono font-semibold">GET</span>
                        </SelectItem>
                        <SelectItem value="POST">
                          <span className="font-mono font-semibold">POST</span>
                        </SelectItem>
                        <SelectItem value="PUT">
                          <span className="font-mono font-semibold">PUT</span>
                        </SelectItem>
                        <SelectItem value="DELETE">
                          <span className="font-mono font-semibold">DELETE</span>
                        </SelectItem>
                        <SelectItem value="PATCH">
                          <span className="font-mono font-semibold">PATCH</span>
                        </SelectItem>
                      </SelectContent>
            </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Execution Schedule */}
          <Card className="w-full border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-foreground">
                <div className="p-2 bg-muted rounded-lg mr-3">
                  <Calendar className="h-4 w-4 text-foreground" />
                </div>
                Execution Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full space-y-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
            name="schedule_type"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="flex items-center font-semibold text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Execution Frequency
                      </FormLabel>
                      <Select onValueChange={handleScheduleTypeChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
              {cronSchedules.map(schedule => (
                            <SelectItem key={schedule.value} value={schedule.value}>
                              <div className="flex items-center">
                                <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="truncate">{schedule.label}</span>
                              </div>
                            </SelectItem>
              ))}
                        </SelectContent>
            </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
        {showCustomCron && (
                  <FormField
                    control={form.control}
              name="custom_cron"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="flex items-center font-semibold text-muted-foreground">
                          <Code className="h-4 w-4 mr-2" />
                          Custom Cron Expression
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="* * * * *" 
                            {...field} 
                            className="w-full h-11 font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="w-full flex items-start space-x-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="break-words">
                            Need help? Visit{' '}
                            <a 
                              href="https://crontab.guru" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:underline font-medium text-primary"
                            >
                              crontab.guru
                            </a>
                            {' '}for cron expression help
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
        )}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Configuration */}
          <Card className="w-full border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-foreground">
                <div className="p-2 bg-muted rounded-lg mr-3">
                  <Code className="h-4 w-4 text-foreground" />
                </div>
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full space-y-6">
              {/* Custom Headers */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center text-base font-semibold text-muted-foreground">
                    <Hash className="h-4 w-4 mr-2" />
                    Custom Headers
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ key: '', value: '' })}
                    className="shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Header
                  </Button>
                </div>
                
                {fields.length > 0 && (
                  <div className="w-full space-y-3 bg-card rounded-lg p-4 border max-h-64 overflow-y-auto">
                    {fields.map((field, index) => (
                      <div key={field.id} className="w-full flex gap-2 items-end">
                        <div className="flex-1 min-w-0">
                          <FormField
                            control={form.control}
                            name={`headers.${index}.key`}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input 
                                    placeholder="Header name" 
                                    {...field} 
                                    className="w-full h-10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <FormField
                            control={form.control}
                            name={`headers.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input 
                                    placeholder="Header value" 
                                    {...field} 
                                    className="w-full h-10"
                    />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 flex-shrink-0"
                        >
                          <Minus className="h-4 w-4" />
                </Button>
                      </div>
                    ))}
                  </div>
          )}

                {fields.length === 0 && (
                  <div className="w-full text-center py-6 text-muted-foreground bg-card rounded-lg border-2 border-dashed">
                    <Hash className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">No custom headers configured</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add Header" to add HTTP headers</p>
                  </div>
                )}
              </div>

              {/* Request Body */}
              <div className="w-full space-y-4">
                <FormField
                  control={form.control}
        name="body"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="flex items-center text-base font-semibold text-muted-foreground">
                        <FileText className="h-4 w-4 mr-2" />
                        Request Body
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter JSON data or leave blank for GET requests" 
                          rows={8}
                          {...field} 
                          className="w-full font-mono text-sm resize-none"
        />
                      </FormControl>
                      <FormMessage />
                      <div className="w-full flex items-start space-x-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="break-words">For POST/PUT/PATCH requests. Use valid JSON format.</span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="w-full sticky bottom-0 bg-background border-t px-6 py-4 -mx-6 -mb-6">
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                size="lg"
                className="px-8"
              >
                Cancel
          </Button>
              <Button 
                type="submit" 
                size="lg" 
                className="px-8"
              >
                <Play className="h-4 w-4 mr-2" />
                {initialValues ? 'Update Task' : 'Create Task'}
          </Button>
            </div>
          </div>
        </form>
    </Form>
    </div>
  );
} 
