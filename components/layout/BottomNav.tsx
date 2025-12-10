'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Contacts',
      href: '/contacts',
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/50',
      inactiveColor: 'text-blue-400',
      inactiveBg: 'bg-blue-500/20',
      icon: (active: boolean) => (
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main person */}
          <circle
            cx="12"
            cy="8"
            r="4"
            fill={active ? 'url(#contactsGradient)' : 'currentColor'}
            opacity={active ? 1 : 0.7}
          />
          <path
            d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
            stroke={active ? 'url(#contactsGradient)' : 'currentColor'}
            strokeWidth="3"
            strokeLinecap="round"
            opacity={active ? 1 : 0.7}
          />
          {/* Left person */}
          <circle
            cx="5"
            cy="9"
            r="2.5"
            fill={active ? '#60A5FA' : 'currentColor'}
            opacity={active ? 0.8 : 0.5}
          />
          {/* Right person */}
          <circle
            cx="19"
            cy="9"
            r="2.5"
            fill={active ? '#22D3EE' : 'currentColor'}
            opacity={active ? 0.8 : 0.5}
          />
          <defs>
            <linearGradient id="contactsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: 'Scan',
      href: '/scan',
      isHero: true, // Mark as hero/main feature
      gradient: 'from-[#3A83FE] via-[#8B5CF6] to-[#EC4899]',
      shadowColor: 'shadow-[#8B5CF6]/60',
      inactiveColor: 'text-white',
      inactiveBg: 'bg-gradient-to-r from-[#3A83FE] via-[#8B5CF6] to-[#EC4899]',
      icon: (active: boolean) => (
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Camera body */}
          <rect
            x="2"
            y="6"
            width="20"
            height="14"
            rx="3"
            fill="url(#scanHeroGradient)"
          />
          {/* Camera lens outer ring */}
          <circle
            cx="12"
            cy="13"
            r="5"
            fill="#1f2937"
            stroke="url(#scanLensGradient)"
            strokeWidth="2"
          />
          {/* Camera lens inner */}
          <circle
            cx="12"
            cy="13"
            r="2.5"
            fill="url(#scanLensGradient)"
          />
          {/* Camera flash */}
          <circle
            cx="17"
            cy="9"
            r="1.5"
            fill="#FBBF24"
          />
          {/* Camera top bump */}
          <path
            d="M8 6V5C8 4.44772 8.44772 4 9 4H15C15.5523 4 16 4.44772 16 5V6"
            fill="url(#scanHeroGradient)"
          />
          <defs>
            <linearGradient id="scanHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3A83FE" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="scanLensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/settings',
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/50',
      inactiveColor: 'text-amber-400',
      inactiveBg: 'bg-amber-500/20',
      icon: (active: boolean) => (
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gear teeth */}
          <path
            d="M12 1L13.5 4H10.5L12 1Z"
            fill={active ? '#F59E0B' : 'currentColor'}
            opacity={active ? 1 : 0.6}
          />
          <path
            d="M12 23L10.5 20H13.5L12 23Z"
            fill={active ? '#F59E0B' : 'currentColor'}
            opacity={active ? 1 : 0.6}
          />
          <path
            d="M1 12L4 10.5V13.5L1 12Z"
            fill={active ? '#F59E0B' : 'currentColor'}
            opacity={active ? 1 : 0.6}
          />
          <path
            d="M23 12L20 13.5V10.5L23 12Z"
            fill={active ? '#F59E0B' : 'currentColor'}
            opacity={active ? 1 : 0.6}
          />
          <path
            d="M4.22 4.22L6.7 5.64L5.64 6.7L4.22 4.22Z"
            fill={active ? '#FB923C' : 'currentColor'}
            opacity={active ? 1 : 0.6}
          />
          <path
            d="M19.78 19.78L17.3 18.36L18.36 17.3L19.78 19.78Z"
            fill={active ? '#FB923C' : 'currentColor'}
            opacity={active ? 1 : 0.6}
          />
          <path
            d="M4.22 19.78L5.64 17.3L6.7 18.36L4.22 19.78Z"
            fill={active ? '#FB923C' : 'currentColor'}
            opacity={active ? 1 : 0.6}
          />
          <path
            d="M19.78 4.22L18.36 6.7L17.3 5.64L19.78 4.22Z"
            fill={active ? '#FB923C' : 'currentColor'}
            opacity={active ? 1 : 0.6}
          />
          {/* Main gear body */}
          <circle
            cx="12"
            cy="12"
            r="7"
            fill={active ? 'url(#settingsGradient)' : 'currentColor'}
            opacity={active ? 1 : 0.7}
          />
          {/* Inner circle */}
          <circle
            cx="12"
            cy="12"
            r="3"
            fill={active ? '#1f2937' : '#374151'}
            stroke={active ? 'white' : '#9CA3AF'}
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="settingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 safe-area-pb z-50">
      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3A83FE] via-[#8B5CF6] to-[#EC4899] opacity-50" />

      <div className="flex justify-around items-center h-20 max-w-screen-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const isHero = (item as any).isHero;

          if (isHero) {
            // SCAN - Hero Button (always colorful, centered, larger)
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 group -mt-6"
              >
                {/* Outer glow ring */}
                <div className="relative">
                  {/* Animated pulsing glow */}
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#3A83FE] via-[#8B5CF6] to-[#EC4899] opacity-40 blur-lg animate-pulse" />

                  {/* Button container */}
                  <div
                    className={`
                      relative p-4 rounded-full transition-all duration-300
                      bg-gradient-to-r ${item.gradient}
                      shadow-xl ${item.shadowColor}
                      ${isActive ? 'scale-110 shadow-2xl' : 'scale-100 group-hover:scale-105'}
                    `}
                    style={{
                      boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    {item.icon(true)}

                    {/* Inner shine effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30" />

                    {/* Animated ring */}
                    {isActive && (
                      <div className="absolute -inset-1 rounded-full border-2 border-white/50 animate-ping" style={{ animationDuration: '2s' }} />
                    )}
                  </div>

                  {/* Pulsing dot indicator */}
                  <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EC4899]"></span>
                    </span>
                  </div>
                </div>

                <span
                  className={`
                    text-xs font-bold tracking-wide transition-colors duration-200 mt-1
                    bg-gradient-to-r from-[#3A83FE] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent
                  `}
                >
                  {item.name}
                </span>
              </Link>
            );
          }

          // Regular nav items (Contacts, Settings)
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-200 group"
            >
              <div
                className={`
                  relative p-3 rounded-2xl transition-all duration-300
                  ${isActive
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadowColor} scale-110`
                    : `${item.inactiveBg} ${item.inactiveColor} group-hover:scale-105`
                  }
                `}
              >
                {item.icon(isActive)}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                )}
              </div>
              <span
                className={`
                  text-xs font-semibold tracking-wide transition-colors duration-200
                  ${isActive
                    ? 'text-white'
                    : `${item.inactiveColor} group-hover:brightness-125`
                  }
                `}
              >
                {item.name}
              </span>
              {isActive && (
                <div className={`absolute bottom-1 w-8 h-1 rounded-full bg-gradient-to-r ${item.gradient}`} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
