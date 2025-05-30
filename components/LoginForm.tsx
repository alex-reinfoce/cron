'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Lock, 
  Info, 
  Activity, 
  Shield, 
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthManager } from '../lib/auth';
import { LoginCredentials } from '../types';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    
    try {
      const result = AuthManager.login(values);
      
      if (result.success) {
        toast.success(result.message);
        onLoginSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted rounded-full shadow-lg">
              <Activity className="h-8 w-8 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your Cron Task Platform</p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold flex items-center justify-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Authentication Required
            </CardTitle>
            <CardDescription>Please enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-medium">
                        <User className="h-4 w-4 mr-2" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Enter your username"
                            disabled={loading}
                            className="h-11 pl-4 pr-4"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-medium">
                        <Lock className="h-4 w-4 mr-2" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            disabled={loading}
                            className="h-11 pl-4 pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 shadow-lg transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            <Separator className="my-6" />

            <div className="bg-muted p-6 rounded-xl border">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <div className="font-medium text-foreground">Default Login Credentials</div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-card rounded-lg p-3 border">
                      <div className="text-muted-foreground font-medium mb-1">Username</div>
                      <div className="font-mono text-foreground bg-muted px-2 py-1 rounded text-xs">admin</div>
                    </div>
                    <div className="bg-card rounded-lg p-3 border">
                      <div className="text-muted-foreground font-medium mb-1">Password</div>
                      <div className="font-mono text-foreground bg-muted px-2 py-1 rounded text-xs">123456</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-card px-3 py-2 rounded-lg border">
                    <Shield className="h-3 w-3" />
                    <span>Single user mode: Only one user can be online at a time</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Cron Task Platform. Enterprise-level task automation.</p>
        </div>
      </div>
    </div>
  );
} 
 