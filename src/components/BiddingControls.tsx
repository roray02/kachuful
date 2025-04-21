import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BiddingControlsProps {
  maxBid: number;
  totalBidsMade: number;
  totalTricks: number;
  isDealer: boolean;
  onBid: (bid: number) => void;
}

const BiddingControls: React.FC<BiddingControlsProps> = ({
  maxBid,
  totalBidsMade,
  totalTricks,
  isDealer,
  onBid
}) => {
  const [selectedBid, setSelectedBid] = useState<number | null>(null);
  
  const getAvailableBids = () => {
    const bids = [];
    
    const minDealerBid = isDealer && (totalTricks - totalBidsMade) === 0 ? 1 : 0;
    
    for (let i = minDealerBid; i <= maxBid; i++) {
      bids.push(i);
    }
    
    return bids;
  };
  
  const availableBids = getAvailableBids();
  
  const handleBidClick = (bid: number) => {
    setSelectedBid(bid);
  };
  
  const handleSubmitBid = () => {
    if (selectedBid !== null) {
      onBid(selectedBid);
    }
  };
  
  return (
    <motion.div 
      className="bg-indigo-900 p-4 rounded-lg shadow-lg text-white font-fresca"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl font-bold mb-3 text-center">Make Your Bid</h3>
      
      {isDealer && (
        <p className="text-yellow-300 mb-3 text-center text-sm">
          As dealer, your bid cannot make the total bids equal {totalTricks}
        </p>
      )}
      
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {availableBids.map((bid) => (
          <button
            key={bid}
            onClick={() => handleBidClick(bid)}
            className={`w-10 h-10 rounded-full font-bold text-lg ${
              selectedBid === bid
                ? "bg-yellow-500 text-black"
                : "bg-indigo-700 hover:bg-indigo-600"
            }`}
          >
            {bid}
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <Button
          onClick={handleSubmitBid}
          disabled={selectedBid === null}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500"
        >
          Confirm Bid
        </Button>
      </div>
    </motion.div>
  );
};

export default BiddingControls;
