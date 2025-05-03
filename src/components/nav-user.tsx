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
  User as UserIcon, // Rename User icon to avoid conflict
  Loader2, // Import Loader icon
} from "lucide-react"
import { useRouter } from "next/navigation"

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

// Remove the user prop from the component definition
export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()

  // State for user data, loading, and error
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Send cookies
        });
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated or token expired
            console.log("User not authenticated, redirecting to login.");
            router.push('/sign');
            return; // Stop further execution
          }
          // Handle other non-OK responses
          const errorData = await response.json().catch(() => ({})); // Try to parse error JSON
          throw new Error(`Failed to fetch user: ${response.status} ${response.statusText} - ${errorData.message || 'No error details'}`);
        }
        
        const data = await response.json();
        
        // **Validate the received data structure**
        if (data && data.user && typeof data.user === 'object') {
          setUser(data.user); // Set user state only if data.user is a valid object
        } else {
          // If data.user is missing or not an object, treat it as an error
          console.error("Invalid user data structure received from API:", data);
          throw new Error('Invalid user data received from server.');
        }

      } catch (err) {
        console.error("Error fetching user data:", err);
        // Set the error state for display or further handling
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching user data.');
        // Optionally redirect to login on specific errors, but avoid redirecting for all errors
        // if (err.message.includes('401')) { // Example: redirect only on auth errors caught here
        //   router.push('/sign');
        // }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]); // Add router to dependency array

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: 'include' // Include credentials for logout too
      })
      if (response.ok) {
        setUser(null); // Clear user state
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

  // If still loading or user is null AFTER loading and NO error, something is wrong
  // This condition should ideally not be met if fetchUser logic is correct
  if (!isLoading && !user) {
      console.warn("User data is null after loading without specific error. Check API response or fetch logic.");
      // Maybe redirect to login as a fallback?
      // router.push('/sign'); 
      return null; // Or a fallback UI indicating login state issue
  }

  // Render user info only if loading is complete AND user is not null
  if (!isLoading && user) {
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
}
