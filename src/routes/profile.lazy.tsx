import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Dispatch, JSX, useState, FormEvent, ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/profile")({
  component: Index,
});

interface ProfileData {
  name: string;
  age: number;
  email: string;
  ProfilePic: number;
}

function Index(): JSX.Element {
  const initialData: ProfileData = {
    name: "example",
    age: 0,
    email: "example",
    ProfilePic: 0,
  };
  const [profileData, setProfileData]: [ProfileData, Dispatch<ProfileData>] = useState(initialData);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    save
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, name: event.target.value });
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, email: event.target.value });
  };

  return (
    <div>
        <Card className="w-1/2 flex m-auto p-2">
          <CardTitle className="flex flex-row items-center justify-evenly">
            <p>Dein Profil</p>
          </CardTitle>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Label>Name</Label>
              <Input value={profileData.name} onChange={handleNameChange} />
              <Label>E-Mail</Label>
              <Input value={profileData.email} onChange={handleEmailChange} />
              <Button type="submit">Speichern</Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
