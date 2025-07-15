import { Progress } from "@/components/ui/progress";

interface GreenScoreGaugeProps {
  score: number;
  packaging: number;
  localSourcing: number;
  carbonFootprint: number;
}

export const GreenScoreGauge = ({
  score,
  packaging,
  localSourcing,
  carbonFootprint,
}: GreenScoreGaugeProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const getGradientClass = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="text-center space-y-4">
      <div className="relative">
        {/* Circular Progress */}
        <div className="w-32 h-32 mx-auto relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${score}, 100`}
              className={`${getScoreColor(score)} transition-all duration-500`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-xs text-gray-500">/ 100</div>
            </div>
          </div>
        </div>

        {/* Score Label */}
        <div className="mt-4">
          <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Sustainability Rating
          </div>
        </div>

        {/* Progress Bar Alternative */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          <div className="relative">
            <Progress value={score} className="h-3 bg-gray-200" />
            <div
              className={`absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r ${getGradientClass(
                score,
              )} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mt-4 space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Packaging</span>
            <span className="font-medium">{packaging}/100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Local Sourcing</span>
            <span className="font-medium">{localSourcing}/100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Carbon Footprint</span>
            <span className="font-medium">{carbonFootprint}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
