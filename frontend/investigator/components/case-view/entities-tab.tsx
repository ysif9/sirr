// START OF components/case-view/entities-tab.tsx
import { Car, Home, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ICaseInfo } from "@/lib/mock-data";

interface EntitiesTabProps {
  caseData: ICaseInfo;
}

export default function EntitiesTab({ caseData }: EntitiesTabProps) {
  return (
    <Tabs defaultValue="persons">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="persons">Persons</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>
        <Button>+ Add Entity</Button>
      </div>

      <TabsContent value="persons" className="mt-4 space-y-4">
        {caseData.personsInvolved.map((person) => (
          <Card key={person.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" /> {person.name}
              </CardTitle>
              <Badge variant={person.type === "Suspect" ? "destructive" : "secondary"}>
                {person.type}
              </Badge>
            </CardHeader>
            <CardContent>
              {person.age && <p className="text-sm text-muted-foreground">Age: {person.age}</p>}
              <p className="text-sm">{person.description}</p>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="vehicles" className="mt-4 space-y-4">
        {caseData.vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                {vehicle.make} {vehicle.model}
              </CardTitle>
              {vehicle.licensePlate && (
                <CardDescription>License Plate: {vehicle.licensePlate}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm">{vehicle.description}</p>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
      
      <TabsContent value="properties" className="mt-4">
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />No Properties Linked
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Add properties involved in this case, like the crime scene location.</p>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
// END OF components/case-view/entities-tab.tsx