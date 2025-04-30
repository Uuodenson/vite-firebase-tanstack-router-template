import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { TextIcon, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const Route = createLazyFileRoute("/emergency")({
  component: EmergencyPage,
});

function EmergencyPage() {
  




  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-red-500 text-white z-50 fixed top-0 left-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Emergency</h1>
        <p className="text-lg mb-8">Are you in immediate danger?</p>
        <Button className="bg-white text-red-500 hover:bg-gray-100">
          <a href="tel:+0800 / 655 3000">Call Emergency</a>
        </Button>
        <div className="absolute top-4 left-4">
        <Button className="bg-white text-red-500 hover:bg-gray-100" asChild>
          <Link to={"/"} className="flex gap-2 items-center">
            <Home></Home>
            Home
          </Link>
        </Button>
        </div>
        <p className="mt-4">
          If you need to talk to someone or need more information, you can use
          the following options:
        </p>
        <div className="mt-4 grid gap-4">
          <Button className="mt-2" variant={"secondary"} asChild>
            <Link to={"/chat"} className="flex gap-2 items-center">
              <TextIcon></TextIcon>
              Chat with Gemini
            </Link>
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Other Emergency Services</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button className="bg-white text-red-500 hover:bg-gray-100 w-full">
                <a href="tel:+08006553000">Krisendienst Bayern</a>
              </Button>
              <Button className="bg-white text-red-500 hover:bg-gray-100 w-full">
                <a href="tel:+08001110111">Telefonseelsorge</a>
              </Button>
              <Button className="bg-white text-red-500 hover:bg-gray-100 w-full">
                <a href="tel:+08001110222">Telefonseelsorge</a>
              </Button>
              <Button className="bg-white text-red-500 hover:bg-gray-100">
                <a href="tel:+116111">Nummer gegen Kummer</a>
              </Button>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}
