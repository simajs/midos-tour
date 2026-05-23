import { motion } from 'framer-motion';
import { useApi } from '../context/ApiContext';

interface FooterProps {
  onAdminClick: () => void;
}

export default function Footer({ onAdminClick }: FooterProps) {
  const { stats, dbConnected, isAuthenticated } = useApi();

  return (
    <footer className="relative py-6 px-4 border-t-2 border-pixel-yellow/10">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-sm">{stats?.visited || 0}/24</span>
            <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm">Visited</p>
          </div>
          <div className="text-center">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-green text-sm">{Number(stats?.balance || 0).toFixed(2)} DT</span>
            <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm">Balance</p>
          </div>
          <div className="text-center">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-blue text-sm">{stats?.inventoryCount || 0}</span>
            <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm">Items</p>
          </div>
          <div className="text-center">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-purple text-sm">{stats?.videos || 0}</span>
            <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm">Videos</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-pixel-white/5">
          <div>
            <p className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[10px] mb-1">MIDOS QUEST</p>

          </div>
        <a
          href="https://www.instagram.com/beastboy.design/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center font-[family-name:var(--font-family-vt)] text-pixel-white/20 text-sm mt-6 hover:text-pixel-white/50 transition"
        >
          BY QRISA © 2026 Midos Quest
        </a>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onAdminClick}
              className="font-[family-name:var(--font-family-pixel)] text-[8px] px-3 py-1.5 bg-pixel-gray text-pixel-white/50 hover:text-pixel-yellow transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAuthenticated ? 'ADMIN PANEL' : 'ADMIN LOGIN'}
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
