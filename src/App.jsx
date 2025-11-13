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
      title: "Free Boost",
      platform: "HackTheBox",
      difficulty: "Medium",
      category: "Forensics",
      description: "Network traffic analysis and PowerShell malware investigation involving Discord token stealer",
      writeupPath: "/writeups/htb-free-boost.md",
      date: "Nov 2024"
    },
    {
      id: 2,
      title: "SQL Injection in Login Portal",
      platform: "HackTheBox",
      difficulty: "Medium",
      category: "Web",
      description: "Exploited SQL injection vulnerability to bypass authentication",
      writeupPath: "/writeups/sql-injection-login.md",
      date: "Nov 2024"
    },
    {
      id: 3,
      title: "Buffer Overflow Exploitation",
      platform: "TryHackMe",
      difficulty: "Hard",
      category: "Binary",
      description: "Stack-based buffer overflow leading to RCE",
      writeupPath: "/writeups/buffer-overflow.md",
      date: "Oct 2024"
    },
    {
      id: 4,
      title: "Crypto Challenge - RSA",
      platform: "PicoCTF",
      difficulty: "Easy",
      category: "Crypto",
      description: "Weak RSA key factorization",
      writeupPath: "#",
      date: "Sep 2024"
    },
    {
      id: 5,
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

      {/* Centered Writeup Modal */}
      {selectedWriteup && selectedWriteup !== '#' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-black bg-opacity-90 border border-gray-700 rounded-xl w-full max-w-3xl max-h-96 overflow-y-auto">
            <div className="p-6">
              <button
                onClick={() => setSelectedWriteup(null)}
                className="mb-4 px-4 py-2 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg text-sm font-bold float-right"
              >
                ✕ Close
              </button>
              <div className="clear-both">
                <WriteupViewer path={selectedWriteup} />
              </div>
            </div>
          </div>
        </div>
      )}

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
        <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${selectedWriteup ? 'md:w-1/2 md:pr-2' : 'max-w-7xl'}`}>
          {activeTab === 'ctf' ? (
            <div>
              {/* Statistics */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* By Category - Bar Chart */}
                <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-gray-700 border-opacity-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-white mb-4">▸ Challenges by Category</h3>
                  <CategoryBarChart challenges={ctfChallenges} />
                </div>

                {/* By Platform - Bar Chart */}
                <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-gray-700 border-opacity-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-white mb-4">▸ Challenges by Platform</h3>
                  <PlatformBarChart challenges={ctfChallenges} />
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
                                className="px-6 py-3 pl-12 cursor-pointer hover:bg-gray-800 hover:bg-opacity-30 transition-colors"
                                onClick={() => {
                                  if (challenge.writeupPath && challenge.writeupPath !== "#") {
                                    setSelectedWriteup(challenge.writeupPath);
                                  } else {
                                    toggleChallenge(challenge.id);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-gray-500 font-bold">
                                    {challenge.writeupPath && challenge.writeupPath !== "#" ? '📄' : '▸'}
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

                              {/* Challenge Details (Expanded) - Only for challenges without writeup */}
                              {expandedChallenge === challenge.id && (!challenge.writeupPath || challenge.writeupPath === "#") && (
                                <div className="px-6 py-3 pl-16 bg-gray-900 bg-opacity-30 border-t border-gray-700 border-opacity-20 animate-slideDown">
                                  <p className="text-gray-300 font-bold mb-3 text-sm">{challenge.description}</p>
                                  <span className="text-gray-500 text-xs font-bold">Writeup coming soon...</span>
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

// Category Timeline Chart Component
const CategoryTimelineChart = ({ challenges }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const categoryColors = {
    'Forensics': '#a855f7', // purple
    'Web': '#eab308',       // yellow
    'Binary': '#ef4444',    // red (pwn)
    'Crypto': '#38bdf8'     // sky blue (reversing)
  };

  // Group by month and category
  const timelineData = useMemo(() => {
    const monthCounts = {};
    
    challenges.forEach(ch => {
      const date = new Date(ch.date + ' 2024');
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthCounts[monthKey]) monthCounts[monthKey] = {};
      if (!monthCounts[monthKey][ch.category]) monthCounts[monthKey][ch.category] = 0;
      monthCounts[monthKey][ch.category]++;
    });

    return monthCounts;
  }, [challenges]);

  const months = Object.keys(timelineData).sort((a, b) => new Date(a) - new Date(b));
  const categories = [...new Set(challenges.map(ch => ch.category))];
  const maxCount = Math.max(...Object.values(timelineData).flatMap(m => Object.values(m)));

  return (
    <div className="relative">
      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox="0 0 400 180">
          {/* Grid */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="40" y1={36 * i} x2="400" y2={36 * i} stroke="rgba(75,85,99,0.2)" strokeWidth="1"/>
          ))}
          
          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <text key={i} x="5" y={180 - (i * 30)} fill="#9ca3af" fontSize="10" fontWeight="bold">{i}</text>
          ))}

          {/* Lines for each category */}
          {categories.map(category => {
            const points = months.map((month, idx) => {
              const count = timelineData[month][category] || 0;
              const x = 40 + (idx / (months.length - 1 || 1)) * 360;
              const y = 180 - ((count / (maxCount || 1)) * 150);
              return { x, y, count, month, category };
            });

            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            return (
              <g key={category}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={categoryColors[category] || '#06b6d4'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((point, idx) => (
                  <circle
                    key={idx}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={categoryColors[category] || '#06b6d4'}
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* X-axis labels */}
          {months.map((month, idx) => {
            const x = 40 + (idx / (months.length - 1 || 1)) * 360;
            return (
              <text key={idx} x={x} y="175" fill="#9ca3af" fontSize="9" textAnchor="middle" fontWeight="bold">
                {month.split(' ')[0]}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute bg-black bg-opacity-90 border border-gray-600 rounded px-3 py-2 text-xs font-bold pointer-events-none"
            style={{ 
              left: `${(hoveredPoint.x / 400) * 100}%`, 
              top: `${(hoveredPoint.y / 180) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="text-white">{hoveredPoint.category}</div>
            <div className="text-gray-400">{hoveredPoint.month}: {hoveredPoint.count} challenges</div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {categories.map(category => (
          <div key={category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[category] || '#06b6d4' }}></div>
            <span className="text-gray-300 font-bold text-xs">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Platform Timeline Chart Component
const PlatformTimelineChart = ({ challenges }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const platformColors = {
    'HackTheBox': '#22c55e',      // green
    'CyberDefenders': '#1e40af',  // dark blue
    'CTF': '#f97316',             // orange
    'TryHackMe': '#8b5cf6',       // purple
    'PicoCTF': '#ec4899'          // pink
  };

  const timelineData = useMemo(() => {
    const monthCounts = {};
    
    challenges.forEach(ch => {
      const date = new Date(ch.date + ' 2024');
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthCounts[monthKey]) monthCounts[monthKey] = {};
      if (!monthCounts[monthKey][ch.platform]) monthCounts[monthKey][ch.platform] = 0;
      monthCounts[monthKey][ch.platform]++;
    });

    return monthCounts;
  }, [challenges]);

  const months = Object.keys(timelineData).sort((a, b) => new Date(a) - new Date(b));
  const platforms = [...new Set(challenges.map(ch => ch.platform))];
  const maxCount = Math.max(...Object.values(timelineData).flatMap(m => Object.values(m)));

  return (
    <div className="relative">
      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox="0 0 400 180">
          {/* Grid */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="40" y1={36 * i} x2="400" y2={36 * i} stroke="rgba(75,85,99,0.2)" strokeWidth="1"/>
          ))}
          
          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <text key={i} x="5" y={180 - (i * 30)} fill="#9ca3af" fontSize="10" fontWeight="bold">{i}</text>
          ))}

          {/* Lines for each platform */}
          {platforms.map(platform => {
            const points = months.map((month, idx) => {
              const count = timelineData[month][platform] || 0;
              const x = 40 + (idx / (months.length - 1 || 1)) * 360;
              const y = 180 - ((count / (maxCount || 1)) * 150);
              return { x, y, count, month, platform };
            });

            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            return (
              <g key={platform}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={platformColors[platform] || '#06b6d4'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((point, idx) => (
                  <circle
                    key={idx}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={platformColors[platform] || '#06b6d4'}
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* X-axis labels */}
          {months.map((month, idx) => {
            const x = 40 + (idx / (months.length - 1 || 1)) * 360;
            return (
              <text key={idx} x={x} y="175" fill="#9ca3af" fontSize="9" textAnchor="middle" fontWeight="bold">
                {month.split(' ')[0]}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute bg-black bg-opacity-90 border border-gray-600 rounded px-3 py-2 text-xs font-bold pointer-events-none"
            style={{ 
              left: `${(hoveredPoint.x / 400) * 100}%`, 
              top: `${(hoveredPoint.y / 180) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="text-white">{hoveredPoint.platform}</div>
            <div className="text-gray-400">{hoveredPoint.month}: {hoveredPoint.count} challenges</div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {platforms.map(platform => (
          <div key={platform} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors[platform] || '#06b6d4' }}></div>
            <span className="text-gray-300 font-bold text-xs">{platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Category Bar Chart Component
const CategoryBarChart = ({ challenges }) => {
  const categoryColors = {
    'Web': '#06b6d4',
    'Forensics': '#8b5cf6',
    'Binary': '#ec4899',
    'Crypto': '#f59e0b',
    'Misc': '#10b981'
  };

  const categories = useMemo(() => {
    const counts = {};
    challenges.forEach(ch => {
      counts[ch.category] = (counts[ch.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [challenges]);

  const maxCount = Math.max(...categories.map(c => c[1]), 1);

  return (
    <div className="flex items-end justify-around h-48 gap-2">
      {categories.map(([category, count]) => (
        <div key={category} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t transition-all hover:opacity-80"
            style={{
              height: `${(count / maxCount) * 160}px`,
              backgroundColor: categoryColors[category] || '#06b6d4'
            }}
            title={`${category}: ${count}`}
          />
          <div className="text-xs text-gray-300 font-bold mt-2 text-center">{category}</div>
          <div className="text-sm text-white font-bold">{count}</div>
        </div>
      ))}
    </div>
  );
};

// Platform Bar Chart Component
const PlatformBarChart = ({ challenges }) => {
  const platformColors = {
    'HackTheBox': '#22c55e',
    'CyberDefenders': '#1e40af',
    'CTF': '#f97316',
    'TryHackMe': '#8b5cf6',
    'PicoCTF': '#ec4899'
  };

  const platforms = useMemo(() => {
    const counts = {};
    challenges.forEach(ch => {
      counts[ch.platform] = (counts[ch.platform] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [challenges]);

  const maxCount = Math.max(...platforms.map(p => p[1]), 1);

  return (
    <div className="flex items-end justify-around h-48 gap-2">
      {platforms.map(([platform, count]) => (
        <div key={platform} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t transition-all hover:opacity-80"
            style={{
              height: `${(count / maxCount) * 160}px`,
              backgroundColor: platformColors[platform] || '#06b6d4'
            }}
            title={`${platform}: ${count}`}
          />
          <div className="text-xs text-gray-300 font-bold mt-2 text-center">{platform}</div>
          <div className="text-sm text-white font-bold">{count}</div>
        </div>
      ))}
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