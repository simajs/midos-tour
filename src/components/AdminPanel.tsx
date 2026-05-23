import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../context/ApiContext';
import tunisiaSvg from '../assets/tunisia.svg';

type Tab = 'governorates' | 'inventory' | 'logs' | 'polls';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('governorates');
  const { logout, dbConnected, stats } = useApi();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-pixel-dark overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-pixel-gray border-b border-pixel-yellow/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-sm">ADMIN PANEL</h1>
          <span className={`text-xs px-2 py-0.5 rounded ${dbConnected ? 'bg-pixel-green/20 text-pixel-green' : 'bg-pixel-red/20 text-pixel-red'}`}>
            {dbConnected ? 'DB Connected' : 'BB STUDIO'}
          </span>
          <span className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[9px]">
            Balance: {Number(stats?.balance || 0).toFixed(2)} DT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleLogout} className="admin-btn admin-btn-danger text-sm px-3 py-1">Logout</button>
          <button onClick={onClose} className="admin-btn bg-pixel-gray text-pixel-white/60 text-sm px-3 py-1">Close</button>
        </div>
      </div>

      <div className="flex border-b border-pixel-yellow/20">
        {(['governorates', 'inventory', 'logs', 'polls'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-[family-name:var(--font-family-pixelify)] text-base capitalize transition-all ${activeTab === tab
              ? 'text-pixel-yellow border-b-2 border-pixel-yellow bg-pixel-yellow/5'
              : 'text-pixel-white/40 hover:text-pixel-white/60'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
        {activeTab === 'governorates' && <GovernoratesTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'polls' && <PollsTab />}
      </div>
    </motion.div>
  );
}

function GovernoratesTab() {
  const { governorates, updateGovernorate, addGovernorate, deleteGovernorate } = useApi();
  const [editing, setEditing] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    region: 'north',
    visited: false,
    completed: false,
    visit_day: '',
    story: '',
    youtube_url: '',
    x_position: '',
    y_position: '',
    positionMode: 'percent',
    x_pixel: '',
    y_pixel: ''
  });

  const [newGov, setNewGov] = useState({
    name: '',
    name_ar: '',
    region: 'north',
    visited: false,
    completed: false,
    visit_day: '',
    story: '',
    youtube_url: '',
    x_position: '50',
    y_position: '50',
    positionMode: 'percent',
    x_pixel: '638',
    y_pixel: '1250'
  });

  const handleEdit = (gov: typeof governorates[0]) => {
    setEditing(gov.id);
    setFormData({
      name: gov.name || '',
      name_ar: gov.name_ar || '',
      region: gov.region || 'north',
      visited: !!gov.visited,
      completed: !!gov.completed,
      visit_day: String(gov.visit_day || ''),
      story: gov.story || '',
      youtube_url: gov.youtube_url || '',
      x_position: String(gov.x_position || '50'),
      y_position: String(gov.y_position || '50'),
      positionMode: 'percent',
      x_pixel: String(Math.round(((gov.x_position || 50.0) / 100) * 1275)),
      y_pixel: String(Math.round(((gov.y_position || 50.0) / 100) * 2500))
    });
  };

  const handleSave = async () => {
    if (editing) {
      if (!formData.name.trim() || !formData.name_ar.trim()) {
        alert('Name and Arabic name are required!');
        return;
      }
      if (formData.visited && !formData.visit_day.trim()) {
        alert('Day number is required when a governorate is marked as visited!');
        return;
      }

      let finalX = parseFloat(formData.x_position) || 50.0;
      let finalY = parseFloat(formData.y_position) || 50.0;
      if (formData.positionMode === 'pixel') {
        const pxX = parseFloat(formData.x_pixel) || 0;
        const pxY = parseFloat(formData.y_pixel) || 0;
        finalX = (pxX / 1275) * 100;
        finalY = (pxY / 2500) * 100;
      }

      await updateGovernorate(editing, {
        name: formData.name,
        name_ar: formData.name_ar,
        region: formData.region,
        visited: formData.visited ? 1 : 0,
        completed: formData.completed ? 1 : 0,
        visit_day: formData.visited && formData.visit_day ? Number(formData.visit_day) : null,
        story: formData.story,
        youtube_url: formData.youtube_url || null,
        x_position: finalX,
        y_position: finalY
      });
      setEditing(null);
    }
  };

  const handleAddGov = async () => {
    if (!newGov.name.trim() || !newGov.name_ar.trim()) {
      alert('Name and Arabic name are required!');
      return;
    }
    if (newGov.visited && !newGov.visit_day.trim()) {
      alert('Day number is required when a governorate is marked as visited!');
      return;
    }

    let finalX = parseFloat(newGov.x_position) || 50.0;
    let finalY = parseFloat(newGov.y_position) || 50.0;
    if (newGov.positionMode === 'pixel') {
      const pxX = parseFloat(newGov.x_pixel) || 0;
      const pxY = parseFloat(newGov.y_pixel) || 0;
      finalX = (pxX / 1275) * 100;
      finalY = (pxY / 2500) * 100;
    }

    await addGovernorate({
      name: newGov.name,
      name_ar: newGov.name_ar,
      region: newGov.region,
      x_position: finalX,
      y_position: finalY,
      visited: newGov.visited ? 1 : 0,
      completed: newGov.completed ? 1 : 0,
      visit_day: newGov.visited && newGov.visit_day ? Number(newGov.visit_day) : null,
      story: newGov.story,
      youtube_url: newGov.youtube_url || null
    });

    setNewGov({
      name: '',
      name_ar: '',
      region: 'north',
      visited: false,
      completed: false,
      visit_day: '',
      story: '',
      youtube_url: '',
      x_position: '50',
      y_position: '50',
      positionMode: 'percent',
      x_pixel: '638',
      y_pixel: '1250'
    });
    setShowAddForm(false);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showAddForm && editing === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const clickY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const pxX = Math.round((clickX / 100) * 1275);
    const pxY = Math.round((clickY / 100) * 2500);

    if (showAddForm) {
      setNewGov({
        ...newGov,
        x_position: String(clickX.toFixed(2)),
        y_position: String(clickY.toFixed(2)),
        x_pixel: String(pxX),
        y_pixel: String(pxY)
      });
    } else if (editing !== null) {
      setFormData({
        ...formData,
        x_position: String(clickX.toFixed(2)),
        y_position: String(clickY.toFixed(2)),
        x_pixel: String(pxX),
        y_pixel: String(pxY)
      });
    }
  };

  const sortedGovs = [...governorates].sort((a, b) => {
    if (a.visited && b.visited) {
      return (a.visit_day || 0) - (b.visit_day || 0) || a.id - b.id;
    }
    if (a.visited) return -1;
    if (b.visited) return 1;
    return a.id - b.id;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowAddForm(!showAddForm)} className="admin-btn admin-btn-primary">
            {showAddForm ? 'Cancel' : '+ Add Governorate'}
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pixel-panel p-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Gov Name (English)" value={newGov.name} onChange={e => setNewGov({ ...newGov, name: e.target.value })} className="admin-input" />
                <input type="text" placeholder="Gov Name (Arabic)" value={newGov.name_ar} onChange={e => setNewGov({ ...newGov, name_ar: e.target.value })} className="admin-input" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Region</label>
                  <select value={newGov.region} onChange={e => setNewGov({ ...newGov, region: e.target.value })} className="admin-input">
                    <option value="north">North</option>
                    <option value="center">Center</option>
                    <option value="south">South</option>
                  </select>
                </div>
                <div>
                  <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Visited</label>
                  <input type="checkbox" checked={newGov.visited} onChange={e => setNewGov({ ...newGov, visited: e.target.checked })} className="mt-2 block" />
                </div>
                <div>
                  <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Completed</label>
                  <input type="checkbox" checked={newGov.completed} onChange={e => setNewGov({ ...newGov, completed: e.target.checked })} className="mt-2 block" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Visit Day</label>
                  <input type="number" placeholder="Day number" value={newGov.visit_day} onChange={e => setNewGov({ ...newGov, visit_day: e.target.value })} className="admin-input" min="1" />
                </div>
                <div>
                  <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">YouTube Video URL</label>
                  <input type="text" placeholder="YouTube URL" value={newGov.youtube_url} onChange={e => setNewGov({ ...newGov, youtube_url: e.target.value })} className="admin-input" />
                </div>
              </div>

              <div>
                <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Coordinate Placement Mode</label>
                <select value={newGov.positionMode} onChange={e => setNewGov({ ...newGov, positionMode: e.target.value })} className="admin-input">
                  <option value="percent">Percentages (0% - 100%)</option>
                  <option value="pixel">Photoshop Pixels (1275px x 2500px)</option>
                </select>
              </div>

              {newGov.positionMode === 'percent' ? (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="X Position (%)" value={newGov.x_position} onChange={e => setNewGov({ ...newGov, x_position: e.target.value })} className="admin-input" min="0" max="100" step="0.1" />
                  <input type="number" placeholder="Y Position (%)" value={newGov.y_position} onChange={e => setNewGov({ ...newGov, y_position: e.target.value })} className="admin-input" min="0" max="100" step="0.1" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Photoshop X (px, 0-1275)" value={newGov.x_pixel} onChange={e => setNewGov({ ...newGov, x_pixel: e.target.value })} className="admin-input" min="0" max="1275" />
                  <input type="number" placeholder="Photoshop Y (px, 0-2500)" value={newGov.y_pixel} onChange={e => setNewGov({ ...newGov, y_pixel: e.target.value })} className="admin-input" min="0" max="2500" />
                </div>
              )}

              <div>
                <textarea placeholder="Story text..." value={newGov.story} onChange={e => setNewGov({ ...newGov, story: e.target.value })} className="admin-input" rows={2} />
              </div>

              <button onClick={handleAddGov} className="admin-btn admin-btn-primary w-full">Save New Governorate</button>
            </motion.div>
          )}
        </AnimatePresence>

        {sortedGovs.map(gov => (
          <div key={gov.id} className="pixel-panel p-3">
            {editing === gov.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Name (English)</label>
                    <input type="text" placeholder="Gov Name (English)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="admin-input" />
                  </div>
                  <div>
                    <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Name (Arabic)</label>
                    <input type="text" placeholder="Gov Name (Arabic)" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} className="admin-input" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Region</label>
                    <select value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} className="admin-input">
                      <option value="north">North</option>
                      <option value="center">Center</option>
                      <option value="south">South</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Visited</label>
                    <label className="flex items-center gap-2 mt-2">
                      <input type="checkbox" checked={formData.visited} onChange={e => setFormData({ ...formData, visited: e.target.checked })} />
                      <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/60 text-xs">Visited</span>
                    </label>
                  </div>
                  <div>
                    <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Completed</label>
                    <label className="flex items-center gap-2 mt-2">
                      <input type="checkbox" checked={formData.completed} onChange={e => setFormData({ ...formData, completed: e.target.checked })} />
                      <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/60 text-xs">Completed</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Visit Day (Mandatory if Visited)</label>
                    <input
                      type="number"
                      placeholder="Day number"
                      value={formData.visit_day}
                      onChange={e => setFormData({ ...formData, visit_day: e.target.value })}
                      className="admin-input"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">YouTube Media URL</label>
                    <input
                      type="text"
                      placeholder="YouTube Video URL"
                      value={formData.youtube_url}
                      onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Coordinate Placement Mode</label>
                  <select
                    value={formData.positionMode}
                    onChange={e => setFormData({ ...formData, positionMode: e.target.value })}
                    className="admin-input"
                  >
                    <option value="percent">Percentages (0% - 100%)</option>
                    <option value="pixel">Photoshop Pixels (1275px x 2500px)</option>
                  </select>
                </div>

                {formData.positionMode === 'percent' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">X Position (%)</label>
                      <input
                        type="number"
                        placeholder="X (%)"
                        value={formData.x_position}
                        onChange={e => setFormData({ ...formData, x_position: e.target.value })}
                        className="admin-input"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Y Position (%)</label>
                      <input
                        type="number"
                        placeholder="Y (%)"
                        value={formData.y_position}
                        onChange={e => setFormData({ ...formData, y_position: e.target.value })}
                        className="admin-input"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Photoshop X (px)</label>
                      <input
                        type="number"
                        placeholder="X (px, 0-1275)"
                        value={formData.x_pixel}
                        onChange={e => setFormData({ ...formData, x_pixel: e.target.value })}
                        className="admin-input"
                        min="0"
                        max="1275"
                      />
                    </div>
                    <div>
                      <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Photoshop Y (px)</label>
                      <input
                        type="number"
                        placeholder="Y (px, 0-2500)"
                        value={formData.y_pixel}
                        onChange={e => setFormData({ ...formData, y_pixel: e.target.value })}
                        className="admin-input"
                        min="0"
                        max="2500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">Story</label>
                  <textarea
                    placeholder="Story"
                    value={formData.story}
                    onChange={e => setFormData({ ...formData, story: e.target.value })}
                    className="admin-input"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="admin-btn admin-btn-primary">Save</button>
                  <button onClick={() => setEditing(null)} className="admin-btn bg-pixel-gray text-pixel-white/60">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${gov.completed ? 'bg-pixel-green' : gov.visited ? 'bg-pixel-yellow' : 'bg-pixel-white/20'}`} />
                  <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/80">{gov.name}</span>
                  {gov.visited && <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm">Day {gov.visit_day}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(gov)} className="admin-btn bg-pixel-gray text-pixel-yellow text-sm px-3 py-1">Edit</button>
                  <button onClick={() => { if (confirm(`Are you sure you want to delete ${gov.name}?`)) deleteGovernorate(gov.id); }} className="admin-btn admin-btn-danger text-sm px-3 py-1">Del</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-4 bg-pixel-gray/40 border border-pixel-yellow/15 p-4 rounded flex flex-col items-center select-none">
        <h3 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-xs mb-2 tracking-wider">
          PLACEMENT SIMULATOR
        </h3>
        <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-4 text-center">
          {showAddForm
            ? "Click on the map to set coordinates for the NEW governorate"
            : editing !== null
              ? `Click on the map to set coordinates for ${formData.name || 'selected governorate'}`
              : "Click '+ Add' or 'Edit' to place coordinates interactively"}
        </p>

        <div
          className={`relative w-full max-w-[280px] aspect-[2/3] border border-pixel-white/10 bg-pixel-dark rounded overflow-hidden select-none ${showAddForm || editing !== null ? 'cursor-crosshair' : 'opacity-70 pointer-events-none'
            }`}
          onClick={handleMapClick}
        >
          <img src={tunisiaSvg} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-85" />

          {governorates.map(gov => {
            if (editing === gov.id) return null;
            return (
              <div
                key={gov.id}
                className="absolute w-2 h-2 rounded-full border border-pixel-white/30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${gov.x_position}%`,
                  top: `${gov.y_position}%`,
                  backgroundColor: gov.completed ? '#4ade80' : gov.visited ? '#ffd54a' : 'rgba(255,255,255,0.1)'
                }}
              />
            );
          })}

          {(showAddForm || editing !== null) && (
            <div
              className="absolute w-4 h-4 rounded-full bg-pixel-red/80 border-2 border-pixel-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping z-10"
              style={{
                left: `${showAddForm ? newGov.x_position : formData.x_position}%`,
                top: `${showAddForm ? newGov.y_position : formData.y_position}%`,
              }}
            />
          )}
          {(showAddForm || editing !== null) && (
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-pixel-red border border-pixel-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.8)] z-20"
              style={{
                left: `${showAddForm ? newGov.x_position : formData.x_position}%`,
                top: `${showAddForm ? newGov.y_position : formData.y_position}%`,
              }}
            />
          )}
        </div>

        {(showAddForm || editing !== null) && (
          <div className="w-full mt-4 bg-pixel-dark/50 border border-pixel-white/5 p-2 rounded text-center space-y-1">
            <div className="font-[family-name:var(--font-family-pixelify)] text-xs text-pixel-white/60">
              Selected Point:
            </div>
            <div className="font-[family-name:var(--font-family-vt)] text-sm text-pixel-yellow">
              X: {Number(showAddForm ? newGov.x_position : formData.x_position).toFixed(2)}% |
              Y: {Number(showAddForm ? newGov.y_position : formData.y_position).toFixed(2)}%
            </div>
            <div className="font-[family-name:var(--font-family-vt)] text-xs text-pixel-white/40">
              Photoshop: X: {Math.round(((showAddForm ? parseFloat(newGov.x_position) : parseFloat(formData.x_position)) / 100) * 1275)}px |
              Y: {Math.round(((showAddForm ? parseFloat(newGov.y_position) : parseFloat(formData.y_position)) / 100) * 2500)}px
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryTab() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, sellInventoryItem, stats } = useApi();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [sellQty, setSellQty] = useState<{ [key: number]: string }>({});
  const [sellDay, setSellDay] = useState<{ [key: number]: string }>({});
  const [sellPrice, setSellPrice] = useState<{ [key: number]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setQuantity('1');
    setPrice('');
    setDescription('');
    setImage(null);
    setShowForm(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addInventoryItem({
      name,
      quantity: parseInt(quantity) || 1,
      price: parseFloat(price) || 0,
      description,
      image
    });
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingId || !name.trim()) return;
    await updateInventoryItem(editingId, {
      name,
      quantity: parseInt(quantity) || 1,
      price: parseFloat(price) || 0,
      description,
      image
    });
    resetForm();
  };

  const handleEdit = (item: typeof inventory[0]) => {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(String(item.quantity));
    setPrice(String(item.price || ''));
    setDescription(item.description || '');
    setImage(item.image);
    setShowForm(true);
  };

  const handleSell = async (id: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const qty = parseInt(sellQty[id]) || 0;
    if (qty <= 0) {
      alert("Please enter a valid quantity to sell!");
      return;
    }

    if (qty > item.quantity) {
      alert(`You only have ${item.quantity} units of this item in your backpack. You cannot sell ${qty}!`);
      return;
    }

    const day = parseInt(sellDay[id]) || 1;
    const sprice = sellPrice[id] !== undefined && sellPrice[id] !== '' ? parseFloat(sellPrice[id]) : item.price;

    const result = await sellInventoryItem(id, qty, day, sprice);
    if (result) {
      alert(`Sold! Earned ${Number(result.earnings).toFixed(2)} DT. New balance: ${Number(result.balance).toFixed(2)} DT`);
      setSellQty({ ...sellQty, [id]: '' });
      setSellDay({ ...sellDay, [id]: '' });
      setSellPrice({ ...sellPrice, [id]: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="admin-btn admin-btn-primary">
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
        <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40">
          Balance: <span className="text-pixel-yellow">{Number(stats?.balance || 0).toFixed(2)} DT</span>
        </span>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pixel-panel p-4 space-y-3"
          >
            <input type="text" placeholder="Item name" value={name} onChange={e => setName(e.target.value)} className="admin-input" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className="admin-input" min="1" />
              <input type="number" placeholder="Price (optional)" value={price} onChange={e => setPrice(e.target.value)} className="admin-input" step="0.01" />
            </div>
            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="admin-input" />
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="admin-btn bg-pixel-gray text-pixel-white/60">Upload Image</button>
              {image && <img src={image} alt="Preview" className="w-10 h-10 object-contain" />}
            </div>
            <button onClick={editingId ? handleUpdate : handleAdd} className="admin-btn admin-btn-primary">
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {inventory.map(item => {
          const qtyVal = parseInt(sellQty[item.id]) || 0;
          const priceVal = sellPrice[item.id] !== undefined && sellPrice[item.id] !== '' ? parseFloat(sellPrice[item.id]) : item.price;
          const proceeds = priceVal * qtyVal;

          return (
            <div key={item.id} className="pixel-panel p-3">
              <div className="flex items-center gap-3 mb-2">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-pixel-gray rounded flex items-center justify-center text-lg">📦</div>
                )}
                <div className="flex-1">
                  <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/80">{item.name}</p>
                  <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-sm">
                    Qty: {item.quantity} {item.price > 0 && `• Price: ${item.price} DT`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="admin-btn bg-pixel-gray text-pixel-yellow text-xs px-2 py-1">Edit</button>
                  <button onClick={() => deleteInventoryItem(item.id)} className="admin-btn admin-btn-danger text-xs px-2 py-1">Del</button>
                </div>
              </div>

              {item.quantity > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-pixel-white/5">
                  <div className="flex items-center gap-1">
                    <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs">Qty:</span>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={sellQty[item.id] || ''}
                      onChange={e => setSellQty({ ...sellQty, [item.id]: e.target.value })}
                      className="admin-input w-16 text-sm"
                      min="1"
                      max={item.quantity}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs">Day:</span>
                    <input
                      type="number"
                      placeholder="Day"
                      value={sellDay[item.id] || ''}
                      onChange={e => setSellDay({ ...sellDay, [item.id]: e.target.value })}
                      className="admin-input w-16 text-sm"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs">Price:</span>
                    <input
                      type="number"
                      placeholder={`Sell Price (Buy: ${item.price})`}
                      value={sellPrice[item.id] || ''}
                      onChange={e => setSellPrice({ ...sellPrice, [item.id]: e.target.value })}
                      className="admin-input w-28 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <button onClick={() => handleSell(item.id)} className="admin-btn bg-pixel-green/20 text-pixel-green text-xs px-3 py-1 ml-auto">
                    Sell (+{Number(proceeds).toFixed(2)} DT)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LogsTab() {
  const { logs, addLog, deleteLog, stats } = useApi();
  const [showForm, setShowForm] = useState(false);
  const [day, setDay] = useState('1');
  const [type, setType] = useState<'earned' | 'spent'>('earned');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    if (!description.trim() || !amount) return;
    await addLog(parseInt(day), type, parseFloat(amount), description);
    setShowForm(false);
    setDay('1');
    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-primary">
          {showForm ? 'Cancel' : '+ Add Log'}
        </button>
        <div className="flex gap-3">
          <span className="font-[family-name:var(--font-family-vt)] text-pixel-green">+{Number(stats?.totalEarned || 0).toFixed(2)}</span>
          <span className="font-[family-name:var(--font-family-vt)] text-pixel-red">-{Number(stats?.totalSpent || 0).toFixed(2)}</span>
          <span className="font-[family-name:var(--font-family-vt)] text-pixel-yellow">= {Number(stats?.balance || 0).toFixed(2)} DT</span>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pixel-panel p-4 space-y-3"
          >
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Day" value={day} onChange={e => setDay(e.target.value)} className="admin-input" min="1" />
              <select value={type} onChange={e => setType(e.target.value as 'earned' | 'spent')} className="admin-input">
                <option value="earned">Earned (+)</option>
                <option value="spent">Spent (-)</option>
              </select>
              <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="admin-input" step="0.01" />
            </div>
            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="admin-input" />
            <button onClick={handleAdd} className="admin-btn admin-btn-primary">Add Log</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="pixel-panel p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-[family-name:var(--font-family-pixel)] text-[7px] bg-pixel-yellow/10 text-pixel-yellow px-2 py-1 rounded">D{log.day_number}</span>
              <span className={`font-[family-name:var(--font-family-pixel)] text-[8px] px-2 py-0.5 rounded ${log.type === 'earned' ? 'bg-pixel-green/20 text-pixel-green' : 'bg-pixel-red/20 text-pixel-red'
                }`}>
                {log.type === 'earned' ? '+' : '-'}{Number(log.amount).toFixed(2)}
              </span>
              <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/70 text-sm">{log.description}</span>
            </div>
            <button onClick={() => deleteLog(log.id)} className="text-pixel-red text-xs hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PollsTab() {
  const { polls, governorates, addPoll, updatePoll, deletePoll } = useApi();
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [gov1, setGov1] = useState('');
  const [gov2, setGov2] = useState('');
  const [gov3, setGov3] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [initialCorrectGovId, setInitialCorrectGovId] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [correctGovIds, setCorrectGovIds] = useState<{ [key: number]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePoll = async () => {
    if (!question.trim() || !gov1 || !gov2 || !gov3) {
      alert('Question and exactly 3 options are required!');
      return;
    }
    if (gov1 === gov2 || gov2 === gov3 || gov1 === gov3) {
      alert('Options must be unique governorates!');
      return;
    }

    const hours = parseFloat(durationHours) || 24;
    const endTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    await addPoll({
      question,
      goves: [parseInt(gov1), parseInt(gov2), parseInt(gov3)],
      image,
      end_time: endTime,
      next_gov_id: initialCorrectGovId ? parseInt(initialCorrectGovId) : null
    });

    setQuestion('');
    setGov1('');
    setGov2('');
    setGov3('');
    setDurationHours('24');
    setInitialCorrectGovId('');
    setImage(null);
    setShowForm(false);
  };

  const handleResolvePoll = async (pollId: number) => {
    const correctId = correctGovIds[pollId];
    if (!correctId) {
      alert('Please select the correct governorate first!');
      return;
    }

    if (confirm('Are you sure you want to resolve this poll? This will set the final answer and reveal results.')) {
      await updatePoll(pollId, { next_gov_id: parseInt(correctId) });
    }
  };

  const getGovName = (id: number) => {
    const gov = governorates.find(g => g.id === id);
    return gov ? `${gov.name} (${gov.name_ar})` : `Gov #${id}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { setQuestion(''); setGov1(''); setGov2(''); setGov3(''); setImage(null); setShowForm(!showForm); }} className="admin-btn admin-btn-primary">
          {showForm ? 'Cancel' : '+ Create Travel Poll'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pixel-panel p-4 space-y-3"
          >
            <div>
              <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">
                Question
              </label>
              <input
                type="text"
                placeholder="Where will Midos travel next?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="admin-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">
                  Option 1
                </label>
                <select value={gov1} onChange={e => setGov1(e.target.value)} className="admin-input">
                  <option value="">Choose Governorate</option>
                  {governorates.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.name_ar})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">
                  Option 2
                </label>
                <select value={gov2} onChange={e => setGov2(e.target.value)} className="admin-input">
                  <option value="">Choose Governorate</option>
                  {governorates.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.name_ar})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">
                  Option 3
                </label>
                <select value={gov3} onChange={e => setGov3(e.target.value)} className="admin-input">
                  <option value="">Choose Governorate</option>
                  {governorates.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.name_ar})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">
                  Voting Duration
                </label>
                <select value={durationHours} onChange={e => setDurationHours(e.target.value)} className="admin-input">
                  <option value="1">1 Hour</option>
                  <option value="6">6 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="48">48 Hours (2 Days)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">168 Hours (1 Week)</option>
                </select>
              </div>
              <div>
                <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">
                  Custom Duration (Hours)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="24"
                  value={durationHours}
                  onChange={e => setDurationHours(e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">
                Correct Governorate (Optional - can be set later)
              </label>
              <select value={initialCorrectGovId} onChange={e => setInitialCorrectGovId(e.target.value)} className="admin-input">
                <option value="">Choose Correct Option later</option>
                {gov1 && <option value={gov1}>{getGovName(parseInt(gov1))}</option>}
                {gov2 && <option value={gov2}>{getGovName(parseInt(gov2))}</option>}
                {gov3 && <option value={gov3}>{getGovName(parseInt(gov3))}</option>}
              </select>
            </div>

            <div>
              <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs mb-1">
                Travel Image Hint (optional)
              </label>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="admin-btn bg-pixel-gray text-pixel-white/60 text-sm">
                  Upload Image
                </button>
                {image && <img src={image} alt="Preview" className="w-10 h-10 object-contain border border-pixel-yellow/30" />}
              </div>
            </div>

            <button onClick={handleCreatePoll} className="admin-btn admin-btn-primary w-full">
              Create Poll ⚔️
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {polls.map(poll => {
          const isResolved = poll.next_gov_id !== null;
          const isExpired = poll.end_time ? Date.now() >= new Date(poll.end_time).getTime() : false;
          const totalVotes = poll.votes.length;
          const correctVotes = poll.votes.filter(v => v.vote === poll.next_gov_id).length;
          const winners = poll.votes.filter(v => v.vote === poll.next_gov_id);

          return (
            <div key={poll.id} className={`pixel-panel p-4 border rounded space-y-3 ${!isResolved && isExpired ? 'border-pixel-red/50 bg-pixel-red/5' : 'border-pixel-white/10'
              }`}>
              {!isResolved && isExpired && (
                <div className="bg-pixel-red/20 border border-pixel-red/45 p-2 rounded text-center animate-pulse flex items-center justify-center gap-2">
                  <span className="text-sm">⚠️</span>
                  <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-red text-xs font-bold uppercase">
                    Voting completed! You need to select the correct governorate.
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className={`font-[family-name:var(--font-family-pixel)] text-[7px] px-2 py-0.5 rounded ${isResolved
                    ? 'bg-pixel-green/20 text-pixel-green'
                    : isExpired
                      ? 'bg-pixel-red/20 text-pixel-red'
                      : 'bg-pixel-yellow/20 text-pixel-yellow'
                    }`}>
                    {isResolved ? 'RESOLVED' : isExpired ? 'CLOSED (AWAITING RESOLUTION)' : 'ACTIVE'}
                  </span>
                  <h4 className="font-[family-name:var(--font-family-pixelify)] text-pixel-white text-base font-bold">
                    {poll.question}
                  </h4>
                  <div className="space-y-0.5">
                    <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-xs">
                      Created on: {new Date(poll.created_at).toLocaleString()}
                    </p>
                    {poll.end_time && (
                      <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs">
                        Deadline: {new Date(poll.end_time).toLocaleString()}
                        {!isResolved && !isExpired && (
                          <span className="text-pixel-yellow ml-2">
                            (Ends in {Math.max(0, Math.round((new Date(poll.end_time).getTime() - Date.now()) / (1000 * 60 * 60)))}h)
                          </span>
                        )}
                        {!isResolved && isExpired && (
                          <span className="text-pixel-red ml-2 font-bold animate-pulse">
                            (TIMER COMPLETED!)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => { if (confirm('Delete this poll?')) deletePoll(poll.id); }} className="admin-btn admin-btn-danger text-xs px-2 py-1">
                  Delete
                </button>
              </div>

              {poll.image && (
                <div className="h-20 w-32 border border-pixel-white/5 rounded overflow-hidden">
                  <img src={poll.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-pixel-white/5 pt-3">
                <div className="space-y-1">
                  <h5 className="font-[family-name:var(--font-family-pixel)] text-pixel-white/40 text-[7px] tracking-wider mb-2">
                    POLL OPTIONS & VOTES
                  </h5>
                  {poll.goves.map(govId => {
                    const count = poll.votes.filter(v => v.vote === govId).length;
                    const isCorrect = poll.next_gov_id === govId;
                    return (
                      <div key={govId} className="flex justify-between text-xs font-[family-name:var(--font-family-pixelify)]">
                        <span className={isCorrect ? 'text-pixel-green font-bold' : 'text-pixel-white/80'}>
                          {getGovName(govId)} {isCorrect && '👑'}
                        </span>
                        <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-sm">
                          {count} {count === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-pixel-dark/30 p-3 border border-pixel-white/5 rounded flex flex-col justify-center gap-2">
                  {!isResolved ? (
                    <>
                      <label className="font-[family-name:var(--font-family-vt)] text-pixel-white/50 text-xs">
                        Resolve with Correct Governorate:
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={correctGovIds[poll.id] || ''}
                          onChange={e => setCorrectGovIds({ ...correctGovIds, [poll.id]: e.target.value })}
                          className="admin-input flex-1 text-sm py-1.5"
                        >
                          <option value="">Choose Correct Option</option>
                          {poll.goves.map(govId => (
                            <option key={govId} value={govId}>{getGovName(govId)}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleResolvePoll(poll.id)}
                          className="admin-btn admin-btn-primary text-xs py-1 px-3"
                        >
                          Resolve
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs font-[family-name:var(--font-family-pixelify)] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-pixel-white/40">Total Voters:</span>
                        <span className="text-pixel-white">{totalVotes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-pixel-white/40">Correct Guesses:</span>
                        <span className="text-pixel-green font-bold">{correctVotes} ({totalVotes > 0 ? Math.round((correctVotes / totalVotes) * 100) : 0}%)</span>
                      </div>
                      {winners.length > 0 && (
                        <div className="border-t border-pixel-white/5 pt-2">
                          <span className="text-pixel-yellow font-bold block mb-1">👑 WINNER EMAILS:</span>
                          <div className="bg-pixel-dark/60 p-2 rounded text-[10px] text-pixel-white/80 max-h-20 overflow-y-auto break-all select-all select-text font-mono">
                            {winners.map(w => w.email).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
