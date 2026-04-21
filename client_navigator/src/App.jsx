import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Pages/Layout';
import MapView from './components/Pages/MapView';
import MyVisits from './components/Pages/MyVisits';
import NavigatorApp from './components/Pages/NavigatorApp';
import Overview from './components/Pages/Overview';
import ExploreMuseum from './components/Pages/ExploreMuseum';
import Editor from './components/Pages/Editor';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/navigator">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MapView />} />
          <Route path="my-visits" element={<MyVisits />} />
          <Route path="tour" element={<NavigatorApp />} />
          <Route path="overview" element={<Overview />} />
          <Route path="museum/:id" element={<ExploreMuseum />} />
          <Route path="about" element={<div style={{ padding: '2rem' }}><h2>About Us</h2><p>Welcome to the Navigator app.</p></div>} />
        </Route>
        {/* Editor route taking full screen outside main Layout */}
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
