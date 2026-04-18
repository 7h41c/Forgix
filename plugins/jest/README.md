# Jest Testing Setup

## Installation
```bash
npm install -D jest @types/jest ts-jest
```

## Configuration
Add to your `jest.config.js`:
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

## Usage
Run: `npm test`