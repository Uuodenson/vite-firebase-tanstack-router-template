import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { signOut } from "../helpers/auth";
import { useAuthContext } from "../helpers/authContext";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings, Home, BookMarked, LogIn, LogOut, TextIcon } from "lucide-react";
import { ModeToggle } from "@/components/themeswitcher";

interface MyRouterContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any; //Make this any kind of user type
}
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { user } = useAuthContext();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 flex gap-2 text-lg items-center justify-between flex-wrap md:pl-4 overflow-x-hidden">
        {/* Left side: Logo/Home */}
        <div className="flex items-center">
          <div className="md:block hidden">
            <Link
              to="/"
              className="font-bold transition-all hover:scale-10 hover:text-primary"
            >
              EXposio
            </Link>
          </div>
          <div className="md:hidden block">
            <Link
              to="/"
              className="flex gap-2 items-center transition-all hover:scale-105"
            >
              <Home />
            </Link>
          </div>
        </div>

        {/* Middle: Navigation Links (About, Emotions, Chat) - Responsive */}
        <div className="flex items-center gap-2 md:flex flex-grow justify-center">
          <div className="md:flex hidden gap-2 items-center justify-center">
            <Link
              to={"/about"}
              activeProps={{
                className: "font-bold text-blue-500",
              }}
              className="flex gap-2 items-center transition-all hover:scale-105 hover:text-primary"
            >
              <BookMarked />
            </Link>
            <Link
              to={"/emotions"}
              activeProps={{ className: "font-bold text-blue-500" }}
              className="flex gap-2 items-center transition-all hover:scale-105 hover:text-primary"
            >
              <Settings />
            </Link>
            <Link
              to={"/chat"}
              activeProps={{ className: "font-bold text-blue-500" }}
              className="transition-all hover:scale-105 hover:text-primary"
            >
              <TextIcon />
            </Link>
          </div>
            {/* Mobile view navigation */}
           <div className="md:hidden flex gap-2 items-center justify-center">
            <Link
              to={"/about"}
              activeProps={{
                className: "font-bold text-blue-500",
              }}
              className="flex gap-2 items-center transition-all hover:scale-105 hover:text-primary"
            >
              <BookMarked />
            </Link>
            <Link
              to={"/emotions"}
              activeProps={{ className: "font-bold text-blue-500" }}
              className="flex gap-2 items-center transition-all hover:scale-105 hover:text-primary"
            >
              <Settings />
            </Link>
            <Link to={"/chat"} className="transition-all hover:scale-105 hover:text-primary">
              <TextIcon />
            </Link>
          </div>
        </div>
          

        {/* Right side: Sign In/Sign Out */}
        <div className="flex gap-2 items-center">
          {user !== null ? (
            <Button
              className="flex gap-2 items-center transition-all hover:scale-105 hover:text-primary"
              onClick={() => signOut()}
            >
              <LogOut />
              <p className="text-sm md:block hidden">Sign Out</p>
            </Button>
          ) : (
            <Link
              to={"/signin"}
              className="transition-all hover:scale-105 hover:text-primary"
            >
              <Button className="flex gap-2 items-center">
                <LogIn />
                <p className="text-sm md:block hidden">Sign In</p>
              </Button>
            </Link>
          )}
          <ModeToggle></ModeToggle>
        </div>
      </div>
      <hr />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Toaster richColors />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
