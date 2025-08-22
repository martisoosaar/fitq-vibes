interface MonthlyChallengeProps {
  title: string
  description: string
  externalLink?: string
  image?: string
  points: number
  maxPoints: number
}

export default function MonthlyChallenge({
  title,
  description,
  externalLink,
  image,
  points,
  maxPoints
}: MonthlyChallengeProps) {
  const percentage = Math.min((points / maxPoints) * 100, 100)

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        {image && (
          <img src={image} alt={title} className="w-16 h-16 rounded-lg object-cover" />
        )}
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span className="text-[#60cc56]">{points}/{maxPoints} punkti</span>
        </div>
        <div className="bg-[#2c313a] rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#40b236] to-[#60cc56] h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {externalLink && (
        <a
          href={externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-[#60cc56] hover:text-[#40b236] transition-colors"
        >
          Vaata väljakutset →
        </a>
      )}
    </div>
  )
}