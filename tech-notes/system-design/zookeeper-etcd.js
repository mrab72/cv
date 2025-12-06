import React, { useState } from 'react';
import { Server, ArrowRight, Users } from 'lucide-react';

const EtcdZooKeeperComparison = () => {
  const [activeTab, setActiveTab] = useState('architecture');
  const [zkStep, setZkStep] = useState(0);
  const [etcdStep, setEtcdStep] = useState(0);
  const [watchStep, setWatchStep] = useState(0);
  const [watchAnimation, setWatchAnimation] = useState('paused');

  const comparisonData = [
    { feature: 'Consensus Algorithm', zookeeper: 'ZAB (ZooKeeper Atomic Broadcast)', etcd: 'Raft' },
    { feature: 'Data Model', zookeeper: 'Hierarchical namespace (like file system)', etcd: 'Flat key-value store with directory-like keys' },
    { feature: 'Language', zookeeper: 'Java', etcd: 'Go' },
    { feature: 'API', zookeeper: 'Custom protocol (binary)', etcd: 'gRPC / HTTP/JSON REST API' },
    { feature: 'Watch Mechanism', zookeeper: 'One-time triggers (need re-registration)', etcd: 'Persistent watches with event history' },
    { feature: 'Transactions', zookeeper: 'Multi-operations (limited)', etcd: 'Full ACID transactions with STM' },
    { feature: 'Lease/Session', zookeeper: 'Session-based with heartbeats', etcd: 'TTL-based leases' },
    { feature: 'Authentication', zookeeper: 'ACL-based (digest, SASL)', etcd: 'Role-based (RBAC)' },
    { feature: 'Performance', zookeeper: 'High read throughput, lower write', etcd: 'Balanced, optimized for writes' },
    { feature: 'Read Throughput', zookeeper: '~200,000-500,000 reads/sec (5-node cluster)', etcd: '~100,000-150,000 reads/sec (linearizable)' },
    { feature: 'Write Throughput', zookeeper: '~10,000-40,000 writes/sec', etcd: '~10,000-30,000 writes/sec' },
    { feature: 'Watch Scalability', zookeeper: '~10,000 watches (re-registration overhead)', etcd: '~1,000,000+ watches (persistent streams)' },
    { feature: 'Latency (Write)', zookeeper: '2-10ms (depending on cluster)', etcd: '2-50ms (with fsync, configurable)' },
    { feature: 'Cluster Size', zookeeper: 'Typically 3-7 nodes (odd numbers)', etcd: 'Typically 3-5 nodes (larger = slower)' },
    { feature: 'Operational Complexity', zookeeper: 'Higher (JVM tuning, complex ops)', etcd: 'Lower (single binary, simpler)' }
  ];

  const zkWriteSteps = [
    { step: 0, title: 'Client Sends Write Request', desc: 'Client connects to any ZooKeeper server (leader or follower)', active: ['client', 'follower1'] },
    { step: 1, title: 'Forward to Leader', desc: 'If connected to follower, request is forwarded to leader', active: ['follower1', 'leader'] },
    { step: 2, title: 'Leader Proposes', desc: 'Leader assigns zxid (ZooKeeper transaction ID) and broadcasts PROPOSAL to all followers', active: ['leader', 'follower1', 'follower2', 'follower3'] },
    { step: 3, title: 'Followers ACK', desc: 'Each follower writes to transaction log and sends ACK back to leader', active: ['follower1', 'follower2', 'follower3', 'leader'] },
    { step: 4, title: 'Quorum Reached', desc: 'Leader waits for majority ACKs (quorum: n/2 + 1)', active: ['leader'] },
    { step: 5, title: 'Leader Commits', desc: 'Leader sends COMMIT to all followers', active: ['leader', 'follower1', 'follower2', 'follower3'] },
    { step: 6, title: 'Response to Client', desc: 'Success response sent back to client', active: ['follower1', 'client'] }
  ];

  const etcdWriteSteps = [
    { step: 0, title: 'Client Sends Write Request', desc: 'Client sends write request via gRPC to any etcd node', active: ['client', 'follower1'] },
    { step: 1, title: 'Forward to Leader', desc: 'Non-leader forwards request to current leader', active: ['follower1', 'leader'] },
    { step: 2, title: 'Leader Appends Log', desc: 'Leader appends entry to its Raft log', active: ['leader'] },
    { step: 3, title: 'Replicate to Followers', desc: 'Leader sends AppendEntries RPC to all followers', active: ['leader', 'follower1', 'follower2'] },
    { step: 4, title: 'Followers Append & ACK', desc: 'Followers append to their logs and respond', active: ['follower1', 'follower2', 'leader'] },
    { step: 5, title: 'Commit When Majority', desc: 'Once majority confirms, leader commits and applies to state machine', active: ['leader'] },
    { step: 6, title: 'Notify Followers', desc: 'Leader notifies followers to commit', active: ['leader', 'follower1', 'follower2'] },
    { step: 7, title: 'Response to Client', desc: 'Success response sent to client', active: ['leader', 'client'] }
  ];

  const zkWatchSteps = [
    { step: 0, title: 'Set Watch', desc: 'Client sets a watch on /config/db', active: ['client', 'zk'] },
    { step: 1, title: 'Watch Registered', desc: 'ZooKeeper registers one-time watch', active: ['zk'] },
    { step: 2, title: 'Data Changes', desc: 'Another client updates /config/db', active: ['zk', 'other'] },
    { step: 3, title: 'Event Fired', desc: 'Watch triggers, client receives notification', active: ['zk', 'client'] },
    { step: 4, title: 'Watch Removed', desc: 'Watch is consumed and removed (one-time only)', active: ['zk'] },
    { step: 5, title: 'Data Changes Again', desc: 'Another update happens to /config/db', active: ['zk', 'other'] },
    { step: 6, title: 'No Notification', desc: 'Client receives nothing - must re-register watch', active: ['client'] }
  ];

  const etcdWatchSteps = [
    { step: 0, title: 'Create Watch', desc: 'Client creates watch on /config/db from revision 10', active: ['client', 'etcd'] },
    { step: 1, title: 'Watch Stream Open', desc: 'etcd opens persistent gRPC stream', active: ['etcd'] },
    { step: 2, title: 'Data Changes', desc: 'Another client updates /config/db (rev 11)', active: ['etcd', 'other'] },
    { step: 3, title: 'Event Streamed', desc: 'Change event sent through stream', active: ['etcd', 'client'] },
    { step: 4, title: 'Watch Continues', desc: 'Watch remains active, no re-registration needed', active: ['etcd'] },
    { step: 5, title: 'Data Changes Again', desc: 'Another update to /config/db (rev 12)', active: ['etcd', 'other'] },
    { step: 6, title: 'Event Streamed Again', desc: 'Client automatically receives notification', active: ['etcd', 'client'] }
  ];

  const ZooKeeperArchitecture = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-xl mb-4 text-center">ZooKeeper Cluster Architecture</h3>
        
        <div className="flex flex-col items-center space-y-8">
          <div className="flex space-x-8">
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-blue-500 mb-2" />
              <div className="text-sm font-semibold">Clients</div>
            </div>
          </div>

          <ArrowRight className="rotate-90 text-gray-400" />

          <div className="w-full border-4 border-purple-300 rounded-lg p-6 bg-purple-50">
            <div className="text-center font-bold text-purple-900 mb-4">ZooKeeper Ensemble (Cluster)</div>
            
            <div className="flex justify-center items-start space-x-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-yellow-400 rounded-lg flex items-center justify-center border-4 border-yellow-600 shadow-lg">
                  <div className="text-center">
                    <Server className="w-12 h-12 mx-auto mb-2 text-yellow-900" />
                    <div className="font-bold text-yellow-900">LEADER</div>
                    <div className="text-xs text-yellow-800">Handles writes</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-center max-w-32">
                  Coordinates writes, broadcasts proposals, maintains order
                </div>
              </div>

              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-green-400 rounded-lg flex items-center justify-center border-4 border-green-600 shadow-lg">
                    <div className="text-center">
                      <Server className="w-12 h-12 mx-auto mb-2 text-green-900" />
                      <div className="font-bold text-green-900">FOLLOWER</div>
                      <div className="text-xs text-green-800">Serves reads</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-center max-w-32">
                    Serve read requests, forward writes, vote in elections
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded border-2 border-yellow-300">
            <h4 className="font-semibold text-yellow-900 mb-2">ZAB Protocol (Leader)</h4>
            <ul className="text-sm space-y-1 text-yellow-800">
              <li>Sequences all writes with zxid</li>
              <li>Broadcasts proposals to followers</li>
              <li>Waits for quorum before commit</li>
              <li>Single point for write ordering</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded border-2 border-green-300">
            <h4 className="font-semibold text-green-900 mb-2">Followers Role</h4>
            <ul className="text-sm space-y-1 text-green-800">
              <li>Serve read requests locally</li>
              <li>ACK leader proposals</li>
              <li>Sync with leader periodically</li>
              <li>Participate in leader election</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-xl mb-4">ZooKeeper Data Model</h3>
        <div className="bg-gray-50 p-4 rounded font-mono text-sm">
          <div className="space-y-1">
            <div className="text-purple-700">/ (root)</div>
            <div className="ml-4 text-blue-700">├── app</div>
            <div className="ml-8 text-green-700">│   ├── config</div>
            <div className="ml-12 text-gray-700">│   │   └── db_connection</div>
            <div className="ml-8 text-green-700">│   └── workers</div>
            <div className="ml-12 text-gray-700">│       ├── worker-0001 (ephemeral)</div>
            <div className="ml-12 text-gray-700">│       └── worker-0002 (ephemeral)</div>
            <div className="ml-4 text-blue-700">└── locks</div>
            <div className="ml-8 text-green-700">    └── distributed-lock-00001 (ephemeral sequential)</div>
          </div>
        </div>
        <div className="mt-4 text-sm space-y-2">
          <p className="font-semibold">ZNode Types:</p>
          <ul className="ml-4 space-y-1">
            <li><span className="font-semibold">Persistent:</span> Remains until explicitly deleted</li>
            <li><span className="font-semibold">Ephemeral:</span> Deleted when client session ends</li>
            <li><span className="font-semibold">Sequential:</span> Auto-appended with monotonic counter</li>
            <li><span className="font-semibold">Container:</span> Deleted when last child removed (3.5+)</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const EtcdArchitecture = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-xl mb-4 text-center">etcd Cluster Architecture</h3>
        
        <div className="flex flex-col items-center space-y-8">
          <div className="flex space-x-8">
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-blue-500 mb-2" />
              <div className="text-sm font-semibold">Clients (gRPC/HTTP)</div>
            </div>
          </div>

          <ArrowRight className="rotate-90 text-gray-400" />

          <div className="w-full border-4 border-blue-300 rounded-lg p-6 bg-blue-50">
            <div className="text-center font-bold text-blue-900 mb-4">etcd Cluster (Raft Consensus)</div>
            
            <div className="flex justify-center items-start space-x-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-orange-400 rounded-lg flex items-center justify-center border-4 border-orange-600 shadow-lg">
                  <div className="text-center">
                    <Server className="w-12 h-12 mx-auto mb-2 text-orange-900" />
                    <div className="font-bold text-orange-900">LEADER</div>
                    <div className="text-xs text-orange-800">Term: N</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-center max-w-32">
                  Handles all writes, sends heartbeats, replicates log
                </div>
              </div>

              {[1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-cyan-400 rounded-lg flex items-center justify-center border-4 border-cyan-600 shadow-lg">
                    <div className="text-center">
                      <Server className="w-12 h-12 mx-auto mb-2 text-cyan-900" />
                      <div className="font-bold text-cyan-900">FOLLOWER</div>
                      <div className="text-xs text-cyan-800">Term: N</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-center max-w-32">
                    Can serve reads, replicate log, vote in elections
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-orange-50 p-4 rounded border-2 border-orange-300">
            <h4 className="font-semibold text-orange-900 mb-2">Raft Consensus</h4>
            <ul className="text-sm space-y-1 text-orange-800">
              <li>Leader elected via voting</li>
              <li>Term numbers prevent split brain</li>
              <li>Log replication with AppendEntries</li>
              <li>Linearizable reads by default</li>
            </ul>
          </div>
          <div className="bg-cyan-50 p-4 rounded border-2 border-cyan-300">
            <h4 className="font-semibold text-cyan-900 mb-2">etcd Features</h4>
            <ul className="text-sm space-y-1 text-cyan-800">
              <li>gRPC/HTTP2 protocol</li>
              <li>MVCC with revision history</li>
              <li>Persistent watches</li>
              <li>TTL-based leases</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-xl mb-4">etcd Data Model</h3>
        <div className="bg-gray-50 p-4 rounded font-mono text-sm space-y-1">
          <div className="text-blue-700">/app/config/db_connection</div>
          <div className="text-blue-700">/app/workers/worker-1 (TTL: 30s)</div>
          <div className="text-blue-700">/app/workers/worker-2 (TTL: 30s)</div>
          <div className="text-blue-700">/locks/service-lock (Lease: abc123)</div>
        </div>
        <div className="mt-4 text-sm space-y-2">
          <p className="font-semibold">etcd Features:</p>
          <ul className="ml-4 space-y-1">
            <li><span className="font-semibold">Flat key-value:</span> No true hierarchy, just key conventions</li>
            <li><span className="font-semibold">MVCC:</span> Every write creates new revision, old versions retained</li>
            <li><span className="font-semibold">Leases:</span> TTL-based expiration (like ephemeral nodes)</li>
            <li><span className="font-semibold">Transactions:</span> Compare-and-swap, multi-key operations</li>
            <li><span className="font-semibold">Watches:</span> Persistent, with historical playback from revision</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const ZooKeeperWriteProcess = () => {
    const currentStep = zkWriteSteps[zkStep];
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-xl mb-4 text-center">ZooKeeper Write Process (ZAB Protocol)</h3>
          
          <div className="mb-6 flex justify-center flex-wrap gap-2">
            {zkWriteSteps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setZkStep(idx)}
                className={`w-10 h-10 rounded-full font-bold ${
                  idx === zkStep ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 p-8 rounded-lg mb-6 overflow-x-auto">
            <div className="flex justify-around items-start min-w-max">
              <div className={`flex flex-col items-center transition-all mx-2 ${
                currentStep.active.includes('client') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-blue-400 rounded-lg flex items-center justify-center border-4 border-blue-600">
                  <Users className="w-10 h-10 text-blue-900" />
                </div>
                <div className="text-sm font-semibold mt-2">Client</div>
              </div>

              <div className={`flex flex-col items-center transition-all mx-2 ${
                currentStep.active.includes('follower1') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-green-400 rounded-lg flex items-center justify-center border-4 border-green-600">
                  <Server className="w-10 h-10 text-green-900" />
                </div>
                <div className="text-sm font-semibold mt-2">F1</div>
              </div>

              <div className={`flex flex-col items-center transition-all mx-2 ${
                currentStep.active.includes('leader') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-yellow-400 rounded-lg flex items-center justify-center border-4 border-yellow-600">
                  <Server className="w-10 h-10 text-yellow-900" />
                </div>
                <div className="text-sm font-semibold mt-2">Leader</div>
              </div>

              <div className={`flex flex-col items-center transition-all mx-2 ${
                currentStep.active.includes('follower2') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-green-400 rounded-lg flex items-center justify-center border-4 border-green-600">
                  <Server className="w-10 h-10 text-green-900" />
                </div>
                <div className="text-sm font-semibold mt-2">F2</div>
              </div>

              <div className={`flex flex-col items-center transition-all mx-2 ${
                currentStep.active.includes('follower3') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-green-400 rounded-lg flex items-center justify-center border-4 border-green-600">
                  <Server className="w-10 h-10 text-green-900" />
                </div>
                <div className="text-sm font-semibold mt-2">F3</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h4 className="font-bold text-lg mb-2">Step {zkStep + 1}: {currentStep.title}</h4>
            <p className="text-gray-700">{currentStep.desc}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-4">Key ZAB Concepts</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">1</div>
              <div>
                <span className="font-semibold">zxid (ZooKeeper Transaction ID):</span> 64-bit number combining epoch (high 32 bits) and counter (low 32 bits). Ensures total ordering of all transactions.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">2</div>
              <div>
                <span className="font-semibold">Two-Phase Commit:</span> Leader proposes, Followers ACK, Leader commits. Similar to 2PC but optimized for distributed consensus.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">3</div>
              <div>
                <span className="font-semibold">Quorum:</span> Majority (n/2 + 1) must ACK. For 5 nodes, need 3 ACKs. Ensures consistency even with failures.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">4</div>
              <div>
                <span className="font-semibold">Read Guarantee:</span> Reads are served locally by any server, may be slightly stale. Use sync() before read for latest data.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const WatchMechanism = () => {
    const startAnimation = () => {
      setWatchAnimation('running');
      setWatchStep(0);
      
      const interval = setInterval(() => {
        setWatchStep(prev => {
          if (prev >= 12) {
            clearInterval(interval);
            setWatchAnimation('paused');
            return 0;
          }
          return prev + 1;
        });
      }, 2000);
    };

    const resetAnimation = () => {
      setWatchAnimation('paused');
      setWatchStep(0);
    };

    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <h3 className="font-semibold text-yellow-900 mb-2">Key Difference</h3>
          <p className="text-sm text-yellow-800">
            ZooKeeper uses <strong>one-time watches</strong> that must be re-registered after each event, 
            while etcd provides <strong>persistent watches</strong> via gRPC streams that continuously deliver events.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <button
              onClick={startAnimation}
              disabled={watchAnimation === 'running'}
              className={`px-6 py-3 rounded-lg font-semibold ${
                watchAnimation === 'running'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {watchAnimation === 'running' ? 'Playing...' : 'Start Animation'}
            </button>
            <button
              onClick={resetAnimation}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
            >
              Reset
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="border-4 border-purple-300 rounded-lg p-6 bg-purple-50">
              <h3 className="font-bold text-xl mb-6 text-center text-purple-700">
                ZooKeeper: One-Time Watch
              </h3>
              
              <div className="bg-white p-6 rounded-lg mb-4 h-80 flex flex-col justify-between">
                <div className="flex justify-around items-start">
                  <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 bg-blue-400 rounded-lg flex items-center justify-center border-4 border-blue-600 transition-all ${
                      watchStep >= 0 && watchStep <= 6 && (watchStep === 0 || watchStep === 3 || watchStep === 6) ? 'ring-4 ring-blue-300' : ''
                    }`}>
                      <Users className="w-10 h-10 text-blue-900" />
                    </div>
                    <div className="text-sm font-semibold mt-2">Client</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 bg-purple-400 rounded-lg flex items-center justify-center border-4 border-purple-600 transition-all ${
                      watchStep >= 0 && watchStep <= 6 && (watchStep === 1 || watchStep === 2 || watchStep === 4 || watchStep === 5) ? 'ring-4 ring-purple-300' : ''
                    }`}>
                      <Server className="w-10 h-10 text-purple-900" />
                    </div>
                    <div className="text-sm font-semibold mt-2">ZK Server</div>
                    {watchStep >= 1 && watchStep <= 3 && (
                      <div className="mt-2 text-xs bg-yellow-200 px-2 py-1 rounded">Watch Active</div>
                    )}
                    {watchStep >= 4 && watchStep <= 6 && (
                      <div className="mt-2 text-xs bg-red-200 px-2 py-1 rounded">No Watch!</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {watchStep >= 0 && watchStep <= 6 && (
                    <>
                      {watchStep === 0 && (
                        <div className="bg-purple-100 p-3 rounded text-sm">
                          <strong>Step 1:</strong> Client registers watch on /config
                        </div>
                      )}
                      {watchStep === 1 && (
                        <div className="bg-purple-100 p-3 rounded text-sm">
                          <strong>Step 2:</strong> Watch registered (one-time)
                        </div>
                      )}
                      {watchStep === 2 && (
                        <div className="bg-purple-100 p-3 rounded text-sm">
                          <strong>Step 3:</strong> Data changes on /config
                        </div>
                      )}
                      {watchStep === 3 && (
                        <div className="bg-purple-100 p-3 rounded text-sm">
                          <strong>Step 4:</strong> Event fired! Client notified
                        </div>
                      )}
                      {watchStep === 4 && (
                        <div className="bg-red-100 p-3 rounded text-sm border-2 border-red-400">
                          <strong>Step 5:</strong> ⚠️ Watch consumed and removed!
                        </div>
                      )}
                      {watchStep === 5 && (
                        <div className="bg-red-100 p-3 rounded text-sm border-2 border-red-400">
                          <strong>Step 6:</strong> Data changes again...
                        </div>
                      )}
                      {watchStep === 6 && (
                        <div className="bg-red-100 p-3 rounded text-sm border-2 border-red-400">
                          <strong>Step 7:</strong> ❌ NO notification! Must re-register!
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded">
                <div className="text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold">Problem:</span>
                  </div>
                  <ul className="ml-5 text-xs space-y-1 text-gray-700">
                    <li>Watch fires once and disappears</li>
                    <li>Must immediately re-register</li>
                    <li>Risk missing events between removal and re-registration</li>
                    <li>Higher CPU overhead from constant re-registration</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-4 border-blue-300 rounded-lg p-6 bg-blue-50">
              <h3 className="font-bold text-xl mb-6 text-center text-blue-700">
                etcd: Persistent Watch
              </h3>
              
              <div className="bg-white p-6 rounded-lg mb-4 h-80 flex flex-col justify-between">
                <div className="flex justify-around items-start">
                  <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 bg-blue-400 rounded-lg flex items-center justify-center border-4 border-blue-600 transition-all ${
                      watchStep >= 7 && (watchStep === 7 || watchStep === 9 || watchStep === 12) ? 'ring-4 ring-blue-300' : ''
                    }`}>
                      <Users className="w-10 h-10 text-blue-900" />
                    </div>
                    <div className="text-sm font-semibold mt-2">Client</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 bg-cyan-400 rounded-lg flex items-center justify-center border-4 border-cyan-600 transition-all ${
                      watchStep >= 7 && (watchStep === 8 || watchStep === 10 || watchStep === 11) ? 'ring-4 ring-cyan-300' : ''
                    }`}>
                      <Server className="w-10 h-10 text-cyan-900" />
                    </div>
                    <div className="text-sm font-semibold mt-2">etcd Server</div>
                    {watchStep >= 8 && watchStep <= 12 && (
                      <div className="mt-2 text-xs bg-green-200 px-2 py-1 rounded animate-pulse">
                        Stream Open ✓
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {watchStep >= 7 && (
                    <>
                      {watchStep === 7 && (
                        <div className="bg-blue-100 p-3 rounded text-sm">
                          <strong>Step 1:</strong> Client opens watch stream on /config
                        </div>
                      )}
                      {watchStep === 8 && (
                        <div className="bg-blue-100 p-3 rounded text-sm">
                          <strong>Step 2:</strong> gRPC stream established (persistent)
                        </div>
                      )}
                      {watchStep === 9 && (
                        <div className="bg-blue-100 p-3 rounded text-sm">
                          <strong>Step 3:</strong> Data changes on /config (rev 11)
                        </div>
                      )}
                      {watchStep === 10 && (
                        <div className="bg-green-100 p-3 rounded text-sm border-2 border-green-400">
                          <strong>Step 4:</strong> ✓ Event streamed to client
                        </div>
                      )}
                      {watchStep === 11 && (
                        <div className="bg-green-100 p-3 rounded text-sm border-2 border-green-400">
                          <strong>Step 5:</strong> Data changes again (rev 12)
                        </div>
                      )}
                      {watchStep === 12 && (
                        <div className="bg-green-100 p-3 rounded text-sm border-2 border-green-400">
                          <strong>Step 6:</strong> ✓ Another event automatically delivered!
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded">
                <div className="text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-semibold">Advantage:</span>
                  </div>
                  <ul className="ml-5 text-xs space-y-1 text-gray-700">
                    <li>Stream stays open continuously</li>
                    <li>No re-registration needed</li>
                    <li>Zero events missed (MVCC guarantees)</li>
                    <li>Lower CPU, efficient streaming</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-xl mb-4">Performance & Scale Comparison</h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-purple-50 p-4 rounded border-2 border-purple-300">
              <h4 className="font-semibold text-purple-900 mb-3">ZooKeeper Watch Performance</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-purple-800">Concurrent Watches:</div>
                  <div className="text-gray-700">~10,000 watches (practical limit)</div>
                  <div className="text-xs text-gray-600 mt-1">Limited by re-registration overhead and thundering herd problem</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-800">Watch Event Rate:</div>
                  <div className="text-gray-700">~5,000-10,000 events/sec</div>
                  <div className="text-xs text-gray-600 mt-1">Bottlenecked by re-registration latency</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-800">Network Overhead:</div>
                  <div className="text-gray-700">High (constant re-registration)</div>
                  <div className="text-xs text-gray-600 mt-1">Each event = watch removal + re-registration</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded border-2 border-blue-300">
              <h4 className="font-semibold text-blue-900 mb-3">etcd Watch Performance</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-blue-800">Concurrent Watches:</div>
                  <div className="text-gray-700">~1,000,000+ watches</div>
                  <div className="text-xs text-gray-600 mt-1">Scales with available connections and memory</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-800">Watch Event Rate:</div>
                  <div className="text-gray-700">~100,000+ events/sec</div>
                  <div className="text-xs text-gray-600 mt-1">Limited mainly by network bandwidth</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-800">Network Overhead:</div>
                  <div className="text-gray-700">Low (persistent streams)</div>
                  <div className="text-xs text-gray-600 mt-1">Minimal framing, efficient gRPC streaming</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold mb-3">Overall Throughput Comparison (5-node cluster)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Metric</th>
                    <th className="px-4 py-2 text-left text-purple-700">ZooKeeper</th>
                    <th className="px-4 py-2 text-left text-blue-700">etcd</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">Read Ops/sec</td>
                    <td className="px-4 py-2">200,000 - 500,000</td>
                    <td className="px-4 py-2">100,000 - 150,000 (linearizable)</td>
                  </tr>
                  <tr className="border-t bg-gray-100">
                    <td className="px-4 py-2 font-medium">Write Ops/sec</td>
                    <td className="px-4 py-2">10,000 - 40,000</td>
                    <td className="px-4 py-2">10,000 - 30,000</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">Watch Scalability</td>
                    <td className="px-4 py-2">~10K concurrent watches</td>
                    <td className="px-4 py-2">~1M+ concurrent watches</td>
                  </tr>
                  <tr className="border-t bg-gray-100">
                    <td className="px-4 py-2 font-medium">Write Latency</td>
                    <td className="px-4 py-2">2-10ms (typical)</td>
                    <td className="px-4 py-2">2-50ms (with fsync)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">Data Size Limit</td>
                    <td className="px-4 py-2">1MB per znode (configurable)</td>
                    <td className="px-4 py-2">1.5MB per key (configurable)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Note: Performance varies based on hardware, network, cluster size, and workload patterns. 
              These are typical production benchmarks.
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <h3 className="font-semibold text-orange-900 mb-2">Real-World Implications</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-orange-800">
            <div>
              <p className="font-semibold mb-2">ZooKeeper Watch Use Cases:</p>
              <ul className="ml-4 space-y-1">
                <li>• Configuration changes (infrequent updates)</li>
                <li>• Cluster membership (node join/leave)</li>
                <li>• Leader election notifications</li>
                <li>• Service discovery (moderate scale)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">etcd Watch Use Cases:</p>
              <ul className="ml-4 space-y-1">
                <li>• Kubernetes pod state changes (high volume)</li>
                <li>• Real-time configuration propagation</li>
                <li>• Large-scale service mesh updates</li>
                <li>• Event sourcing and audit logs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EtcdWriteProcess = () => {
    const currentStep = etcdWriteSteps[etcdStep];
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-xl mb-4 text-center">etcd Write Process (Raft Protocol)</h3>
          
          <div className="mb-6 flex justify-center flex-wrap gap-2">
            {etcdWriteSteps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setEtcdStep(idx)}
                className={`w-10 h-10 rounded-full font-bold ${
                  idx === etcdStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 p-8 rounded-lg mb-6">
            <div className="flex justify-around items-start">
              <div className={`flex flex-col items-center transition-all ${
                currentStep.active.includes('client') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-blue-400 rounded-lg flex items-center justify-center border-4 border-blue-600">
                  <Users className="w-10 h-10 text-blue-900" />
                </div>
                <div className="text-sm font-semibold mt-2">Client</div>
              </div>

              <div className={`flex flex-col items-center transition-all ${
                currentStep.active.includes('leader') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-orange-400 rounded-lg flex items-center justify-center border-4 border-orange-600">
                  <Server className="w-10 h-10 text-orange-900" />
                </div>
                <div className="text-sm font-semibold mt-2">Leader</div>
              </div>

              <div className={`flex flex-col items-center transition-all ${
                currentStep.active.includes('follower1') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-cyan-400 rounded-lg flex items-center justify-center border-4 border-cyan-600">
                  <Server className="w-10 h-10 text-cyan-900" />
                </div>
                <div className="text-sm font-semibold mt-2">F1</div>
              </div>

              <div className={`flex flex-col items-center transition-all ${
                currentStep.active.includes('follower2') ? 'opacity-100 scale-110' : 'opacity-40'
              }`}>
                <div className="w-20 h-20 bg-cyan-400 rounded-lg flex items-center justify-center border-4 border-cyan-600">
                  <Server className="w-10 h-10 text-cyan-900" />
                </div>
                <div className="text-sm font-semibold mt-2">F2</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-bold text-lg mb-2">Step {etcdStep + 1}: {currentStep.title}</h4>
            <p className="text-gray-700">{currentStep.desc}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-4">Key Raft Concepts</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">1</div>
              <div>
                <span className="font-semibold">Term:</span> Logical clock incremented during elections. Prevents stale leaders from causing issues after network partition.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">2</div>
              <div>
                <span className="font-semibold">Log Replication:</span> Leader appends to its log, then replicates via AppendEntries RPC. More explicit than ZAB broadcast model.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">3</div>
              <div>
                <span className="font-semibold">Commit Index:</span> Leader tracks highest log index known to be committed. Followers apply committed entries to state machine.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">4</div>
              <div>
                <span className="font-semibold">Read Guarantee:</span> Linearizable reads by default (leader confirms it is still leader). Can use serializable reads for better performance.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">etcd vs ZooKeeper</h1>
        <p className="text-gray-600">Distributed Coordination Systems Comparison</p>
      </div>

      <div className="flex gap-2 border-b overflow-x-auto">
        <button onClick={() => setActiveTab('architecture')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'architecture' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
          Architecture
        </button>
        <button onClick={() => setActiveTab('zk-write')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'zk-write' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}>
          ZooKeeper Write
        </button>
        <button onClick={() => setActiveTab('etcd-write')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'etcd-write' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
          etcd Write
        </button>
        <button onClick={() => setActiveTab('watch')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'watch' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>
          Watch Mechanism
        </button>
        <button onClick={() => setActiveTab('comparison')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'comparison' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
          Comparison Table
        </button>
        <button onClick={() => setActiveTab('usecases')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'usecases' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
          Use Cases
        </button>
      </div>

      {activeTab === 'architecture' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ZooKeeperArchitecture />
          <EtcdArchitecture />
        </div>
      )}

      {activeTab === 'zk-write' && <ZooKeeperWriteProcess />}
      
      {activeTab === 'etcd-write' && <EtcdWriteProcess />}

      {activeTab === 'watch' && <WatchMechanism />}

      {activeTab === 'comparison' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Feature</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-purple-700">ZooKeeper</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-700">etcd</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">{row.feature}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.zookeeper}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.etcd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'usecases' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">ZooKeeper Use Cases</h3>
              </div>
              <div className="space-y-3">
                <div className="border-l-4 border-purple-300 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Apache Hadoop</h4>
                  <p className="text-sm text-gray-600">HDFS NameNode HA and coordination</p>
                </div>
                <div className="border-l-4 border-purple-300 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Apache Kafka</h4>
                  <p className="text-sm text-gray-600">Cluster coordination and topic metadata</p>
                </div>
                <div className="border-l-4 border-purple-300 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Apache HBase</h4>
                  <p className="text-sm text-gray-600">Master election and region coordination</p>
                </div>
                <div className="border-l-4 border-purple-300 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Apache Solr</h4>
                  <p className="text-sm text-gray-600">SolrCloud configuration management</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">etcd Use Cases</h3>
              </div>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-300 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Kubernetes</h4>
                  <p className="text-sm text-gray-600">Cluster state storage and service discovery</p>
                </div>
                <div className="border-l-4 border-blue-300 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">CoreOS Fleet</h4>
                  <p className="text-sm text-gray-600">Distributed init system configuration</p>
                </div>
                <div className="border-l-4 border-blue-300 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Cloud Foundry</h4>
                  <p className="text-sm text-gray-600">Distributed locking and configuration</p>
                </div>
                <div className="border-l-4 border-blue-300 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Patroni</h4>
                  <p className="text-sm text-gray-600">PostgreSQL HA cluster management</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">When to Choose Which?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-2">Choose ZooKeeper if:</p>
                <ul className="space-y-1 ml-4">
                  <li>Working with Apache ecosystem (Hadoop, Kafka, HBase)</li>
                  <li>Need hierarchical data organization</li>
                  <li>Team has strong Java expertise</li>
                  <li>Mature, battle-tested solution required</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Choose etcd if:</p>
                <ul className="space-y-1 ml-4">
                  <li>Building modern cloud-native applications</li>
                  <li>Need simpler operations and deployment</li>
                  <li>Want gRPC/HTTP API for easy integration</li>
                  <li>Prefer MVCC and transaction support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <h3 className="font-semibold text-green-900 mb-2">Key Takeaways</h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li><span className="font-semibold">Both provide:</span> Distributed coordination, leader election, configuration management, and distributed locking</li>
          <li><span className="font-semibold">ZooKeeper:</span> Mature, Java-based, hierarchical model, widely used in Apache ecosystem</li>
          <li><span className="font-semibold">etcd:</span> Modern, Go-based, simpler operations, gRPC API, powers Kubernetes</li>
          <li><span className="font-semibold">Consensus:</span> ZAB vs Raft - both achieve similar goals with different approaches</li>
        </ul>
      </div>
    </div>
  );
};

export default EtcdZooKeeperComparison;