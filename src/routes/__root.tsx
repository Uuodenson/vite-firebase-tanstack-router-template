import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { signOut } from "../helpers/auth";
import { useAuthContext } from "../helpers/authContext";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {Settings, Home, BookMarked, LogIn, LogOut} from "lucide-react";

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
    <>
      <div className="p-4 flex gap-2 text-lg items-center">
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          <Home></Home>
        </Link>{" "}
        <Link
          to={"/about"}
          activeProps={{
            className: "font-bold",
          }}
        >
          <BookMarked></BookMarked>
        </Link>
        <Link to={"/profile"} activeProps={{ className: "font-bold" }}>
          <Settings></Settings>
        </Link>
        {user ? (
          <Button
            onClick={() => {
              signOut();
            }}
          >
            <LogOut></LogOut>
          </Button>
        ) : (
          <Link
            to={"/signin"}
            activeProps={{
              className: "font-bold",
            }}
          >
            <LogIn></LogIn>
          </Link>
        )}
      </div>
      <hr />
      <Outlet />
      <Toaster richColors />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
