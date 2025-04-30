import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Dispatch, JSX, useState, FormEvent, ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    console.log(profileData);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, name: event.target.value });
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, email: event.target.value });
  };

  return (
    <div className="p-2">
      <Card>
        <CardTitle>Your Profile</CardTitle>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={profileData.name}
                onChange={handleNameChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={handleEmailChange}
              />
            </div>
            <input type="submit" value="Submit" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
