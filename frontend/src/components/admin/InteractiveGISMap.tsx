'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Beneficiary } from '@/types';
import { MapPin, AlertTriangle, Layers, Home, Info, ExternalLink, WifiOff, Map, Compass } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { useApp } from '@/lib/context/AppContext';

interface InteractiveGISMapProps {
  beneficiaries: Beneficiary[];
  selectedBeneficiaryId?: string;
  onSelectBeneficiary?: (beneficiary: Beneficiary) => void;
  filterPanchayat?: string;
}

// Inner Leaflet Map Component
function LeafletMapInner({
  beneficiaries,
  selectedBeneficiaryId,
  onSelectBeneficiary,
  filterPanchayat
}: InteractiveGISMapProps) {
  const { isOnline } = useApp();
  const [L, setL] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'osm' | 'cadastral'>('osm');

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // If offline, default or recommend cadastral view
  useEffect(() => {
    if (!isOnline) {
      setViewMode('cadastral');
    }
  }, [isOnline]);

  const filteredBeneficiaries = useMemo(() => {
    if (!filterPanchayat || filterPanchayat === 'ALL') {
      return beneficiaries;
    }
    return beneficiaries.filter(b => b.gramPanchayat === filterPanchayat);
  }, [beneficiaries, filterPanchayat]);

  const mapCenter: [number, number] = useMemo(() => {
    if (filteredBeneficiaries.length > 0) {
      return [filteredBeneficiaries[0].latitude, filteredBeneficiaries[0].longitude];
    }
    return [23.3648, 85.3282];
  }, [filteredBeneficiaries]);

  // Offline Cadastral Parcel Map (Vector Bhu-Naksha)
  if (viewMode === 'cadastral' || !isOnline) {
    return (
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 bg-[#06101e] p-4 flex flex-col justify-between shadow-sm select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between z-10 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-white">
              Offline Cadastral Village Map (Bhu-Naksha Vector Engine)
            </span>
            <Badge size="sm" variant={isOnline ? 'verified' : 'pending'}>
              {isOnline ? 'Vector Overlay' : 'Offline Safe'}
            </Badge>
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'cadastral' ? 'osm' : 'cadastral')}
            className="text-[11px] text-teal-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 cursor-pointer"
          >
            Switch to {viewMode === 'cadastral' ? 'OpenStreetMap Tiles' : 'Cadastral View'}
          </button>
        </div>

        {/* SVG Vector Cadastral Grid */}
        <div className="relative flex-1 my-3 bg-[#0a1628] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="1" />
              </pattern>
            </defs>

            <rect width="1000" height="600" fill="url(#grid)" />

            {/* PMGSY All-Weather Village Arterial Road */}
            <path
              d="M 50,320 Q 300,350 500,280 T 950,260"
              fill="none"
              stroke="#64748b"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 50,320 Q 300,350 500,280 T 950,260"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="8,8"
            />
            <text x="70" y="305" fill="#94a3b8" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              PMGSY Rural Road (Panchayat Main)
            </text>

            {/* Cadastral Parcel Boundaries (Khata / Khesra Plots) */}
            <polygon points="120,80 320,70 340,240 130,230" fill="rgba(15, 23, 42, 0.6)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="210" y="160" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Plot 88 (Sunita Devi)</text>

            <polygon points="380,60 620,50 630,220 390,230" fill="rgba(15, 23, 42, 0.6)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="500" y="130" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Plot 104 (Rameshwar Munda)</text>

            <polygon points="660,70 880,80 890,240 670,230" fill="rgba(15, 23, 42, 0.6)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="770" y="150" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle">Plot 401 (Parvati Mahato)</text>

            {/* Geo-Collision Zone Visualization (<15m) */}
            <circle cx="510" cy="180" r="42" fill="rgba(239, 68, 68, 0.18)" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" />
            <text x="510" y="235" fill="#f87171" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
              ⚠️ Geo-Collision Buffer (8.2m Delta)
            </text>

            {/* Plotted Houses */}
            {filteredBeneficiaries.map((b, idx) => {
              const isFlagged = b.overallStatus === 'flagged';
              const px = 180 + (idx * 115) + (isFlagged ? -15 : 0);
              const py = 150 + ((idx % 3) * 60);

              return (
                <g 
                  key={b.id} 
                  className="cursor-pointer" 
                  onClick={() => onSelectBeneficiary?.(b)}
                >
                  <circle
                    cx={px}
                    cy={py}
                    r="14"
                    fill={isFlagged ? '#ef4444' : b.currentStage === 'completion' ? '#10b981' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <text x={px} y={py + 4} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {isFlagged ? '!' : b.currentStage[0].toUpperCase()}
                  </text>
                  <text x={px} y={py + 26} fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {b.name.split(' ')[1] || b.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Bottom Legend */}
        <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <span>Vector Cadastral Overlay: Operates with 0% network in deep rural topography</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Under Construction
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Collision Alert
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!L) {
    return (
      <div className="w-full h-[480px] bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Initializing GIS Geoportal &amp; OpenStreetMap Tiles...</span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle } = require('react-leaflet');

  const createCustomIcon = (b: Beneficiary) => {
    const isFlagged = b.overallStatus === 'flagged' || b.flags.some(f => !f.resolved);
    const stage = b.currentStage;

    const colors: Record<string, string> = {
      foundation: '#3b82f6',
      plinth: '#06b6d4',
      lintel: '#8b5cf6',
      completion: '#10b981'
    };

    const pinColor = isFlagged ? '#ef4444' : colors[stage] || '#3b82f6';

    const html = `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${isFlagged ? `
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        ` : ''}
        <div style="
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: ${pinColor}; 
          border: 3px solid #ffffff; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 13px;
        ">
          ${isFlagged ? '!' : stage[0].toUpperCase()}
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Top Map Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        <button
          onClick={() => setViewMode('cadastral')}
          className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-teal-800 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Map className="w-3.5 h-3.5 text-teal-600" />
          <span>Offline Cadastral Map</span>
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2 pointer-events-auto max-w-[210px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-100 pb-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>Stage &amp; GIS Status</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white"></span>
            <span>Foundation Stage</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-cyan-500 border border-white"></span>
            <span>Plinth Stage</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-purple-500 border border-white"></span>
            <span>Lintel Stage</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
            <span>Completed Pucca House</span>
          </div>
          <div className="flex items-center gap-2 text-red-700 font-semibold pt-1 border-t border-slate-100">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white animate-pulse"></span>
            <span>Flagged / Geo-Collision</span>
          </div>
        </div>
      </div>

      <MapContainer
        key={`${mapCenter[0]}-${mapCenter[1]}`}
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%', background: '#090d16' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredBeneficiaries.map((b) => {
          const isFlagged = b.overallStatus === 'flagged' || b.flags.some(f => !f.resolved);

          return (
            <React.Fragment key={b.id}>
              <Circle
                center={[b.latitude, b.longitude]}
                radius={15}
                pathOptions={{
                  color: isFlagged ? '#ef4444' : '#0d9488',
                  fillColor: isFlagged ? '#ef4444' : '#0d9488',
                  fillOpacity: isFlagged ? 0.35 : 0.15,
                  weight: isFlagged ? 2 : 1,
                  dashArray: isFlagged ? '4, 4' : undefined
                }}
              />

              <Marker
                position={[b.latitude, b.longitude]}
                icon={createCustomIcon(b)}
                eventHandlers={{
                  click: () => onSelectBeneficiary?.(b)
                }}
              >
                <Popup className="gov-custom-popup">
                  <div className="p-1 max-w-xs text-slate-900">
                    <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-1.5">
                      <span className="font-bold text-sm text-slate-900 leading-tight">
                        {b.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFlagged ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isFlagged ? 'FLAGGED' : b.currentStage.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-1">
                      <strong>PMAY-ID:</strong> {b.pmayId}
                    </p>
                    <p className="text-xs text-slate-600 mb-1">
                      <strong>Cadastral:</strong> {b.khasraNo || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-600 mb-2">
                      <strong>GPS:</strong> {b.latitude.toFixed(5)}° N, {b.longitude.toFixed(5)}° E (Alt: {b.altitude || 340}m)
                    </p>

                    <div className="text-xs text-slate-700 flex justify-between font-semibold border-t pt-1">
                      <span>DBT Released:</span>
                      <span className="text-emerald-700 font-bold">
                        ₹{b.totalDbtReleased.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

export const InteractiveGISMap = dynamic(
  () => Promise.resolve(LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading GIS Map Framework...</span>
        </div>
      </div>
    )
  }
);
