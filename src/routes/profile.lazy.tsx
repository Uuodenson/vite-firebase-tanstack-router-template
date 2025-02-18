import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/profile")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Profile</h3>
    </div>
  );
}
