    tailwind.config = {
      prefix: 'tw-',
      corePlugins: { preflight: false },
      theme: {
        extend: {
          fontFamily: {
            mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            orbitron: ['Orbitron', 'JetBrains Mono', 'ui-monospace', 'monospace'],
          },
          colors: {
            bg: '#0a0f1c',
            brand: '#00ff88',    /* neon green */
            accent: '#00e5ff',   /* neon cyan */
            purple: '#a855f7'    /* neon purple */
          },
          boxShadow: {
            neon: '0 0 0.5rem rgba(0,255,136,0.7), 0 0 1.25rem rgba(0,229,255,0.4), inset 0 0 0 rgba(0,0,0,0)',
            soft: '0 10px 30px rgba(0,0,0,0.25)',
            lift: '0 16px 40px rgba(0,255,136,0.18)'
          },
          dropShadow: {
            neon: '0 0 10px rgba(0,255,136,0.9)'
          },
          keyframes: {
            floaty: {
              '0%': { transform: 'translateY(0) translateX(0)' },
              '50%': { transform: 'translateY(-12px) translateX(6px)' },
              '100%': { transform: 'translateY(0) translateX(0)' }
            },
            drift: {
              '0%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
              '100%': { transform: 'translateY(-120vh) translateX(30vw) rotate(10deg)' }
            },
            blink: { '0%, 49%': { opacity: '1' }, '50%,100%': { opacity: '0' } }
          },
          animation: {
            floaty: 'floaty 5s ease-in-out infinite',
            drift: 'drift 18s linear infinite',
            blink: 'blink 1s steps(2, start) infinite'
          }
        }
      }
    }