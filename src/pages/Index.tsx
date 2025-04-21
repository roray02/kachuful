
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import HowToPlay from "@/components/HowToPlay";
import AnimatedCardStack from "@/components/AnimatedCardStack";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <img 
            src="/lovable-uploads/72644929-55dc-4ce5-8df4-5a549c546011.png" 
            alt="Kachufool"
            className="max-w-[600px] w-full mx-auto mb-4 text-yellow-400" 
          />
        </div>

        <div className="mb-16">
          <AnimatedCardStack />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to="/join">
            <Button size="lg" className="w-full sm:w-auto text-lg bg-green-600 hover:bg-green-700">
              Play Now
            </Button>
          </Link>
          <Link to="/join">
            <Button size="lg" className="w-full sm:w-auto text-lg bg-blue-600 hover:bg-blue-700">
              Join Game
            </Button>
          </Link>
          <Button
            size="lg"
            className="w-full sm:w-auto text-lg bg-purple-600 hover:bg-purple-700"
            onClick={() => document.getElementById("how-to-play")?.scrollIntoView({ behavior: "smooth" })}
          >
            Learn to Play
          </Button>
        </div>

        <div id="how-to-play">
          <HowToPlay />
        </div>
      </div>
    </div>
  );
};

export default Index;
