'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Package, DollarSign, Users, Clock, ArrowRight } from 'lucide-react';

interface Pool {
  id: string;
  slug: string;
  title: string;
  destination_city: 'Lusaka' | 'Ndola';
  container_type: '20ft' | '40ft';
  usable_ft3: number;
  announce_threshold_pct: number;
  status: 'collecting' | 'announced' | 'closed';
  is_public: boolean;
  created_at: string;
}

interface PoolStats {
  pool_id: string;
  total_ft3: number;
  total_internal_ft3: number;
  total_paid_ft3: number;
  est_revenue: number;
  pledge_count: number;
  pct_full: number;
}

interface PoolCardProps {
  pool: Pool;
  stats: PoolStats;
  variant?: 'compact' | 'detailed';
  index?: number;
}

export function PoolCard({ pool, stats, variant = 'detailed', index = 0 }: PoolCardProps) {
  const isThresholdReached = stats.pct_full >= pool.announce_threshold_pct;
  const remainingToThreshold = Math.max(0, 
    (pool.usable_ft3 * pool.announce_threshold_pct / 100) - stats.total_ft3
  );
  
  // Calculate days since creation for urgency
  const daysSince = Math.floor(
    (Date.now() - new Date(pool.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusConfig = {
    collecting: { 
      label: 'Open for Pledges', 
      color: 'bg-blue-100 text-blue-700',
      icon: '🟢'
    },
    announced: { 
      label: 'Announced', 
      color: 'bg-green-100 text-green-700',
      icon: '🎉'
    },
    closed: { 
      label: 'Closed', 
      color: 'bg-gray-100 text-gray-600',
      icon: '🔒'
    },
  };

  const status = statusConfig[pool.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="group"
    >
      <Link href={`/pool/${pool.slug}`}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚢</span>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {pool.title}
                </h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                <span>{status.icon}</span>
                {status.label}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>NorCal → {pool.destination_city}</span>
              <span className="text-gray-300">•</span>
              <span>{pool.container_type} container</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-3 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Container Fill</span>
              <span className={`text-sm font-bold ${isThresholdReached ? 'text-green-600' : 'text-gray-900'}`}>
                {stats.pct_full.toFixed(0)}% Full
              </span>
            </div>
            
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              {/* Threshold marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
                style={{ left: `${pool.announce_threshold_pct}%` }}
              />
              
              {/* Fill */}
              <motion.div
                className={`h-full rounded-full ${isThresholdReached ? 'bg-green-500' : 'bg-blue-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(stats.pct_full, 100)}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
              />
            </div>
            
            {/* Threshold indicator */}
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0%</span>
              <span className="text-orange-500">🎯 {pool.announce_threshold_pct}% goal</span>
              <span>100%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 p-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {stats.total_ft3.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">ft³ pledged</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  ${stats.est_revenue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">est. revenue</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {stats.pledge_count}
                </div>
                <div className="text-xs text-gray-500">pledges</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {daysSince}d
                </div>
                <div className="text-xs text-gray-500">since open</div>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="px-6 pb-6">
            {pool.status === 'collecting' && !isThresholdReached && (
              <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm text-orange-700">
                  <span className="font-semibold">{remainingToThreshold.toFixed(0)} ft³</span> more needed to reach announcement threshold!
                </p>
              </div>
            )}
            
            <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors group/btn">
              {pool.status === 'collecting' ? 'Pledge Your Space' : 'View Details'}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Compact version for lists
export function PoolCardCompact({ pool, stats, index = 0 }: PoolCardProps) {
  const isThresholdReached = stats.pct_full >= pool.announce_threshold_pct;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/pool/${pool.slug}`}>
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          {/* Progress Circle */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isThresholdReached ? '#10B981' : '#3B82F6'}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${stats.pct_full}, 100` }}
                transition={{ duration: 1, delay: index * 0.05 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {stats.pct_full.toFixed(0)}%
              </span>
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{pool.title}</h4>
            <p className="text-sm text-gray-500">
              {stats.total_ft3.toLocaleString()} ft³ • {stats.pledge_count} pledges • {pool.destination_city}
            </p>
          </div>
          
          {/* Arrow */}
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      </Link>
    </motion.div>
  );
}
