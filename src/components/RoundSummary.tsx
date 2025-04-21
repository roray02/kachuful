
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlayerResult {
  playerId: string;
  name: string;
  bid: number;
  tricks: number;
  roundScore: number;
  totalScore: number;
}

interface RoundSummaryProps {
  open: boolean;
  onClose: () => void;
  round: number;
  playerResults: PlayerResult[];
  nextDealerName: string;
}

const RoundSummary: React.FC<RoundSummaryProps> = ({
  open,
  onClose,
  round,
  playerResults,
  nextDealerName
}) => {
  // Sort players by total score (descending)
  const sortedResults = [...playerResults].sort((a, b) => b.totalScore - a.totalScore);
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-indigo-900 text-white border-indigo-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-yellow-400 text-center">
            Round {round} Summary
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-indigo-700">
                  <th className="py-2 text-left">Player</th>
                  <th className="py-2 text-center">Bid</th>
                  <th className="py-2 text-center">Tricks</th>
                  <th className="py-2 text-center">Round</th>
                  <th className="py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result) => (
                  <tr 
                    key={result.playerId} 
                    className="border-b border-indigo-800 hover:bg-indigo-800"
                  >
                    <td className="py-2">{result.name}</td>
                    <td className="py-2 text-center">{result.bid}</td>
                    <td className="py-2 text-center">{result.tricks}</td>
                    <td className="py-2 text-center">
                      {result.roundScore > 0 ? (
                        <span className="text-green-400">+{result.roundScore}</span>
                      ) : (
                        <span className="text-red-400">0</span>
                      )}
                    </td>
                    <td className="py-2 text-center font-bold">{result.totalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 text-center text-yellow-300">
          {nextDealerName} will be the dealer for the next round.
        </div>
        
        <DialogFooter className="mt-6">
          <Button 
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue to Next Round
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoundSummary;
