
import React, { useState } from 'react';
import Layout from './components/Layout';
import SearchInterface from './components/SearchInterface';
import ChatWindow from './components/ChatWindow';
import ConciergeInterface from './components/ConciergeInterface';
import ProfileSettings from './components/ProfileSettings';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('search');

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchInterface />;
      case 'chat':
        return <ChatWindow />;
      case 'concierge':
        return <ConciergeInterface />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <SearchInterface />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in duration-700">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
