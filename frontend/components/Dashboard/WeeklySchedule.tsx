export default function WeeklySchedule() {
  const days = [
    { day: 'E', date: '20', active: false },
    { day: 'T', date: '21', active: true },
    { day: 'K', date: '22', active: false },
    { day: 'N', date: '23', active: false },
    { day: 'R', date: '24', active: false },
    { day: 'L', date: '25', active: false },
    { day: 'P', date: '26', active: false },
  ]

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Nädala plaan</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`text-center p-3 rounded-lg transition-colors ${
              day.active
                ? 'bg-[#40b236] text-white'
                : 'bg-[#2c313a] hover:bg-[#363c48] cursor-pointer'
            }`}
          >
            <div className="text-xs font-medium">{day.day}</div>
            <div className="text-lg font-bold mt-1">{day.date}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-[#2c313a]">
        <p className="text-sm text-gray-400">
          Täna on planeeritud 2 treeningut
        </p>
      </div>
    </div>
  )
}