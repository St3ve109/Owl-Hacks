import ScheduleList from '../components/ScheduleList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚾</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Gemline
                </h1>
                <p className="text-gray-600 font-medium">AI-Powered MLB Pick Engine</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                Live Schedule
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <ScheduleList />
      </main>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-md border-t border-gray-200/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <span className="text-2xl">🏆</span>
              <p className="text-gray-700 font-semibold">Powered by Sportradar</p>
            </div>
            <p className="text-gray-500 text-sm">
              Real-time MLB data and statistics for informed betting decisions
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-600">
              <span>Live Updates</span>
              <span>•</span>
              <span>Professional Data</span>
              <span>•</span>
              <span>AI Analysis</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
