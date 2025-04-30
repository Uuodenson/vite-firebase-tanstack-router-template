import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, Moon, Search, CircleUserRound } from "lucide-react";
import { useMediaQuery } from "@uidotdev/usehooks";
export const Route = createLazyFileRoute("/")({
  component: Index,
});

function LinkElements(){
  return(
    
      [{link:"/emotions", icon:BookOpen, text:"How are you feeling?"}, {link:"/help", icon:HelpCircle, text:"Help"}, {link:"/search", icon:Search, text:"Search"},
        {link:"/profile", icon:CircleUserRound, text:"Your Profile"}
      ].map((element)=>{
        return <Link to={element.link}>
          <Card className="flex flex-col items-center hover:border-primary hover:r-5">
    
            <CardHeader className="flex flex-row items-center justify-center">
              <element.icon className="w-8 h-8 text-gray-500 hover:text-primary " />
              {
                useMediaQuery("(min-width: 768px)") ? 
                <CardTitle className="ml-2 text-lg font-bold">{element.text}</CardTitle> : <></>
              }
            </CardHeader>
          </Card>
        </Link>
      })
      
  )
}


function StartContent() {
  return (
    <div className="grid grid-cols-2 gap-6 mt-4">
      <LinkElements></LinkElements>
    </div>
  );
}

function Index() {
  return (
    <div className="p-2 flex flex-col items-center">
        <StartContent />
    </div>
  );
}
