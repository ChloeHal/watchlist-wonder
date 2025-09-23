import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  toWatchCount: number;
  watchedCount: number;
  toWatchMovies: any[];
  onRefresh: () => void;
}

export default function Dashboard({ toWatchCount, watchedCount, toWatchMovies, onRefresh }: DashboardProps) {
  const { toast } = useToast();


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#c44900]/15 border-[#c44900]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Films à Regarder</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toWatchCount}</div>
            <p className="text-xs text-muted-foreground">dans votre liste</p>
          </CardContent>
        </Card>

        <Card className="bg-[#c44900]/15 border-[#c44900]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Films Vus</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchedCount}</div>
            <p className="text-xs text-muted-foreground">terminés</p>
          </CardContent>
        </Card>

        <Card className="bg-[#c44900]/15 border-[#c44900]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toWatchCount + watchedCount}</div>
            <p className="text-xs text-muted-foreground">films au total</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={onRefresh} 
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-background hover:text-foreground border-2 border-primary hover:border-primary transition-colors"
        >
          Actualiser
        </Button>
      </div>
    </div>
  );
}