export default function ActivePrograms() {
  const programs = [
    {
      id: 1,
      title: 'Algaja jõutreening',
      trainer: 'Mari Maasikas',
      progress: 45,
      nextUnit: 'Nädal 3: Ülakeha'
    },
    {
      id: 2,
      title: 'Jooks maratoniks',
      trainer: 'Jaan Jooksja',
      progress: 20,
      nextUnit: 'Nädal 2: Intervallid'
    }
  ]

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Aktiivsed programmid</h3>
        <a
          href="/programs"
          className="text-sm text-[#60cc56] hover:text-[#40b236] transition-colors"
        >
          Vaata kõiki →
        </a>
      </div>
      
      <div className="space-y-3">
        {programs.map((program) => (
          <div
            key={program.id}
            className="bg-[#2c313a] rounded-lg p-4 hover:bg-[#363c48] transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{program.title}</h4>
                <p className="text-sm text-gray-400">{program.trainer}</p>
              </div>
              <span className="text-sm text-[#60cc56]">{program.progress}%</span>
            </div>
            <div className="bg-[#3e4551] rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-[#40b236] to-[#60cc56] h-full rounded-full"
                style={{ width: `${program.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              Järgmine: {program.nextUnit}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}