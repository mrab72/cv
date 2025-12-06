import React, { useState } from 'react';
import { ArrowRight, ArrowLeftRight, Radio, FileText } from 'lucide-react';

const ProtocolComparison = () => {
  const [activeTab, setActiveTab] = useState('visualization');

  const protocols = [
    {
      name: 'HTTP',
      icon: <ArrowRight className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Request-Response',
      flow: 'unidirectional'
    },
    {
      name: 'SSE',
      icon: <Radio className="w-6 h-6" />,
      color: 'bg-green-500',
      description: 'Server Push',
      flow: 'server-to-client'
    },
    {
      name: 'WebSocket',
      icon: <ArrowLeftRight className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'Full-Duplex',
      flow: 'bidirectional'
    }
  ];

  const comparisonData = [
    {
      feature: 'Communication',
      http: 'Request-Response only',
      sse: 'Server to Client (one-way)',
      websocket: 'Bidirectional (full-duplex)'
    },
    {
      feature: 'Connection',
      http: 'Short-lived, closes after response',
      sse: 'Long-lived, persistent',
      websocket: 'Long-lived, persistent'
    },
    {
      feature: 'Protocol',
      http: 'HTTP/1.1, HTTP/2, HTTP/3',
      sse: 'HTTP (uses text/event-stream)',
      websocket: 'ws:// or wss:// (upgrades from HTTP)'
    },
    {
      feature: 'Data Format',
      http: 'Any (JSON, XML, HTML, etc.)',
      sse: 'Text only (typically UTF-8)',
      websocket: 'Binary or Text'
    },
    {
      feature: 'Browser Support',
      http: 'Universal',
      sse: 'All modern browsers',
      websocket: 'All modern browsers'
    },
    {
      feature: 'Overhead',
      http: 'High (headers sent with each request)',
      sse: 'Low (minimal overhead after connection)',
      websocket: 'Very low (minimal framing)'
    },
    {
      feature: 'Reconnection',
      http: 'N/A (stateless)',
      sse: 'Automatic with built-in retry',
      websocket: 'Manual implementation required'
    },
    {
      feature: 'Firewall/Proxy',
      http: 'Excellent compatibility',
      sse: 'Good compatibility',
      websocket: 'Can be blocked by some proxies'
    },
    {
      feature: 'Complexity',
      http: 'Simple',
      sse: 'Simple',
      websocket: 'Moderate (requires handshake)'
    }
  ];

  const useCases = [
    {
      protocol: 'HTTP',
      cases: [
        { title: 'RESTful APIs', desc: 'Traditional web services and API endpoints' },
        { title: 'Form Submissions', desc: 'User login, registration, data posting' },
        { title: 'Static Content', desc: 'Loading web pages, images, stylesheets' },
        { title: 'File Downloads', desc: 'Downloading documents, media files' }
      ]
    },
    {
      protocol: 'SSE',
      cases: [
        { title: 'Live News Feeds', desc: 'Real-time news updates and notifications' },
        { title: 'Stock Tickers', desc: 'Continuous stock price updates' },
        { title: 'Social Media Feeds', desc: 'Twitter/Facebook live updates' },
        { title: 'Progress Monitoring', desc: 'Server-side task progress updates' }
      ]
    },
    {
      protocol: 'WebSocket',
      cases: [
        { title: 'Chat Applications', desc: 'Real-time messaging (Slack, Discord)' },
        { title: 'Multiplayer Games', desc: 'Low-latency game state synchronization' },
        { title: 'Collaborative Editing', desc: 'Google Docs, Figma real-time collaboration' },
        { title: 'Trading Platforms', desc: 'Bidirectional financial data streaming' }
      ]
    }
  ];

  const HandshakeSequence = ({ type }) => {
    const sequences = {
      HTTP: [
        { step: 1, from: 'Client', to: 'Server', label: 'HTTP Request', detail: 'GET /api/data HTTP/1.1\nHeaders: ~500-800 bytes' },
        { step: 2, from: 'Server', to: 'Client', label: 'HTTP Response', detail: 'HTTP/1.1 200 OK\nHeaders + Body\nConnection: close' },
        { step: 3, label: 'Connection Closed', detail: 'New TCP handshake needed for next request' }
      ],
      SSE: [
        { step: 1, from: 'Client', to: 'Server', label: 'HTTP Request', detail: 'GET /events HTTP/1.1\nAccept: text/event-stream' },
        { step: 2, from: 'Server', to: 'Client', label: 'HTTP Response', detail: 'HTTP/1.1 200 OK\nContent-Type: text/event-stream\nConnection: keep-alive' },
        { step: 3, label: 'Connection Established', detail: 'Persistent connection maintained' },
        { step: 4, from: 'Server', to: 'Client', label: 'Stream Events', detail: 'data: {message}\n\nLow overhead per message' }
      ],
      WebSocket: [
        { step: 1, from: 'Client', to: 'Server', label: 'HTTP Upgrade Request', detail: 'GET /chat HTTP/1.1\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Key: ...' },
        { step: 2, from: 'Server', to: 'Client', label: 'HTTP 101 Switching', detail: 'HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: ...' },
        { step: 3, label: 'Protocol Upgraded', detail: 'Connection switches from HTTP to WebSocket' },
        { step: 4, from: 'Client', to: 'Server', label: 'WS Frame', detail: 'Binary/Text frames\n2-14 bytes overhead per message' },
        { step: 5, from: 'Server', to: 'Client', label: 'WS Frame', detail: 'Minimal overhead, bidirectional' }
      ]
    };

    const seq = sequences[type];

    return (
      <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-xl text-center">{type} Handshake</h3>
        
        <div className="space-y-4">
          {seq.map((item, idx) => (
            <div key={idx}>
              {item.from && item.to ? (
                <div className="flex items-center justify-between">
                  <div className="w-24 text-center">
                    <div className={`inline-block px-3 py-2 rounded font-semibold text-sm ${
                      item.from === 'Client' ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'
                    }`}>
                      {item.from}
                    </div>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="relative">
                      <ArrowRight className={`w-full h-8 ${
                        item.from === 'Client' ? 'text-blue-500' : 'text-green-500 rotate-180'
                      }`} />
                      <div className="absolute top-10 left-0 right-0 text-center">
                        <div className="bg-white border-2 border-gray-300 rounded px-3 py-1 inline-block shadow-sm">
                          <div className="font-semibold text-sm">{item.label}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-24 text-center">
                    <div className={`inline-block px-3 py-2 rounded font-semibold text-sm ${
                      item.to === 'Server' ? 'bg-green-100 text-green-900' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {item.to}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="inline-block bg-yellow-100 border-2 border-yellow-400 rounded px-4 py-2 font-semibold">
                    {item.label}
                  </div>
                </div>
              )}
              
              <div className="mt-2 text-center">
                <div className="inline-block bg-gray-100 rounded px-3 py-2 text-xs font-mono text-gray-700 whitespace-pre">
                  {item.detail}
                </div>
              </div>
              
              {idx < seq.length - 1 && (
                <div className="flex justify-center mt-4">
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded border-2 border-gray-300">
          <h4 className="font-semibold mb-2">Overhead Analysis:</h4>
          <div className="text-sm space-y-1">
            {type === 'HTTP' && (
              <>
                <p>• <strong>Initial:</strong> TCP handshake + HTTP headers (~800-1500 bytes)</p>
                <p>• <strong>Per request:</strong> Full headers every time (~500-800 bytes)</p>
                <p>• <strong>Best for:</strong> Infrequent requests where connection reuse isn't needed</p>
              </>
            )}
            {type === 'SSE' && (
              <>
                <p>• <strong>Initial:</strong> TCP + HTTP handshake (~1000-1500 bytes)</p>
                <p>• <strong>Per message:</strong> Very low (~10-20 bytes)</p>
                <p>• <strong>Best for:</strong> Server-to-client streaming with many messages</p>
              </>
            )}
            {type === 'WebSocket' && (
              <>
                <p>• <strong>Initial:</strong> TCP + HTTP upgrade handshake (~500-700 bytes)</p>
                <p>• <strong>Per message:</strong> Minimal framing (2-14 bytes)</p>
                <p>• <strong>Best for:</strong> High-frequency bidirectional communication</p>
                <p className="text-purple-700 font-semibold mt-2">⚡ After initial overhead, WebSocket is most efficient for real-time apps</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AnimatedFlow = ({ type }) => {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg">{type}</h3>
        
        {type === 'HTTP' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-20 h-12 bg-blue-100 rounded flex items-center justify-center font-semibold">Client</div>
              <ArrowRight className="w-8 h-8 text-blue-500 animate-pulse" />
              <div className="w-20 h-12 bg-blue-200 rounded flex items-center justify-center font-semibold">Server</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-12 bg-blue-100 rounded flex items-center justify-center font-semibold">Client</div>
              <ArrowRight className="w-8 h-8 text-blue-500 animate-pulse rotate-180" />
              <div className="w-20 h-12 bg-blue-200 rounded flex items-center justify-center font-semibold">Server</div>
            </div>
            <p className="text-sm text-gray-600 text-center">Connection closes after response</p>
          </div>
        )}

        {type === 'SSE' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-20 h-12 bg-green-100 rounded flex items-center justify-center font-semibold">Client</div>
              <ArrowRight className="w-8 h-8 text-green-500" />
              <div className="w-20 h-12 bg-green-200 rounded flex items-center justify-center font-semibold">Server</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-12 bg-green-100 rounded flex items-center justify-center font-semibold">Client</div>
              <ArrowRight className="w-8 h-8 text-green-500 animate-pulse rotate-180" />
              <div className="w-20 h-12 bg-green-200 rounded flex items-center justify-center font-semibold">Server</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-12 bg-green-100 rounded flex items-center justify-center font-semibold">Client</div>
              <ArrowRight className="w-8 h-8 text-green-500 animate-pulse rotate-180" />
              <div className="w-20 h-12 bg-green-200 rounded flex items-center justify-center font-semibold">Server</div>
            </div>
            <p className="text-sm text-gray-600 text-center">Persistent connection, server pushes updates</p>
          </div>
        )}

        {type === 'WebSocket' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-20 h-12 bg-purple-100 rounded flex items-center justify-center font-semibold">Client</div>
              <ArrowLeftRight className="w-8 h-8 text-purple-500 animate-pulse" />
              <div className="w-20 h-12 bg-purple-200 rounded flex items-center justify-center font-semibold">Server</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-12 bg-purple-100 rounded flex items-center justify-center font-semibold">Client</div>
              <ArrowLeftRight className="w-8 h-8 text-purple-500 animate-pulse" />
              <div className="w-20 h-12 bg-purple-200 rounded flex items-center justify-center font-semibold">Server</div>
            </div>
            <p className="text-sm text-gray-600 text-center">Persistent bidirectional communication</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Protocol Comparison</h1>
        <p className="text-gray-600">WebSocket vs Server-Sent Events vs HTTP</p>
      </div>

      <div className="flex gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('handshake')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'handshake'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Handshake Process
        </button>
        <button
          onClick={() => setActiveTab('visualization')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'visualization'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Communication Flow
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'comparison'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Comparison Table
        </button>
        <button
          onClick={() => setActiveTab('usecases')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'usecases'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Use Cases
        </button>
      </div>

      {activeTab === 'handshake' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">Understanding the Overhead</h3>
            <p className="text-sm text-yellow-800">
              WebSocket does have initial handshake overhead, but it pays off for applications with frequent messages. 
              The key is that after the initial upgrade, each message has minimal overhead (2-14 bytes) compared to 
              HTTP's 500-800 bytes of headers per request.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <HandshakeSequence type="HTTP" />
            <HandshakeSequence type="SSE" />
            <HandshakeSequence type="WebSocket" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-xl mb-4">When Does WebSocket's Initial Overhead Pay Off?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700">✓ WebSocket is Worth It:</h4>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>• <strong>10+ messages per second:</strong> Overhead quickly amortized</li>
                  <li>• <strong>Bidirectional needs:</strong> Client and server both send data</li>
                  <li>• <strong>Low latency critical:</strong> Gaming, trading, live collaboration</li>
                  <li>• <strong>Long sessions:</strong> Chat apps, monitoring dashboards</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-700">✗ HTTP/SSE May Be Better:</h4>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>• <strong>Infrequent updates:</strong> Less than 1 message per minute</li>
                  <li>• <strong>One-way only:</strong> Server just needs to push updates</li>
                  <li>• <strong>Simple requirements:</strong> Built-in browser EventSource API</li>
                  <li>• <strong>Short sessions:</strong> Quick request-response patterns</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-900 mb-2">Break-Even Point Example:</h4>
              <p className="text-sm text-blue-800">
                If each HTTP request has ~800 bytes overhead and WebSocket messages have ~6 bytes overhead, 
                the initial WebSocket handshake (~700 bytes) is paid back after just <strong>1-2 message exchanges</strong>. 
                For a chat app sending 100 messages, WebSocket uses ~1,300 bytes total vs HTTP's ~80,000 bytes!
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visualization' && (
        <div className="grid md:grid-cols-3 gap-6">
          <AnimatedFlow type="HTTP" />
          <AnimatedFlow type="SSE" />
          <AnimatedFlow type="WebSocket" />
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Feature</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-700">HTTP</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-green-700">SSE</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-purple-700">WebSocket</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">{row.feature}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.http}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.sse}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.websocket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'usecases' && (
        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((protocol, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="flex items-center space-x-3">
                {idx === 0 && <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white"><ArrowRight /></div>}
                {idx === 1 && <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white"><Radio /></div>}
                {idx === 2 && <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white"><ArrowLeftRight /></div>}
                <h3 className="text-xl font-bold text-gray-900">{protocol.protocol}</h3>
              </div>
              <div className="space-y-3">
                {protocol.cases.map((useCase, caseIdx) => (
                  <div key={caseIdx} className="border-l-4 border-gray-300 pl-4 py-2">
                    <h4 className="font-semibold text-gray-800">{useCase.title}</h4>
                    <p className="text-sm text-gray-600">{useCase.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Decision Guide</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li><strong>Use HTTP</strong> when you need simple request-response patterns, RESTful APIs, or infrequent updates</li>
          <li><strong>Use SSE</strong> when you only need server-to-client updates, want automatic reconnection, and simplicity matters</li>
          <li><strong>Use WebSocket</strong> when you need real-time bidirectional communication with low latency</li>
        </ul>
      </div>
    </div>
  );
};

export default ProtocolComparison;