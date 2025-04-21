import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import HowToPlay from "@/components/HowToPlay";
import AnimatedCardStack from "@/components/AnimatedCardStack";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-western font-bold mb-4 text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] tracking-wider">
            Kachufool
          </h1>
          <p className="text-xl md:text-2xl font-western text-yellow-200 tracking-wide">
            A fun, strategic trick-taking card game!
          </p>
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
