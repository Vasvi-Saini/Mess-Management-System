# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mess Management System - a Next.js 16 application with React 19, TypeScript 5, and Tailwind CSS 4. Currently a fresh starter template ready for feature development.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

- **Next.js App Router** - All routes in `app/` directory
- **Server Components** by default - Use `"use client"` directive only when needed
- **Tailwind CSS v4** - Utility-first styling with PostCSS plugin
- **TypeScript strict mode** - Path alias `@/*` maps to root

### Key Files

- `app/layout.tsx` - Root layout with Geist fonts and metadata
- `app/page.tsx` - Home page
- `app/globals.css` - Global styles with dark mode CSS variables

## Development Notes

- No database, authentication, or API routes configured yet
- ESLint uses flat config with Core Web Vitals and TypeScript rules
- Dark mode support via `prefers-color-scheme` media query
