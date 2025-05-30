"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Clock,
  AlertTriangle,
  User,
  Shield,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { AuthManager } from "../lib/auth";
import LoginForm from "./LoginForm";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [wasDisplaced, setWasDisplaced] = useState(false);

  useEffect(() => {
    // Check initial authentication status
    checkAuthStatus();

    // Set timer to check authentication status periodically
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = () => {
    // Check if displaced by another user
    const displaced = AuthManager.isDisplacedByAnotherUser();
    if (displaced && isAuthenticated) {
      setWasDisplaced(true);
    }

    const authenticated = AuthManager.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      setSessionDuration(AuthManager.getSessionDuration());
      setWasDisplaced(false);
    }
  };

  const handleLoginSuccess = () => {
    setWasDisplaced(false);
    checkAuthStatus();
  };

  const handleLogout = () => {
    AuthManager.logout();
    setIsAuthenticated(false);
    setSessionDuration(0);
    setWasDisplaced(false);
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  // Show login form when not authenticated
  if (!isAuthenticated) {
    return (
      <div>
        {wasDisplaced && (
          <div className="m-4">
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-300">
                You have been logged out by another user. The system only allows
                one user to be online at a time. Please log in again.
              </AlertDescription>
            </Alert>
          </div>
        )}
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Show protected content when authenticated, with user info bar at the top
  return (
    <div>
      {/* Top user info bar */}
      <div className="bg-muted/30 border-b px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full dark:bg-green-950">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {AuthManager.getSession()?.username}
                </span>
                <Badge
                  variant="default"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Online: {sessionDuration} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium dark:text-green-400">
                  Session never expires
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Protected content */}
      {children}
    </div>
  );
}
