
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useGameSocket from "@/hooks/useGameSocket";

const JoinGame = () => {
  const [playerName, setPlayerName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const navigate = useNavigate();

  // Initialize game socket
  const { 
    createLobby, 
    joinLobby, 
    gameState, 
    error, 
    connected,
    isConnecting,
    reconnect,
    lobbyCode: connectedLobbyCode
  } = useGameSocket();

  // When we successfully connect to a lobby, navigate to the game page
  useEffect(() => {
    if (gameState && connectedLobbyCode) {
      navigate(`/game/${connectedLobbyCode}`, { 
        state: { 
          playerName, 
          gameState
        } 
      });
    }
  }, [gameState, connectedLobbyCode, navigate, playerName]);

  // Only show connection error after a delay to avoid flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnectionError(!connected && !isConnecting);
    }, 5000);
    
    // If we connect, clear the timer and don't show error
    if (connected) {
      clearTimeout(timer);
      setShowConnectionError(false);
    }
    
    return () => clearTimeout(timer);
  }, [connected, isConnecting]);

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!connected) {
      toast.error("Connecting to server...");
      reconnect();
      return;
    }

    createLobby({ playerName });
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

    if (!connected) {
      toast.error("Connecting to server...");
      reconnect();
      return;
    }

    joinLobby({ lobbyCode, playerName });
  };

  const handleReconnect = () => {
    toast.info("Attempting to reconnect...");
    reconnect();
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

          {isConnecting && (
            <Alert className="bg-yellow-800 border-yellow-600">
              <AlertDescription className="text-yellow-200">
                Connecting to server... Please wait.
              </AlertDescription>
            </Alert>
          )}
          
          {showConnectionError && (
            <Alert className="bg-red-800 border-red-600">
              <AlertDescription className="text-red-200 flex flex-col gap-2">
                <span>Cannot connect to the game server. The server might be down or experiencing issues.</span>
                <Button 
                  onClick={handleReconnect} 
                  variant="outline" 
                  className="mt-2 border-red-500 text-red-200 hover:bg-red-700"
                >
                  Try Reconnecting
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="bg-red-800 border-red-600">
              <AlertDescription className="text-red-200">
                Error: {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          {isCreating ? (
            <>
              <Button 
                onClick={handleCreateGame} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isConnecting}
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
                disabled={isConnecting}
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
