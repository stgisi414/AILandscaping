import React from 'react';
import HomePage from './pages/HomePage';
import ExampleGeneratorPage from './pages/ExampleGeneratorPage';

const App: React.FC = () => {
  // Simple routing - check URL path
  const path = window.location.pathname;

  if (path === '/generate-examples') {
    return <ExampleGeneratorPage />;
  }

  return <HomePage />);
};

export default App;