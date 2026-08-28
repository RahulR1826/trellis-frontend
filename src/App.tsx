import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { INITIAL_ROADMAP_NODES, INITIAL_RESOURCE_ITEMS } from './data/roadmapData';
import { DEFAULT_SKILL_SCORES, TARGET_SKILL_SCORES } from './data/tracks';
import { RoadmapNode, ResourceItem, SkillScores } from './types';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { RoadmapLatticeView } from './components/RoadmapLatticeView';
import { ResourcesView } from './components/ResourcesView';
import { PracticeSkillCheck } from './components/PracticeSkillCheck';
import { ChatPage } from './components/ChatPage';
import { ProfileView } from './components/ProfileView';
import { AuthPage } from './components/AuthPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { LearningModal } from './components/LearningModal';
import { WhyThisModal } from './components/WhyThisModal';
import { DiagnosticModal } from './components/DiagnosticModal';
import { TrellisGrowthBackground } from './components/TrellisGrowthBackground';
import { AIGuideBot } from './components/AIGuideBot';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('landing');
  const [nodes, setNodes] = useState<RoadmapNode[]>(INITIAL_ROADMAP_NODES);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCE_ITEMS);
  const [currentScores, setCurrentScores] = useState<SkillScores>(DEFAULT_SKILL_SCORES);
  const [targetScores, setTargetScores] = useState<SkillScores>(TARGET_SKILL_SCORES);
  const [shaderActive, setShaderActive] = useState<boolean>(true);

  // Modals state
  const [selectedNodeForLearn, setSelectedNodeForLearn] = useState<RoadmapNode | null>(null);
  const [selectedNodeForWhyThis, setSelectedNodeForWhyThis] = useState<RoadmapNode | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState<boolean>(false);

  const { isAuthenticated } = useAuth();

  // Node feedback (thumbs up / down / regen)
  const handleNodeFeedback = (nodeId: string, action: 'up' | 'down' | 'regen') => {
    setNodes(prev =>
      prev.map(node => {
        if (node.id !== nodeId) return node;
        if (action === 'regen') {
          return {
            ...node,
            title: node.title.includes('(Regenerated)') ? node.title : `${node.title} (Regenerated)`,
            shortDescription: `Enhanced with adaptive focus to reinforce prerequisite competencies.`
          };
        }
        return {
          ...node,
          feedback: node.feedback === action ? null : action
        };
      })
    );
  };

  // Resource feedback (thumbs up / down / regen)
  const handleResourceFeedback = (resId: string, action: 'up' | 'down' | 'regen') => {
    setResources(prev =>
      prev.map(res => {
        if (res.id !== resId) return res;
        if (action === 'regen') {
          return {
            ...res,
            title: `${res.title} (Tailored Edition)`,
            matchScore: Math.min(99, res.matchScore + 2)
          };
        }
        return {
          ...res,
          feedback: res.feedback === action ? null : action
        };
      })
    );
  };

  // Bookmark toggle
  const handleToggleBookmark = (resId: string) => {
    setResources(prev =>
      prev.map(res => (res.id === resId ? { ...res, bookmarked: !res.bookmarked } : res))
    );
  };

  // Node mastery handler
  const handleMasterNode = (nodeId: string) => {
    setNodes(prev => {
      const nodeIndex = prev.findIndex(n => n.id === nodeId);
      return prev.map((node, idx) => {
        if (node.id === nodeId) {
          return { ...node, status: 'done' as const, progress: 100 };
        }
        if (idx === nodeIndex + 1 && (node.status === 'locked' || node.status === 'available')) {
          return { ...node, status: 'in-progress' as const, progress: 25 };
        }
        return node;
      });
    });

    // Increment radar skill scores
    setCurrentScores(prev => ({
      ...prev,
      systems: Math.min(96, (prev.systems || 60) + 5),
      data: Math.min(96, (prev.data || 50) + 7),
      logic: Math.min(96, (prev.logic || 60) + 4),
      ux: prev.ux || 50,
      agile: Math.min(96, (prev.agile || 50) + 3)
    }));
  };

  const handleSelectNodeById = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setCurrentTab('roadmap');
      setSelectedNodeForLearn(node);
    }
  };

  const currentNode = nodes.find(n => n.status === 'in-progress' || n.status === 'current') || nodes[0];

  return (
    <div className="min-h-screen relative flex flex-col justify-between font-sans selection:bg-[#003527] selection:text-white dark:selection:bg-[#52b788] dark:selection:text-[#06110d] bg-[#fbfdfc] dark:bg-[#06110d] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Background Lattice Pattern */}
      <div className="fixed inset-0 pointer-events-none lattice-bg z-0 opacity-40 dark:opacity-20" />
      
      {/* Background Animation: Living Trellis Canvas - RESTRICTED ONLY TO LANDING PAGE */}
      {currentTab === 'landing' && shaderActive && (
        <TrellisGrowthBackground opacity={0.88} />
      )}

      {/* Top Header Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        shaderActive={shaderActive}
        onToggleShader={() => setShaderActive(prev => !prev)}
      />

      {/* Main App Content Views */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-16 relative z-10">
        
        {/* 1. Landing Page Overview */}
        {currentTab === 'landing' && (
          <LandingPage
            onStartRoadmap={() => setCurrentTab('roadmap')}
            onOpenDiagnostic={() => setDiagnosticOpen(true)}
            onExploreResources={() => setCurrentTab('resources')}
            onOpenOnboarding={() => setCurrentTab('onboarding')}
            currentScores={currentScores}
            targetScores={targetScores}
            nodes={nodes}
          />
        )}

        {/* 2. Interactive Lattice Roadmap View */}
        {currentTab === 'roadmap' && (
          <RoadmapLatticeView
            nodes={nodes}
            onSelectNode={node => setSelectedNodeForLearn(node)}
            onOpenWhyThis={node => setSelectedNodeForWhyThis(node)}
            onNodeFeedback={handleNodeFeedback}
          />
        )}

        {/* 3. Filterable Architecture Resource Library */}
        {currentTab === 'resources' && (
          <ResourcesView
            resources={resources}
            onToggleBookmark={handleToggleBookmark}
            onResourceFeedback={handleResourceFeedback}
          />
        )}

        {/* 4. Diagnostic Skill-Check Practice Quiz */}
        {currentTab === 'practice' && (
          <PracticeSkillCheck
            onNavigateRoadmap={() => setCurrentTab('roadmap')}
          />
        )}

        {/* 5. AI Botanical Mentor Chat Page */}
        {currentTab === 'chat' && (
          <ChatPage />
        )}

        {/* 6. Architect Profile with Skill Radar & History */}
        {currentTab === 'profile' && (
          <ProfileView
            nodes={nodes}
            resources={resources}
            onSelectNode={node => {
              setCurrentTab('roadmap');
              setSelectedNodeForLearn(node);
            }}
            onOpenWhyThis={node => setSelectedNodeForWhyThis(node)}
            onNodeFeedback={handleNodeFeedback}
            onToggleBookmark={handleToggleBookmark}
            onResourceFeedback={handleResourceFeedback}
          />
        )}

        {/* 7. Authentication & Registration Screen */}
        {currentTab === 'auth' && (
          <AuthPage
            onSuccess={target => {
              if (target === '/onboarding') {
                setCurrentTab('onboarding');
              } else {
                setCurrentTab('roadmap');
              }
            }}
            onNavigateHome={() => setCurrentTab('landing')}
          />
        )}

        {/* 8. Onboarding Personalization Wizard */}
        {currentTab === 'onboarding' && (
          <OnboardingWizard
            onComplete={() => setCurrentTab('roadmap')}
          />
        )}
      </main>

      {/* Floating AI Guide Bot Assistant (Available when not in dedicated chat view or auth/onboarding) */}
      {currentTab !== 'chat' && currentTab !== 'auth' && currentTab !== 'onboarding' && (
        <AIGuideBot
          currentNode={currentNode as any}
          currentScores={currentScores}
          onOpenNodeModal={handleSelectNodeById}
        />
      )}

      {/* Global Footer (Hidden in Auth & Onboarding for minimal distraction) */}
      {currentTab !== 'auth' && currentTab !== 'onboarding' && (
        <Footer
          onSelectTab={tab => setCurrentTab(tab as ActiveTab)}
          onOpenDiagnostic={() => setDiagnosticOpen(true)}
        />
      )}

      {/* Modals */}
      {selectedNodeForLearn && (
        <LearningModal
          node={selectedNodeForLearn}
          onClose={() => setSelectedNodeForLearn(null)}
          onMasterNode={handleMasterNode}
        />
      )}

      {selectedNodeForWhyThis && (
        <WhyThisModal
          node={selectedNodeForWhyThis}
          onClose={() => setSelectedNodeForWhyThis(null)}
          onFeedback={(nodeId, fb) => handleNodeFeedback(nodeId, fb)}
        />
      )}

      {diagnosticOpen && (
        <DiagnosticModal
          onClose={() => setDiagnosticOpen(false)}
          onUpdateScores={newScores => {
            setCurrentScores(newScores);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
