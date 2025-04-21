
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HowToPlay = () => {
  return (
    <div className="space-y-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-yellow-300 mb-8">
        How To Play Kachufool
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-opacity-90 bg-indigo-800 border-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-yellow-300">1. Bidding Phase</CardTitle>
            <CardDescription className="text-indigo-200">Predict your tricks</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Players take turns bidding (clockwise)</li>
              <li>Bid how many tricks you think you'll win</li>
              <li>Dealer bids last</li>
              <li>Last bidder is constrained - total bids can't be lower than total tricks</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-opacity-90 bg-indigo-800 border-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-yellow-300">2. Trick Play</CardTitle>
            <CardDescription className="text-indigo-200">Play your cards wisely</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Follow the lead suit if possible</li>
              <li>Highest card of lead suit wins (unless trump is played)</li>
              <li>Winner of trick leads next</li>
              <li>Cards animate to center when played</li>
              <li>Winning card animates to the winner</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-opacity-90 bg-indigo-800 border-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-yellow-300">3. Scoring</CardTitle>
            <CardDescription className="text-indigo-200">Hit your bid exactly</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Score 10 + bid if you hit your exact bid</li>
              <li>Score 0 if you miss your bid</li>
              <li>See round summary at the end of each round</li>
              <li>Dealer rotates each round</li>
              <li>First bidder is player after dealer</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HowToPlay;
