import React from 'react';
import { HashRouter, Routes, Route, Navigate, useParams, useNavigate, Outlet } from 'react-router';
import { MainLayout } from './components/MainLayout';
import { LandingPage } from './components/LandingPage';

// Existing views (connected to real API)
import MpProfileView from './views/MpProfileView';
import VotesListView from './views/VotesListView';
import VoteDetailView from './views/VoteDetailView';
import ComparisonView from './views/ComparisonView';
import MpsListView from './views/MpsListView';
import { DashboardView } from './views/DashboardView';

// Figma views (design prototypes with mock data)
import { MpDirectory } from './components/MpDirectory';
import { SessionOverview } from './components/SessionOverview';

// Wrapper for Profile to handle route params
const MpProfileRoute = () => {
    const { id } = useParams();
    return <MpProfileView mpId={id!} />;
};

// Wrapper for Vote Detail to handle route params
const VoteDetailRoute = () => {
    const { id } = useParams();
    return <VoteDetailView voteId={id!} />;
};

function App() {
    // Force dark mode
    React.useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Dashboard Layout Routes */}
                <Route path="/dashboard" element={<MainLayout />}>
                    <Route index element={<DashboardView />} />

                    <Route path="mps" element={<Outlet />}>
                        <Route index element={<MpsListView />} />
                        <Route path=":id" element={<MpProfileRoute />} />
                    </Route>

                    <Route path="votes" element={<Outlet />}>
                        <Route index element={<VotesListView />} />
                        <Route path=":id" element={<VoteDetailRoute />} />
                    </Route>

                    <Route path="sessions" element={<SessionOverview />} />
                    <Route path="compare" element={<ComparisonView />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    );
}

export default App;
