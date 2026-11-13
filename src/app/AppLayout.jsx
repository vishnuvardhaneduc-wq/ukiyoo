import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { Icons } from '../components/Icon.jsx';
import { Drawer } from '../components/Drawer.jsx';
import { listConversations, createConversation } from '../lib/api/chat.js';

export function AppLayout() {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();

  useEffect(() => {
    let isMounted = true;
    listConversations().then((data) => {
      if (isMounted && data) {
        setConversations(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const handleNewChat = async () => {
    handleNavClick();
    try {
      const newConv = await createConversation();
      setConversations((prev) => [newConv, ...prev]);
      navigate(`/app/chat/${newConv.id}`);
    } catch {
      navigate('/app/chat');
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations
  const todayConvs = filteredConversations.filter(
    (c) => c.timeGroup === 'Today' || (!c.timeGroup && c.id === 'conv-1')
  );
  const yesterdayConvs = filteredConversations.filter(
    (c) => c.timeGroup === 'Yesterday' || (!c.timeGroup && (c.id === 'conv-2' || c.id === 'conv-3'))
  );
  const earlierConvs = filteredConversations.filter(
    (c) =>
      c.timeGroup === 'Previous 7 days' ||
      (!c.timeGroup && !todayConvs.includes(c) && !yesterdayConvs.includes(c))
  );

  // Compute breadcrumb title based on path
  const getBreadcrumbTitle = () => {
    if (location.pathname.startsWith('/app/chat')) {
      if (conversationId) {
        const found = conversations.find((c) => c.id === conversationId);
        return found ? found.title : 'Chat session';
      }
      return 'New conversation';
    }
    if (location.pathname.startsWith('/app/memory')) return 'Memory Vault';
    if (location.pathname.startsWith('/app/search')) return 'Search Knowledge Base';
    if (location.pathname.startsWith('/app/workspace/tasks')) return 'Workspace Tasks';
    if (location.pathname.startsWith('/app/workspace/notes')) return 'Workspace Notes';
    if (location.pathname.startsWith('/app/settings')) return 'Settings';
    return 'MindMate AI';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-soft-cream select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Top Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-pebble/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-chestnut flex items-center justify-center text-parchment shadow-sm">
              <Icons.SparkleIcon className="w-4 h-4 text-peach-glow" />
            </div>
            <span className="font-headline text-xl text-sepia tracking-tight font-normal">
              MindMate
            </span>
          </div>
          {/* Close drawer on mobile */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-driftwood hover:bg-surface-container-high transition-colors"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Primary CTA */}
        <div className="px-4 pt-3 pb-2">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full h-10 px-4 rounded-xl bg-primary hover:bg-sepia text-parchment text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm shadow-peach-glow/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-orange active:scale-[0.99]"
          >
            <Icons.Plus className="w-4 h-4 text-peach-glow" />
            <span>New chat</span>
          </button>
        </div>

        {/* Search Chats Input */}
        <div className="px-4 py-1.5">
          <div className="relative flex items-center">
            <Icons.Search className="w-4 h-4 absolute left-3 text-stone pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-pure-card text-xs text-charcoal-bark placeholder:text-stone border border-pebble/60 shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-ember-orange focus:ring-1 focus:ring-peach-glow"
            />
          </div>
        </div>

        {/* Global Feature Navigation Links */}
        <nav className="px-4 py-2 space-y-1" aria-label="Main Navigation">
          <NavLink
            to="/app/memory"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-memory-bg text-memory border border-memory-border shadow-xs'
                  : 'text-charcoal-bark hover:bg-surface-container-high'
              }`
            }
          >
            <Icons.Brain className="w-4 h-4 text-memory shrink-0" />
            <span>Memory</span>
          </NavLink>

          <NavLink
            to="/app/workspace/tasks"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-pure-card text-sepia border border-pebble shadow-sm'
                  : 'text-charcoal-bark hover:bg-surface-container-high'
              }`
            }
          >
            <Icons.Folder className="w-4 h-4 text-driftwood shrink-0" />
            <span>Workspace</span>
          </NavLink>

          <NavLink
            to="/app/search"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-pure-card text-sepia border border-pebble shadow-sm'
                  : 'text-charcoal-bark hover:bg-surface-container-high'
              }`
            }
          >
            <Icons.Search className="w-4 h-4 text-driftwood shrink-0" />
            <span>Search</span>
          </NavLink>

          <NavLink
            to="/app/settings"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-pure-card text-sepia border border-pebble shadow-sm'
                  : 'text-charcoal-bark hover:bg-surface-container-high'
              }`
            }
          >
            <Icons.Settings className="w-4 h-4 text-driftwood shrink-0" />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Conversational History Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          {todayConvs.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-[11px] font-medium uppercase tracking-wider text-stone">
                Today
              </span>
              <div className="space-y-0.5">
                {todayConvs.map((conv) => (
                  <NavLink
                    key={conv.id}
                    to={`/app/chat/${conv.id}`}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        isActive
                          ? 'bg-pure-card text-sepia font-semibold shadow-[0_1px_8px_rgba(254,208,179,0.35)] border border-pebble/50'
                          : 'text-charcoal-bark hover:bg-surface-container-high'
                      }`
                    }
                  >
                    <span className="truncate">{conv.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {yesterdayConvs.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-[11px] font-medium uppercase tracking-wider text-stone">
                Yesterday
              </span>
              <div className="space-y-0.5">
                {yesterdayConvs.map((conv) => (
                  <NavLink
                    key={conv.id}
                    to={`/app/chat/${conv.id}`}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        isActive
                          ? 'bg-pure-card text-sepia font-semibold shadow-[0_1px_8px_rgba(254,208,179,0.35)] border border-pebble/50'
                          : 'text-charcoal-bark hover:bg-surface-container-high'
                      }`
                    }
                  >
                    <span className="truncate">{conv.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {earlierConvs.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-[11px] font-medium uppercase tracking-wider text-stone">
                Previous 7 days
              </span>
              <div className="space-y-0.5">
                {earlierConvs.map((conv) => (
                  <NavLink
                    key={conv.id}
                    to={`/app/chat/${conv.id}`}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        isActive
                          ? 'bg-pure-card text-sepia font-semibold shadow-[0_1px_8px_rgba(254,208,179,0.35)] border border-pebble/50'
                          : 'text-charcoal-bark hover:bg-surface-container-high'
                      }`
                    }
                  >
                    <span className="truncate">{conv.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Bar at bottom */}
      <div className="p-3 border-t border-pebble/40 bg-soft-cream">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-high transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-chestnut flex items-center justify-center text-parchment font-medium text-xs shrink-0 shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PR'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-charcoal-bark truncate">
                {user?.name || 'Pramod'}
              </span>
              <span className="text-[11px] text-stone truncate">
                {user?.title || 'Delphi Scholar'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-driftwood hover:text-danger hover:bg-danger-bg/40 transition-colors"
          >
            <Icons.LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] z-30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-pebble/50">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer (< 1024px) */}
      <Drawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        side="left"
        width="w-[280px]"
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[260px] min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-parchment/90 backdrop-blur-md border-b border-pebble/40 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger for mobile */}
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-charcoal-bark hover:bg-soft-cream border border-pebble/60 transition-colors"
            >
              <Icons.Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
              <span className="text-xs uppercase tracking-wider text-muted font-medium shrink-0">
                MindMate
              </span>
              <Icons.ChevronRight className="w-3.5 h-3.5 text-stone shrink-0" />
              <span className="font-headline text-lg sm:text-xl text-sepia truncate font-normal">
                {getBreadcrumbTitle()}
              </span>
            </nav>
          </div>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/app/search')}
              aria-label="Search"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-driftwood hover:bg-soft-cream hover:text-sepia transition-colors"
            >
              <Icons.Search className="w-4 h-4" />
            </button>
            <div
              className="w-8 h-8 rounded-full bg-soft-cream border border-pebble flex items-center justify-center text-xs font-semibold text-sepia"
              aria-label={`Logged in as ${user?.name || 'User'}`}
            >
              {user?.name ? user.name[0].toUpperCase() : 'P'}
            </div>
          </div>
        </header>

        {/* Sub-route Outlet */}
        <main className="flex-1 flex flex-col min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
