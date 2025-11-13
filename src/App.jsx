import React, { useState, useMemo, useEffect } from 'react';
import { AsciiNoiseEffect } from './AsciiNoiseEffect';
import WriteupViewer from './WriteupViewer';

const App = () => {
  const [activeTab, setActiveTab] = useState('ctf');
  const [selectedWriteup, setSelectedWriteup] = useState(null);
  const [expandedPlatform, setExpandedPlatform] = useState(null);
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const [showCarEasterEgg, setShowCarEasterEgg] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const handleCarClick = () => {
    setShowCarEasterEgg(true);
    setActiveTab('garage');
  };

  // Fetch GitHub repos
  useEffect(() => {
    if (activeTab === 'projects' && githubRepos.length === 0) {
      setLoadingRepos(true);
      fetch('https://api.github.com/users/forrof/repos?sort=updated&per_page=10')
        .then(res => res.json())
        .then(data => {
          setGithubRepos(data);
          setLoadingRepos(false);
        })
        .catch(err => {
          console.error('Error fetching repos:', err);
          setLoadingRepos(false);
        });
    }
  }, [activeTab, githubRepos.length]);

  // Sample CTF data - replace with your actual data
  const ctfChallenges = [
    {
      id: 1,
      title: "SQL Injection in Login Portal",
      platform: "HackTheBox",
      difficulty: "Medium",
      category: "Web",
      description: "Exploited SQL injection vulnerability to bypass authentication",
      writeupPath: "/writeups/sql-injection-login.md",
      date: "Nov 2024"
    },
    {
      id: 2,
      title: "Buffer Overflow Exploitation",
      platform: "TryHackMe",
      difficulty: "Hard",
      category: "Binary",
      description: "Stack-based buffer overflow leading to RCE",
      writeupPath: "/writeups/buffer-overflow.md",
      date: "Oct 2024"
    },
    {
      id: 3,
      title: "Crypto Challenge - RSA",
      platform: "PicoCTF",
      difficulty: "Easy",
      category: "Crypto",
      description: "Weak RSA key factorization",
      writeupPath: "#",
      date: "Sep 2024"
    },
    {
      id: 4,
      title: "XSS to Account Takeover",
      platform: "HackTheBox",
      difficulty: "Medium",
      category: "Web",
      description: "Stored XSS leading to admin cookie theft",
      writeupPath: "#",
      date: "Aug 2024"
    }
  ];

  // Group challenges by platform
  const challengesByPlatform = useMemo(() => {
    const grouped = {};
    ctfChallenges.forEach(challenge => {
      if (!grouped[challenge.platform]) {
        grouped[challenge.platform] = [];
      }
      grouped[challenge.platform].push(challenge);
    });
    return grouped;
  }, [ctfChallenges]);

  // Calculate statistics
  const stats = useMemo(() => {
    const categories = {};
    const platforms = {};
    
    ctfChallenges.forEach(challenge => {
      categories[challenge.category] = (categories[challenge.category] || 0) + 1;
      platforms[challenge.platform] = (platforms[challenge.platform] || 0) + 1;
    });

    return { categories, platforms };
  }, [ctfChallenges]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-900 bg-opacity-40 text-green-300 border border-green-700';
      case 'medium': return 'bg-yellow-900 bg-opacity-40 text-yellow-300 border border-yellow-700';
      case 'hard': return 'bg-red-900 bg-opacity-40 text-red-300 border border-red-700';
      default: return 'bg-gray-700 text-gray-200';
    }
  };

  const togglePlatform = (platform) => {
    setExpandedPlatform(expandedPlatform === platform ? null : platform);
    setExpandedChallenge(null); // Close any open challenge when switching platforms
  };

  const toggleChallenge = (id) => {
    setExpandedChallenge(expandedChallenge === id ? null : id);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <AsciiNoiseEffect
          noiseStrength={0.38}
          noiseScale={0.0005}
          speed={0.24}
          cell={7}
          bw={false}
          charset={2}
          tint={[0.3, 0.6282064862054916, 0.5406094271122793]}
          distortAmp={1.47}
          frequency={6.62}
          zRate={0.039}
          brightness={1.54}
          contrast={0.61}
          seed1={0.0894173933569975}
          seed2={4.20042963445157}
          hue={35.2}
          sat={1.46}
          gamma={1.3}
          vignette={0.19}
          vignetteSoftness={0.41}
          glyphSharpness={0.139}
          bg={[0.02936394817380732, 0.06404606269956087, 0.059432583347921675]}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="pt-8 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="inline-block bg-black bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg mb-6">
              <h1 className="text-3xl font-bold text-white text-center tracking-wider">forrof's</h1>
            </div>
            <nav className="flex justify-center space-x-2">
              <button
                onClick={() => setActiveTab('ctf')}
                className={`px-6 py-2 text-sm font-bold transition-all rounded-lg ${
                  activeTab === 'ctf'
                    ? 'bg-white text-black'
                    : 'bg-gray-800 bg-opacity-50 text-gray-300 hover:bg-gray-700 hover:bg-opacity-70 backdrop-blur-sm'
                }`}
              >
                CTF Writeups
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-6 py-2 text-sm font-bold transition-all rounded-lg ${
                  activeTab === 'projects'
                    ? 'bg-white text-black'
                    : 'bg-gray-800 bg-opacity-50 text-gray-300 hover:bg-gray-700 hover:bg-opacity-70 backdrop-blur-sm'
                }`}
              >
                Projects
              </button>
              {showCarEasterEgg && (
                <button
                  onClick={() => setActiveTab('garage')}
                  className={`px-6 py-2 text-sm font-bold transition-all rounded-lg animate-slideUp ${
                    activeTab === 'garage'
                      ? 'bg-white text-black'
                      : 'bg-gray-800 bg-opacity-50 text-gray-300 hover:bg-gray-700 hover:bg-opacity-70 backdrop-blur-sm'
                  }`}
                >
                  🏎️ Garage
                </button>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'ctf' ? (
            <div>
              {/* Statistics */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* By Category */}
                <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-gray-700 border-opacity-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-white mb-4">▸ By Category</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.categories).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-300 font-bold">{category}</span>
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-800 bg-opacity-50 h-6 rounded-full overflow-hidden" style={{ width: '100px' }}>
                            <div 
                              className="bg-cyan-600 h-full transition-all duration-500" 
                              style={{ width: `${(count / ctfChallenges.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-bold text-sm w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Platform */}
                <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-gray-700 border-opacity-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-white mb-4">▸ By Platform</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.platforms).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-gray-300 font-bold">{platform}</span>
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-800 bg-opacity-50 h-6 rounded-full overflow-hidden" style={{ width: '100px' }}>
                            <div 
                              className="bg-cyan-600 h-full transition-all duration-500" 
                              style={{ width: `${(count / ctfChallenges.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-bold text-sm w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Challenges List - Grouped by Platform */}
              <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-gray-700 border-opacity-50 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700 border-opacity-50">
                  <h2 className="text-xl font-bold text-white">▾ CTF Challenges</h2>
                </div>
                <div className="divide-y divide-gray-700 divide-opacity-50">
                  {Object.entries(challengesByPlatform).map(([platform, challenges]) => (
                    <div key={platform} className="bg-black bg-opacity-20">
                      {/* Platform Header */}
                      <div 
                        className="px-6 py-4 cursor-pointer hover:bg-gray-800 hover:bg-opacity-30 transition-colors flex items-center justify-between"
                        onClick={() => togglePlatform(platform)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 font-bold text-lg">
                            {expandedPlatform === platform ? '▾' : '▸'}
                          </span>
                          <h3 className="text-white font-bold text-lg">{platform}</h3>
                          <span className="text-gray-400 text-sm font-bold">
                            ({challenges.length})
                          </span>
                        </div>
                      </div>

                      {/* Platform Challenges (Expanded) */}
                      {expandedPlatform === platform && (
                        <div className="bg-gray-900 bg-opacity-20 animate-slideDown">
                          {challenges.map((challenge) => (
                            <div key={challenge.id} className="border-t border-gray-700 border-opacity-30">
                              {/* Challenge Header */}
                              <div 
                                className="px-6 py-3 pl-12 cursor-pointer hover:bg-gray-800 hover:bg-opacity-30 transition-colors flex items-center justify-between"
                                onClick={() => toggleChallenge(challenge.id)}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-gray-500 font-bold">
                                    {expandedChallenge === challenge.id ? '▾' : '▸'}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-white font-bold">{challenge.title}</span>
                                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                                        {challenge.difficulty}
                                      </span>
                                      <span className="px-2 py-0.5 text-xs font-bold bg-gray-700 bg-opacity-50 text-gray-200 border border-gray-600 rounded-full">
                                        {challenge.category}
                                      </span>
                                      <span className="text-gray-500 text-xs font-bold">{challenge.date}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Challenge Details (Expanded) */}
                              {expandedChallenge === challenge.id && (
                                <div className="px-6 py-3 pl-16 bg-gray-900 bg-opacity-30 border-t border-gray-700 border-opacity-20 animate-slideDown">
                                  <p className="text-gray-300 font-bold mb-3 text-sm">{challenge.description}</p>
                                  {challenge.writeupPath && challenge.writeupPath !== "#" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedWriteup(challenge.writeupPath);
                                      }}
                                      className="bg-gray-800 bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all font-bold text-sm"
                                    >
                                      Read Writeup →
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'garage' ? (
            <div>
              {/* Garage/Car Section */}
              <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-gray-700 border-opacity-50 rounded-xl overflow-hidden p-8">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">🏎️ The Garage</h2>
                
                {/* Car Post Template */}
                <div className="max-w-3xl mx-auto space-y-8">
                  
                  {/* Post 1 - Template */}
                  <div className="bg-gray-900 bg-opacity-50 border border-gray-700 rounded-xl p-6">
                    {/* Photo Frame */}
                    <div className="bg-black bg-opacity-60 border-4 border-gray-600 rounded-lg p-2 mb-4">
                      <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
                        <span className="text-gray-500 font-bold text-xl">Photo coming soon...</span>
                        {/* Replace with: <img src="/garage/car1.jpg" alt="Car" className="w-full h-full object-cover rounded" /> */}
                      </div>
                    </div>
                    
                    {/* Post Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-white">First Post Title</h3>
                      <p className="text-gray-300 font-bold">
                        Your text about the car goes here. Share your thoughts, modifications, or adventures!
                      </p>
                      
                      {/* Location Tag */}
                      <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold pt-2">
                        <span>📍</span>
                        <span>Location Name</span>
                      </div>
                      
                      {/* Date */}
                      <div className="text-gray-500 text-xs font-bold">
                        Posted: November 2024
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gray-900 bg-opacity-30 border border-gray-700 border-opacity-50 rounded-xl p-6 text-center">
                    <p className="text-gray-400 font-bold text-sm mb-2">
                      To add photos:
                    </p>
                    <ol className="text-gray-500 text-xs font-bold space-y-1 text-left max-w-md mx-auto">
                      <li>1. Put photos in <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">public/garage/</code></li>
                      <li>2. Update this section in <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">App.jsx</code></li>
                      <li>3. Replace the placeholder div with an img tag</li>
                    </ol>
                    <p className="text-xs text-gray-600 mt-4">
                      Easter egg unlocked! 🎉
                    </p>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Projects List */}
              <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-gray-700 border-opacity-50 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700 border-opacity-50">
                  <h2 className="text-xl font-bold text-white">▾ Projects</h2>
                </div>
                <div className="divide-y divide-gray-700 divide-opacity-50">
                  {loadingRepos ? (
                    <div className="px-6 py-8 text-center text-gray-400 font-bold">
                      Loading repositories...
                    </div>
                  ) : githubRepos.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-400 font-bold">
                      No repositories found
                    </div>
                  ) : (
                    githubRepos.map((repo) => (
                      <div key={repo.id} className="px-6 py-4 hover:bg-gray-800 hover:bg-opacity-30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-bold text-lg">{repo.name}</h3>
                          {repo.stargazers_count > 0 && (
                            <span className="text-yellow-400 text-sm font-bold">⭐ {repo.stargazers_count}</span>
                          )}
                        </div>
                        <p className="text-gray-300 font-bold mb-3 text-sm">
                          {repo.description || 'No description provided'}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3 items-center">
                          {repo.language && (
                            <span className="px-3 py-1 text-xs font-bold bg-gray-800 bg-opacity-50 text-gray-300 border border-gray-600 rounded-full">
                              {repo.language}
                            </span>
                          )}
                          <span className="text-gray-500 text-xs font-bold">
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold text-sm"
                        >
                          View on GitHub →
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-black bg-opacity-30 backdrop-blur-md border-t border-gray-700 border-opacity-50 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-2 sm:mb-0 font-bold">
                © 2025 forrof. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/forrof"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm font-bold"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Writeup Modal */}
      {selectedWriteup && (
        <WriteupViewer 
          writeupPath={selectedWriteup} 
          onClose={() => setSelectedWriteup(null)} 
        />
      )}

      {/* Car Easter Egg - Only show if not already discovered */}
      {!showCarEasterEgg && <CarEasterEgg onClick={handleCarClick} />}
    </div>
  );
};

// Car Easter Egg Component
const CarEasterEgg = ({ onClick }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Random position on screen
    const randomPosition = () => {
      const x = Math.random() * (window.innerWidth - 100);
      const y = Math.random() * (window.innerHeight - 100);
      setPosition({ x, y });
      setVisible(true);

      // Hide after 5 seconds if not clicked
      setTimeout(() => setVisible(false), 5000);
    };

    // Show car randomly every 15-30 seconds
    const showInterval = setInterval(() => {
      randomPosition();
    }, Math.random() * 15000 + 15000);

    // Show first time after 10 seconds
    const firstShow = setTimeout(randomPosition, 10000);

    return () => {
      clearInterval(showInterval);
      clearTimeout(firstShow);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 cursor-pointer animate-bounce"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: 'opacity 0.5s'
      }}
      onClick={onClick}
      title="Click me! 🤫"
    >
      <span className="text-2xl hover:scale-110 transition-transform">
        🚗
      </span>
    </div>
  );
};

export default App;