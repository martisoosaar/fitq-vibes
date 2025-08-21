interface StatsBoxesProps {
  stats: {
    points: number
    pointsThisMonth: number
    level: number
    currentStrike: number
    bestStrike: number
    trainingsDone: number
    fitnessIndex: number
  }
  loading: boolean
}

export default function StatsBoxes({ stats, loading }: StatsBoxesProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-[#3e4551] rounded-lg h-48"></div>
      </div>
    )
  }

  const bigItems = [
    {
      icon: '🏆',
      title: 'Punktid',
      subtitle: null,
      result: `${stats.pointsThisMonth}/5000`,
      resultColor: 'text-[#60cc56]',
      tooltip: 'Selle kuu punktid'
    },
    {
      icon: '📊',
      title: 'Fitnessindeks',
      subtitle: null,
      result: stats.fitnessIndex,
      resultColor: 'text-[#60cc56]',
      tooltip: null
    },
    {
      icon: '🔥',
      title: 'Praegune seeria',
      subtitle: null,
      result: `${stats.currentStrike} päeva`,
      resultColor: 'text-[#60cc56]',
      tooltip: 'Järjestikused treeningpäevad'
    }
  ]

  const smallItems = [
    { title: 'Pikim seeria', result: stats.bestStrike },
    { title: 'Tase', result: stats.level, tooltip: 'Sinu kogemusetase' },
    { title: 'Kokku punkte', result: stats.points },
    { title: 'Treeninguid tehtud', result: stats.trainingsDone }
  ]

  return (
    <div className="space-y-4">
      {/* Big stat boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bigItems.map((item, index) => (
          <div
            key={index}
            className="bg-[#3e4551] rounded-lg p-8 text-center"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <div className="text-sm text-gray-400 mb-2">
              {item.title}
              {item.tooltip && (
                <span className="ml-2 text-xs text-gray-500" title={item.tooltip}>
                  ⓘ
                </span>
              )}
            </div>
            <div className={`text-3xl font-bold ${item.resultColor}`}>
              {item.result}
            </div>
          </div>
        ))}
      </div>

      {/* Small stat items */}
      <div className="bg-[#3e4551] rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {smallItems.map((item, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="text-sm text-gray-400 mb-2">
                {item.title}
                {item.tooltip && (
                  <span className="ml-1 text-xs" title={item.tooltip}>
                    ⓘ
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-white">
                {item.result}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}