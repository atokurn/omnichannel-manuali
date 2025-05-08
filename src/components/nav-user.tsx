"use client"

import {
  useState,
  useEffect
} from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User as UserIcon,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Define a type for the user data we expect from the API
interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null; // Assuming avatar is a URL or null
  // Add other fields if needed, like roles, tenantName etc.
}

// Fetcher function for React Query
const fetchUserData = async (): Promise<UserData> => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include', // Send cookies
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Not authenticated or token expired
      throw new Error('Unauthorized');
    }
    // Handle other non-OK responses
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch user: ${response.status} ${response.statusText} - ${errorData.message || 'No error details'}`);
  }
  
  const data = await response.json();
  
  // Validate the received data structure
  if (data && data.user && typeof data.user === 'object') {
    return data.user;
  } else {
    // If data.user is missing or not an object, treat it as an error
    console.error("Invalid user data structure received from API:", data);
    throw new Error('Invalid user data received from server.');
  }
};

// Remove the user prop from the component definition
export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()

  // Use React Query to fetch and cache user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['userData'],
    queryFn: fetchUserData,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 unauthorized errors
      if (error instanceof Error && error.message === 'Unauthorized') {
        router.push('/sign');
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
      if (error instanceof Error && error.message === 'Unauthorized') {
        router.push('/sign');
      }
    }
  });

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: 'include' // Include credentials for logout too
      })
      if (response.ok) {
        // Invalidate and refetch queries after logout
        // This would be done with queryClient.invalidateQueries(['userData']) if we had access to queryClient here
        // For now, just redirect to sign page
        router.push("/sign")
        router.refresh()
      } else {
        console.error("Logout failed:", response.statusText)
        // Show error message to user
      }
    } catch (error) {
      console.error("Error during logout:", error)
      // Show error message to user
    }
  }

  // Handle loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <Avatar className="h-8 w-8 rounded-lg bg-muted">
              <AvatarFallback className="rounded-lg"><UserIcon className="size-4 text-muted-foreground" /></AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="h-4 w-20 rounded bg-muted"></span>
              <span className="mt-1 h-3 w-28 rounded bg-muted"></span>
            </div>
            <Loader2 className="ml-auto size-4 animate-spin text-muted-foreground" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Handle error state (optional: show an error message or fallback)
  if (error) { // Check specifically for the error state being set
    console.error("Rendering error state:", error);
    // Display an error message or a fallback UI. For now, just log and return null.
    // You could render a simple error indicator here.
    // Example: return <div>Error loading user: {error}</div>;
    return null; // Or a fallback UI
  }

  // Render user info only if loading is complete AND user is not null
  if (user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* Use fetched user avatar */}
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {/* Generate fallback from user name */}
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {/* Use fetched user name and email */}
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/settings/account")}>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }
  
  // Fallback if no user data
  return null;
}
