import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, Moon } from "lucide-react";
export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Link to={"/emotions"}>
          <Card className="transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Moon></Moon> How are you feeling?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Track your mood and emotions.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={"/"}>
          <Card className="transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <HelpCircle></HelpCircle> Emergency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Get help in case of an emergency.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={"/"}>
          <Card className="transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <BookOpen></BookOpen> Journal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Write down your thoughts and experiences.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
