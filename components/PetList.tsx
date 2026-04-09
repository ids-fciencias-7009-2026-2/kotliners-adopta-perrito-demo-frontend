// components/PetList.tsx
import type { ComponentProps } from "react";
import PetCard from "./PetCard";

const mockPets: ComponentProps<typeof PetCard>["pet"][] = [
  { id: "1", name: "Luna", type: "cat", age: 2, zip: "04510", image: "🐱" },
  { id: "2", name: "Max", type: "dog", age: 3, zip: "01000", image: "🐶" },
];

export default function PetList() {
  return (<div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {mockPets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}