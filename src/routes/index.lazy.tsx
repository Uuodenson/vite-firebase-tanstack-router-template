import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, Moon, Search } from "lucide-react";
export const Route = createLazyFileRoute("/")({
  component: Index,
});
function Index() {
  return (
    <div className="p-2 flex flex-col items-center">
      <h3>Welcome Home!</h3>
      <div className="grid grid-cols- md:grid-cols-2 gap-6 mt-4 w-3/4">
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
        <Link to={"/emergency"}>
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
        <Link to={"/journal"}>
          <Card className="transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Search></Search> Journal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Write down your thoughts and experiences.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={"/book"}>
          <Card className="transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <BookOpen></BookOpen> Book
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Read yourself into the topic of OCD</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
