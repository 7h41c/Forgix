# Tailwind CSS Setup

## Installation
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Configuration
Add to your `tailwind.config.js`:
```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

## Usage
Add to your CSS:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```