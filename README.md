# DocTech by FTA

A fast, private, full-stack workspace featuring 114+ browser utilities and a built-in typing arcade. Built with a decoupled frontend and backend architecture.

**Live Demo:** https://doc-tech-by-fta.vercel.app

## Features

* **114+ Utilities across 8 Categories:** PDF Tools, Image Tools, Coding Tools, CSS Generators, Social Media Tools, Text Tools, Color Tools, and Misc Utilities.
* **Privacy-First:** Most tools process files directly in the browser; heavy document operations are routed through a dedicated backend.
* **Built-in Arcade:** Includes two in-browser typing games (*NEUROTYPE* and *VOIDSTRIKE*).

## Tech Stack

* **Frontend (`doctech-web`):** Astro, TypeScript, Tailwind CSS — deployed on Vercel.
* **Backend (`doctech-server`):** Node.js, Express, `pdf-lib`, Multer — deployed on Render.

## Project Structure

```text
DocTech/
├── doctech-web/      # Astro static frontend
└── doctech-server/   # Express API for cloud/PDF processing