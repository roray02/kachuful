
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

const JoinGame = () => {
  const [playerName, setPlayerName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // In a real app, we would create a game on the server
    // For now, we'll just generate a random code and navigate
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/game/${randomCode}`, { 
      state: { 
        playerName, 
        isHost: true, 
        lobbyCode: randomCode 
      } 
    });
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!lobbyCode.trim()) {
      toast.error("Please enter a lobby code");
      return;
    }

    // In a real app, we would validate the lobby code on the server
    navigate(`/game/${lobbyCode}`, { 
      state: { 
        playerName, 
        isHost: false, 
        lobbyCode 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 flex items-center justify-center p-4 font-fresca">
      <Card className="w-full max-w-md bg-indigo-800 border-indigo-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-yellow-300 text-center">
            {isCreating ? "Create New Game" : "Join Game"}
          </CardTitle>
          <CardDescription className="text-center text-indigo-200">
            {isCreating 
              ? "Create a new Kachufool game and invite friends" 
              : "Enter your name and the lobby code to join"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="playerName" className="text-sm font-medium text-indigo-100">
              Your Name
            </label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="border-indigo-500 bg-indigo-700 text-white placeholder:text-indigo-300"
            />
          </div>

          {!isCreating && (
            <div className="space-y-2">
              <label htmlFor="lobbyCode" className="text-sm font-medium text-indigo-100">
                Lobby Code
              </label>
              <Input
                id="lobbyCode"
                placeholder="Enter lobby code"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                className="border-indigo-500 bg-indigo-700 text-white placeholder:text-indigo-300"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          {isCreating ? (
            <>
              <Button 
                onClick={handleCreateGame} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Create Game
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
                className="w-full border-indigo-500 text-indigo-200 hover:bg-indigo-700"
              >
                Back to Join
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleJoinGame}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Join Game
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(true)}
                className="w-full border-indigo-500 text-indigo-200 hover:bg-indigo-700"
              >
                Create New Game
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinGame;
