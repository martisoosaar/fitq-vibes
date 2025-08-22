export default function Challenges() {
  const challenges = [
    {
      id: 1,
      title: 'Jaanuar väljakutse',
      participants: 234,
      daysLeft: 10,
      progress: 65
    },
    {
      id: 2,
      title: 'Tugev selg',
      participants: 156,
      daysLeft: 25,
      progress: 30
    }
  ]

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Aktiivsed väljakutsed</h3>
        <a
          href="/challenges"
          className="text-sm text-[#60cc56] hover:text-[#40b236] transition-colors"
        >
          Vaata kõiki →
        </a>
      </div>
      
      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-[#2c313a] rounded-lg p-4 hover:bg-[#363c48] transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{challenge.title}</h4>
              <span className="text-xs text-gray-400">
                {challenge.daysLeft} päeva jäänud
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <span>👥 {challenge.participants} osalejat</span>
            </div>
            <div className="bg-[#3e4551] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#40b236] to-[#60cc56] h-full rounded-full"
                style={{ width: `${challenge.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}