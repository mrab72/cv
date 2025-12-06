import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function TokenBucketVisualization() {
  const [tokens, setTokens] = useState(10);
  const [maxTokens] = useState(10);
  const [refillRate] = useState(2); // tokens per second
  const [isRunning, setIsRunning] = useState(false);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ allowed: 0, rejected: 0 });
  const lastRefillTime = useRef(Date.now());
  const requestIdCounter = useRef(0);

  // Refill tokens based on time elapsed
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastRefillTime.current) / 1000;
      const tokensToAdd = elapsed * refillRate;

      setTokens(prev => {
        const newTokens = Math.min(prev + tokensToAdd, maxTokens);
        lastRefillTime.current = now;
        return newTokens;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, refillRate, maxTokens]);

  // Animate requests moving
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(prev => 
        prev.filter(req => req.progress < 100).map(req => ({
          ...req,
          progress: req.progress + 2
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleRequest = () => {
    const requestId = requestIdCounter.current++;
    const tokensNeeded = 1;

    if (tokens >= tokensNeeded) {
      setTokens(prev => prev - tokensNeeded);
      setRequests(prev => [...prev, { 
        id: requestId, 
        status: 'allowed', 
        progress: 0 
      }]);
      setStats(prev => ({ ...prev, allowed: prev.allowed + 1 }));
    } else {
      setRequests(prev => [...prev, { 
        id: requestId, 
        status: 'rejected', 
        progress: 0 
      }]);
      setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
    }
  };

  const handleBurst = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => handleRequest(), i * 100);
    }
  };

  const reset = () => {
    setTokens(maxTokens);
    setIsRunning(false);
    setRequests([]);
    setStats({ allowed: 0, rejected: 0 });
    lastRefillTime.current = Date.now();
  };

  const tokenHeight = (tokens / maxTokens) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Token Bucket Algorithm</h1>
          <p className="text-gray-600 mb-8">Watch how tokens refill and requests are processed</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Bucket Visualization */}
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg p-6 border-2 border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Token Bucket</h2>
              
              <div className="relative w-48 h-64 mx-auto mb-4">
                {/* Bucket container */}
                <div className="absolute inset-0 border-4 border-gray-700 rounded-b-lg bg-gradient-to-b from-transparent to-blue-50">
                  {/* Water/tokens level */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-b-lg transition-all duration-300 ease-out"
                    style={{ height: `${tokenHeight}%` }}
                  >
                    <div className="absolute inset-0 bg-blue-300 opacity-50 animate-pulse"></div>
                  </div>
                  
                  {/* Token count display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {Math.floor(tokens)}
                      </div>
                      <div className="text-xs text-gray-600">tokens</div>
                    </div>
                  </div>
                </div>

                {/* Dripping tokens animation when refilling */}
                {isRunning && tokens < maxTokens && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2 text-sm">
                <div className="flex justify-between px-4">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-semibold">{maxTokens} tokens</span>
                </div>
                <div className="flex justify-between px-4">
                  <span className="text-gray-600">Refill Rate:</span>
                  <span className="font-semibold">{refillRate} tokens/sec</span>
                </div>
              </div>
            </div>

            {/* Request Flow */}
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg p-6 border-2 border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Request Flow</h2>
              
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                {requests.map(req => (
                  <div
                    key={req.id}
                    className="absolute transition-all duration-100"
                    style={{
                      left: `${req.progress}%`,
                      top: `${(req.id % 5) * 50}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                      req.status === 'allowed' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {req.status === 'allowed' ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
                
                {requests.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No requests yet. Click "Send Request" to start!
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="text-green-700 font-semibold text-2xl">{stats.allowed}</div>
                  <div className="text-green-600 text-sm">Allowed</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="text-red-700 font-semibold text-2xl">{stats.rejected}</div>
                  <div className="text-red-600 text-sm">Rejected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                if (!isRunning) {
                  lastRefillTime.current = Date.now();
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isRunning 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? 'Pause Refill' : 'Start Refill'}
            </button>

            <button
              onClick={handleRequest}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
            >
              Send Request
            </button>

            <button
              onClick={handleBurst}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
            >
              Send Burst (5x)
            </button>

            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click "Start Refill" to begin adding tokens at 2 tokens/second</li>
              <li>Click "Send Request" to consume 1 token and process a request</li>
              <li>Try "Send Burst" to see how the bucket handles multiple requests at once</li>
              <li>Watch how requests are allowed (green) when tokens are available, or rejected (red) when the bucket is empty</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}