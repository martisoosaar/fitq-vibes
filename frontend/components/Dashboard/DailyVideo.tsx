export default function DailyVideo() {
  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2">Päeva video</h3>
      <p className="text-sm text-gray-400 mb-4">
        Iga päev uus tasuta treeningvideo!
      </p>
      <div className="aspect-video bg-[#2c313a] rounded-lg mb-4 flex items-center justify-center">
        <span className="text-gray-500">Video laeb...</span>
      </div>
      <a
        href="/free-daily-video"
        className="inline-flex items-center text-sm text-[#60cc56] hover:text-[#40b236] transition-colors"
      >
        Vaata tänast videot →
      </a>
    </div>
  )
}