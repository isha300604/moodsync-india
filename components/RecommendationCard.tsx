
import React from 'react';
import { Recommendation } from '../types';

interface Props {
  rec: Recommendation;
  type: 'food' | 'shopping' | 'music' | 'books';
}

const RecommendationCard: React.FC<Props> = ({ rec, type }) => {
  const getIcon = () => {
    switch(type) {
      case 'food': return '🍴';
      case 'shopping': return '👕';
      case 'music': return '🎧';
      case 'books': return '📖';
    }
  };

  const getBadgeColor = () => {
    switch(rec.platform.toLowerCase()) {
      case 'swiggy': return 'bg-orange-100 text-orange-600';
      case 'zomato': return 'bg-red-100 text-red-600';
      case 'myntra': return 'bg-pink-100 text-pink-600';
      case 'nykaa': return 'bg-rose-100 text-rose-600';
      case 'amazon': return 'bg-yellow-100 text-yellow-800';
      case 'spotify': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex gap-4 items-start">
      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-gray-900">{rec.title}</h4>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getBadgeColor()}`}>
            {rec.platform}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed italic">
          "{rec.reason}"
        </p>
        {rec.deliveryTime && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-green-600 flex items-center gap-1">
              ⚡ Expected: {rec.deliveryTime}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
