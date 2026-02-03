import React, { useState, useEffect } from 'react';
import MpProfileView from './views/MpProfileView';
import VotesListView from './views/VotesListView';
import VoteDetailView from './views/VoteDetailView';
import ComparisonView from './views/ComparisonView';
import MpsListView from './views/MpsListView';
import { DashboardView } from './views/DashboardView';
import { Header } from './components/Header';

// Route helper
const parseRoute = (hash: string) => {
    if (hash.startsWith('#/mps/')) {
        const id = hash.replace('#/mps/', '');
        return { view: 'mp-profile', id };
    }
    if (hash === '#/mps') return { view: 'mps-list' };

    if (hash.startsWith('#/votes/')) {
        const id = hash.replace('#/votes/', '');
        return { view: 'vote-detail', id };
    }
    if (hash === '#/votes') return { view: 'votes-list' };

    if (hash === '#/compare') return { view: 'compare' };
    return { view: 'dashboard' };
};

// Main App with Routing
const App = () => {
    const [route, setRoute] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash || '#/');
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const { view, id } = parseRoute(route);

    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-7xl mx-auto flex flex-col bg-[#0a0a0c] text-white selection:bg-blue-500/30">
            <Header view={view} />

            <main className="flex-1 w-full">
                {view === 'compare' && <ComparisonView />}
                {view === 'mps-list' && <MpsListView />}
                {view === 'mp-profile' && id && <MpProfileView mpId={id} />}
                {view === 'votes-list' && <VotesListView />}
                {view === 'vote-detail' && id && <VoteDetailView voteId={id} />}
                {view === 'dashboard' && <DashboardView />}
            </main>
        </div>
    );
};

export default App;

