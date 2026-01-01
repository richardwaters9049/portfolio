import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			backgroundColor: {
  				LiveRed: '#B20100'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-in': 'slide-in 0.5s ease-out',
  			'slide-out': 'slide-out 0.5s ease-in',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'fade-out': 'fade-out 0.5s ease-in',
  			'zoom-in': 'zoom-in 0.5s ease-out',
  			'zoom-out': 'zoom-out 0.5s ease-in',
  			spin: 'spin 1s linear infinite',
  			ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  			pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			draw: 'draw 1s ease-in-out infinite',
  			'draw-slow': 'draw 2s ease-in-out infinite',
  			'draw-slower': 'draw 3s ease-in-out infinite',
  			'draw-slowest': 'draw 4s ease-in-out infinite',
  			wiggle: 'wiggle 1s ease-in-out infinite',
  			'wiggle-slow': 'wiggle 2s ease-in-out infinite',
  			'wiggle-slower': 'wiggle 3s ease-in-out infinite',
  			'wiggle-slowest': 'wiggle 4s ease-in-out infinite',
  			tada: 'tada 1s ease-in-out infinite',
  			'tada-slow': 'tada 2s ease-in-out infinite',
  			'tada-slower': 'tada 3s ease-in-out infinite',
  			'tada-slowest': 'tada 4s ease-in-out infinite',
  			'spin-slow': 'spin 3s linear infinite',
  			'spin-slower': 'spin 4s linear infinite',
  			'spin-slowest': 'spin 5s linear infinite',
  			flip: 'flip 1s ease-in-out infinite',
  			'flip-slow': 'flip 2s ease-in-out infinite',
  			'flip-slower': 'flip 3s ease-in-out infinite',
  			'flip-slowest': 'flip 4s ease-in-out infinite'
  		},
  		fontFamily: {
  			zombie: [
  				'Zombie Holocaust"',
  				'sans-serif'
  			],
  			gothic: [
  				'Gothical"',
  				'sans-serif'
  			],
  			angel: [
  				'Angel wish"',
  				'sans-serif'
  			],
  			monsterParty: [
  				'Monster Party"',
  				'sans-serif'
  			],
  			typeWriter: [
  				'typewriter"',
  				'sans-serif'
  			],
  			bitter: [
  				'Bitter-Medium"',
  				'sans-serif'
  			]
  		},
  		backgroundColor: {
  			LFCbg: '#dc0714;',
  			glassBlue: '#4DF7F6'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
