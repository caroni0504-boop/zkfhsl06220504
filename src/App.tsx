/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ChevronRight, 
  LayoutDashboard, 
  Save,
  Type,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Camera,
  Home,
  ArrowLeft,
  FolderOpen,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/// --- Types ---

interface ImageReference {
  id: string;
  url: string; // base64 or URL
  description: string;
  sourceType: 'character_profile' | 'character_ref' | 'story_ref' | 'background_ref';
  sourceId?: string; // character id or story beat id if applicable
}

interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: string;
}

interface DesiredScene {
  id: string;
  title: string;
  location: string;
  involvedCharacters: string;
  content: string;
  image?: string;
}

interface EpisodeTreatment {
  id: string;
  episodeNumber: number;
  title: string;
  content: string;
}

interface Country {
  id: string;
  name: string;
  era: string;
  space: string;
  races: string;
  history: string;
  society: string;
  environment: string;
  notes: string;
  references: { id: string, url: string, description: string }[];
}

interface Organization {
  id: string;
  name: string;
  logo?: string;
  purpose: string;
  structure: string;
  symbol: string;
  costume: string;
  memberIds: string[];
}

interface Terminology {
  id: string;
  term: string;
  definition: string;
}

interface Character {
  id: string;
  name: string;
  role: string;
  keywords: string;
  catchphrase?: string;
  desire?: string;
  belief?: string;
  personality: string;
  appearance: string;
  ability?: string;
  notes: string;
  profileImage?: string;
  references: { id: string, url: string }[];
}

interface StoryBeat {
  id: string;
  title: string;
  content: string;
}

interface ProgressEntry {
  id: string;
  date: string;
  memo: string;
  image?: string;
}

interface ProjectData {
  id: string;
  title: string;
  basicSettings: {
    intention: string;
    logline: string;
    synopsis: string;
    genre: string;
    keywords: string;
    message: string;
    target: string;
  };
  world: {
    mapImage?: string;
    countries: Country[];
    terminology: Terminology[];
    abilitySystem: string;
    organizations: Organization[];
  };
  characters: Character[];
  relationshipMapImage?: string;
  story: {
    beats: StoryBeat[];
    episodes: EpisodeTreatment[];
    timelineImage?: string;
    desiredScenes: DesiredScene[];
    references: string[];
    imageReferences: { id: string, url: string, description: string }[];
  };
  progress: ProgressEntry[];
}

// --- Initial Data ---

const INITIAL_DATA: ProjectData = {
  id: 'default',
  title: "나의 새로운 만화 프로젝트",
  basicSettings: {
    intention: "현대 사회에서의 진정한 용기를 보여주고자 함",
    logline: "평범한 고등학생이 우연히 마법 세계의 비밀을 알게 되며 벌어지는 모험",
    synopsis: "평범한 일상을 살아가던 주인공은 어느 날 낡은 서점에서 발견한 책을 통해 마법의 존재를 깨닫게 된다. 제국의 감시를 피해 자신의 능력을 키워나가며, 잃어버린 가족의 비밀과 세계의 진실에 다가가는 여정을 그린다.",
    genre: "판타지 / 로맨스",
    keywords: "성장, 마법, 우정, 비밀",
    message: "진정한 힘은 내면에서 나온다",
    target: "10-20대 만화 독자층"
  },
  world: {
    mapImage: undefined,
    countries: [
      {
        id: 'c1',
        name: "에테리아 제국",
        era: "근미래 마법 문명",
        space: "공중 부유 도시들",
        races: "인간, 정령",
        history: "대마법사 에테르가 건국한 500년 역사의 제국",
        society: "마력 보유량에 따른 계급 사회",
        environment: "항상 맑은 하늘과 구름 위",
        notes: "최근 마력 고갈 문제가 대두됨",
        references: [
          { id: 'g1', url: 'https://picsum.photos/seed/global1/400/300', description: '배경 무드보드' }
        ]
      }
    ],
    terminology: [
      { id: 't1', term: "마나 코어", definition: "마법을 사용하기 위한 신체 내 에너지 기관" }
    ],
    abilitySystem: "마나 코어의 색상에 따라 속성이 결정되며, 숙련도에 따라 1~9성으로 나뉨.",
    organizations: [
      {
        id: 'o1',
        name: "그림자 파수꾼",
        logo: undefined,
        purpose: "제국의 어두운 면을 감시하고 위협을 제거",
        structure: "단장 - 4인의 간부 - 일반 단원",
        symbol: "푸른 불꽃",
        costume: "검은색 후드 망토와 은색 가면",
        memberIds: ['1']
      }
    ]
  },
  characters: [
    {
      id: '1',
      name: "주인공 A",
      role: "주연",
      keywords: "열혈, 천재, 트라우마",
      catchphrase: "포기하는 순간이 진짜 끝이다.",
      desire: "잃어버린 가족을 되찾는 것",
      belief: "모든 생명은 평등하다",
      personality: "열정적이고 정의로운 성격",
      appearance: "검은 머리, 푸른 눈, 활동적인 복장",
      ability: "중력 제어",
      notes: "과거의 비밀을 간직하고 있음",
      profileImage: 'https://picsum.photos/seed/char1/300/300',
      references: [
        { id: 'r1', url: 'https://picsum.photos/seed/ref1/300/300' }
      ]
    }
  ],
  story: {
    beats: Array.from({ length: 15 }, (_, i) => ({
      id: `beat-${i + 1}`,
      title: `${i + 1}단계: ${getBeatName(i + 1)}`,
      content: ""
    })),
    episodes: [
      { id: 'ep1', episodeNumber: 1, title: "프롤로그: 운명의 시작", content: "주인공이 자신의 능력을 처음으로 자각하게 되는 사건..." },
      { id: 'ep2', episodeNumber: 2, title: "새로운 만남", content: "조력자 B를 만나 세계관의 비밀에 대해 듣게 됨..." }
    ],
    desiredScenes: [
      { 
        id: 'ds1', 
        title: "비 오는 날의 첫 만남", 
        location: "편의점 앞",
        involvedCharacters: "주인공 A, 조력자 B",
        content: "두 주인공이 우연히 편의점 앞에서 마주치는 장면. 빗소리와 네온사인이 강조됨.", 
        image: 'https://picsum.photos/seed/scene1/600/400' 
      }
    ],
    references: ["반지의 제왕", "슬램덩크"],
    imageReferences: []
  },
  progress: [
    { id: 'p1', date: "2024-03-11", memo: "캐릭터 초기 설정 완료", image: undefined }
  ]
};

function getBeatName(step: number): string {
  const beats = [
    "오프닝 이미지", "주제 제시", "설정", "기폭제", "토론", 
    "2막 진입", "B 스토리", "재미와 놀이", "중간점", "악당의 역습", 
    "모든 것을 잃음", "영혼의 어두운 밤", "3막 진입", "피날레", "최종 이미지"
  ];
  return beats[step - 1] || `단계 ${step}`;
}

// --- Components ---

export default function App() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'world' | 'characters' | 'story' | 'references' | 'progress'>('overview');
  const [worldSubTab, setWorldSubTab] = useState<'basic' | 'map' | 'countries' | 'organizations'>('basic');
  const [refSubTab, setRefSubTab] = useState<'character' | 'story' | 'background'>('character');

  // Persistence (Local Storage)
  useEffect(() => {
    const saved = localStorage.getItem('manhwa_planner_projects_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        } else {
          setProjects([INITIAL_DATA]);
        }
      } catch (e) {
        console.error("Failed to load projects", e);
        setProjects([INITIAL_DATA]);
      }
    } else {
      // Migration from old storage if exists
      const oldSaved = localStorage.getItem('webtoon_planner_data_v4');
      if (oldSaved) {
        try {
          const oldData = JSON.parse(oldSaved);
          const migrated = { ...INITIAL_DATA, ...oldData, id: 'default' };
          setProjects([migrated]);
        } catch (e) {
          setProjects([INITIAL_DATA]);
        }
      } else {
        setProjects([INITIAL_DATA]);
      }
    }
  }, []);

  const data = projects.find(p => p.id === currentProjectId) || INITIAL_DATA;

  const saveData = (newData: ProjectData) => {
    const updatedProjects = projects.map(p => p.id === newData.id ? newData : p);
    setProjects(updatedProjects);
    localStorage.setItem('manhwa_planner_projects_v1', JSON.stringify(updatedProjects));
  };

  const createNewProject = () => {
    const newProject: ProjectData = {
      ...INITIAL_DATA,
      id: Date.now().toString(),
      title: "새로운 프로젝트"
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('manhwa_planner_projects_v1', JSON.stringify(updatedProjects));
    setCurrentProjectId(newProject.id);
  };

  const deleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      const updatedProjects = projects.filter(p => p.id !== id);
      setProjects(updatedProjects);
      localStorage.setItem('manhwa_planner_projects_v1', JSON.stringify(updatedProjects));
      if (currentProjectId === id) {
        setCurrentProjectId(null);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCountry = () => {
    const newCountry: Country = {
      id: Date.now().toString(),
      name: "새 나라",
      era: "",
      space: "",
      races: "",
      history: "",
      society: "",
      environment: "",
      notes: "",
      references: []
    };
    saveData({ ...data, world: { ...data.world, countries: [...data.world.countries, newCountry] } });
  };

  const updateCountry = (id: string, updates: Partial<Country>) => {
    const newCountries = data.world.countries.map(c => c.id === id ? { ...c, ...updates } : c);
    saveData({ ...data, world: { ...data.world, countries: newCountries } });
  };

  const deleteCountry = (id: string) => {
    saveData({ ...data, world: { ...data.world, countries: data.world.countries.filter(c => c.id !== id) } });
  };

  const addTerminology = () => {
    const newTerm: Terminology = { id: Date.now().toString(), term: "", definition: "" };
    saveData({ ...data, world: { ...data.world, terminology: [...data.world.terminology, newTerm] } });
  };

  const updateTerminology = (id: string, updates: Partial<Terminology>) => {
    const newTerms = data.world.terminology.map(t => t.id === id ? { ...t, ...updates } : t);
    saveData({ ...data, world: { ...data.world, terminology: newTerms } });
  };

  const deleteTerminology = (id: string) => {
    saveData({ ...data, world: { ...data.world, terminology: data.world.terminology.filter(t => t.id !== id) } });
  };

  const addOrganization = () => {
    const newOrg: Organization = {
      id: Date.now().toString(),
      name: "새 조직",
      purpose: "",
      structure: "",
      symbol: "",
      costume: "",
      memberIds: []
    };
    saveData({ ...data, world: { ...data.world, organizations: [...data.world.organizations, newOrg] } });
  };

  const updateOrganization = (id: string, updates: Partial<Organization>) => {
    const newOrgs = data.world.organizations.map(o => o.id === id ? { ...o, ...updates } : o);
    saveData({ ...data, world: { ...data.world, organizations: newOrgs } });
  };

  const deleteOrganization = (id: string) => {
    saveData({ ...data, world: { ...data.world, organizations: data.world.organizations.filter(o => o.id !== id) } });
  };
  const addCharacter = () => {
    const newChar: Character = {
      id: Date.now().toString(),
      name: "새 캐릭터",
      role: "조연",
      keywords: "",
      catchphrase: "",
      desire: "",
      belief: "",
      personality: "",
      appearance: "",
      ability: "",
      notes: "",
      references: []
    };
    saveData({ ...data, characters: [...data.characters, newChar] });
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    const newChars = data.characters.map(c => c.id === id ? { ...c, ...updates } : c);
    saveData({ ...data, characters: newChars });
  };

  const deleteCharacter = (id: string) => {
    saveData({ ...data, characters: data.characters.filter(c => c.id !== id) });
  };

  const updateStory = (field: keyof ProjectData['story'], value: any) => {
    saveData({ ...data, story: { ...data.story, [field]: value } });
  };

  const addStoryReference = (url: string) => {
    const newRef = {
      id: Date.now().toString(),
      url,
      description: "스토리 레퍼런스"
    };
    saveData({ ...data, story: { ...data.story, imageReferences: [...data.story.imageReferences, newRef] } });
  };

  const addBackgroundReference = (url: string) => {
    const newRef = {
      id: Date.now().toString(),
      url,
      description: "배경 레퍼런스"
    };
    saveData({ ...data, backgroundReferences: [...data.backgroundReferences, newRef] });
  };

  const addEpisode = () => {
    const nextNum = (data.story.episodes?.length || 0) + 1;
    const newEp: EpisodeTreatment = {
      id: Date.now().toString(),
      episodeNumber: nextNum,
      title: `${nextNum}화 제목`,
      content: ""
    };
    saveData({ ...data, story: { ...data.story, episodes: [...(data.story.episodes || []), newEp] } });
  };

  const updateEpisode = (id: string, updates: Partial<EpisodeTreatment>) => {
    const newEps = data.story.episodes.map(ep => ep.id === id ? { ...ep, ...updates } : ep);
    saveData({ ...data, story: { ...data.story, episodes: newEps } });
  };

  const deleteEpisode = (id: string) => {
    saveData({ ...data, story: { ...data.story, episodes: data.story.episodes.filter(ep => ep.id !== id) } });
  };

  const addProgressEntry = () => {
    const newEntry: ProgressEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      memo: "",
      image: undefined
    };
    saveData({ ...data, progress: [newEntry, ...(data.progress || [])] });
  };

  const updateProgressEntry = (id: string, updates: Partial<ProgressEntry>) => {
    saveData({
      ...data,
      progress: data.progress.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const deleteProgressEntry = (id: string) => {
    saveData({
      ...data,
      progress: data.progress.filter(p => p.id !== id)
    });
  };

  const exportPDF = async () => {
    const element = document.getElementById('planner-content');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F5F5F7'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Handle multi-page if needed, but for now single page or scaled
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.title}_기획안.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const addDesiredScene = () => {
    const newScene: DesiredScene = {
      id: Date.now().toString(),
      title: "새 장면",
      location: "",
      involvedCharacters: "",
      content: ""
    };
    saveData({ ...data, story: { ...data.story, desiredScenes: [...(data.story.desiredScenes || []), newScene] } });
  };

  const updateDesiredScene = (id: string, updates: Partial<DesiredScene>) => {
    const newScenes = data.story.desiredScenes.map(s => s.id === id ? { ...s, ...updates } : s);
    saveData({ ...data, story: { ...data.story, desiredScenes: newScenes } });
  };

  const deleteDesiredScene = (id: string) => {
    saveData({ ...data, story: { ...data.story, desiredScenes: data.story.desiredScenes.filter(s => s.id !== id) } });
  };

  // Collect all images for the Reference Board
  const allImageReferences: ImageReference[] = [
    ...data.characters.filter(c => c.profileImage).map(c => ({
      id: `profile-${c.id}`,
      url: c.profileImage!,
      description: `${c.name} 프로필`,
      sourceType: 'character_profile' as const,
      sourceId: c.id
    })),
    ...data.characters.flatMap(c => (c.references || []).map(r => ({
      id: r.id,
      url: r.url,
      description: `${c.name} 레퍼런스`,
      sourceType: 'character_ref' as const,
      sourceId: c.id
    }))),
    ...(data.story?.imageReferences || []).map(s => ({
      id: s.id,
      url: s.url,
      description: s.description,
      sourceType: 'story_ref' as const
    })),
    ...data.world.countries.flatMap(c => (c.references || []).map(r => ({
      id: r.id,
      url: r.url,
      description: `${c.name} 레퍼런스`,
      sourceType: 'background_ref' as const,
      sourceId: c.id
    })))
  ];

  const filteredReferences = allImageReferences.filter(ref => {
    if (refSubTab === 'character') return ref.sourceType === 'character_profile' || ref.sourceType === 'character_ref';
    if (refSubTab === 'story') return ref.sourceType === 'story_ref';
    if (refSubTab === 'background') return ref.sourceType === 'background_ref';
    return true;
  });

  return (
    <AnimatePresence mode="wait">
      {!currentProjectId ? (
        <motion.div 
          key="project-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans p-8 md:p-12"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                  <Sparkles className="text-indigo-600 w-10 h-10" />
                  만화/웹툰 기획
                </h1>
                <p className="text-[#86868B] text-lg">당신의 상상을 체계적인 기획으로 만들어보세요.</p>
              </div>
              <button 
                onClick={createNewProject}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                <Plus size={24} />
                새 프로젝트 시작
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setCurrentProjectId(project.id)}
                  className="bg-white rounded-3xl p-8 border border-[#D2D2D7] shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FolderOpen size={32} />
                    </div>
                    <button 
                      onClick={(e) => deleteProject(e, project.id)}
                      className="p-2 text-[#86868B] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                  <p className="text-[#86868B] text-sm line-clamp-2">{project.basicSettings.intention || "기획 의도가 설정되지 않았습니다."}</p>
                  <div className="mt-6 pt-6 border-t border-[#F5F5F7] flex items-center justify-between text-[#86868B] text-xs font-bold uppercase tracking-wider">
                    <span>{project.basicSettings.genre || "장르 미정"}</span>
                    <ChevronRight size={16} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="planner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex w-full"
        >
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-[#D2D2D7] flex flex-col sticky top-0 h-screen shrink-0">
            <div className="p-4 border-b border-[#D2D2D7]">
              <button 
                onClick={() => setCurrentProjectId(null)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl font-bold hover:bg-[#E5E5E7] transition-all mb-4 border border-[#D2D2D7]"
              >
                <ArrowLeft size={18} />
                목록으로 돌아가기
              </button>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2 px-2">
                <Sparkles className="text-indigo-600 w-5 h-5" />
                <span className="truncate">{data.title}</span>
              </h1>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-1">
              <TabButton 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
                icon={<LayoutDashboard size={20} />} 
                label="기본 설정" 
              />
          <TabButton 
            active={activeTab === 'progress'} 
            onClick={() => setActiveTab('progress')} 
            icon={<Layers size={20} />} 
            label="진행 상황" 
          />
          <TabButton 
            active={activeTab === 'world'} 
            onClick={() => setActiveTab('world')} 
            icon={<Sparkles size={20} />} 
            label="세계관 설정" 
          />
          <TabButton 
            active={activeTab === 'characters'} 
            onClick={() => setActiveTab('characters')} 
            icon={<User size={20} />} 
            label="캐릭터 시트" 
          />
          <TabButton 
            active={activeTab === 'story'} 
            onClick={() => setActiveTab('story')} 
            icon={<BookOpen size={20} />} 
            label="스토리 기획" 
          />
          <TabButton 
            active={activeTab === 'references'} 
            onClick={() => setActiveTab('references')} 
            icon={<ImageIcon size={20} />} 
            label="레퍼런스 보드" 
          />
        </nav>

        <div className="p-4 border-t border-[#D2D2D7]">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Project Status</p>
            <p className="text-sm font-medium">기획 단계 (Drafting)</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-[#D2D2D7] sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <div>
            <input 
              value={data.title}
              onChange={(e) => saveData({ ...data, title: e.target.value })}
              className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 w-full"
            />
            <p className="text-sm text-[#86868B]">{data.basicSettings.genre}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md"
            >
              <FileDown size={16} />
              PDF 저장
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D2D2D7] rounded-full text-sm font-medium hover:bg-[#F5F5F7] transition-colors">
              <Save size={16} />
              저장됨
            </button>
          </div>
        </header>

        <div id="planner-content" className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="캐릭터 수" value={data.characters.length} icon={<User className="text-blue-500" />} />
                  <StatCard title="에피소드 수" value={data.story.episodes.length} icon={<BookOpen className="text-indigo-500" />} />
                  <StatCard title="스토리 비트" value={`${data.story.beats.filter(b => b.content).length} / 15`} icon={<Layers className="text-purple-500" />} />
                  <StatCard title="총 이미지 레퍼런스" value={allImageReferences.length} icon={<ImageIcon className="text-emerald-500" />} />
                </div>

                  <div className="bg-white rounded-2xl p-8 border border-[#D2D2D7] shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="text-indigo-600" />
                        기본 설정 (Basic Settings)
                      </h2>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">작품 제목</label>
                      <input 
                        value={data.title}
                        onChange={(e) => saveData({ ...data, title: e.target.value })}
                        className="w-full text-2xl font-bold bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="작품 제목을 입력하세요"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">로그라인 (Logline)</label>
                      <textarea 
                        value={data.basicSettings.logline}
                        onChange={(e) => saveData({ ...data, basicSettings: { ...data.basicSettings, logline: e.target.value } })}
                        className="w-full h-20 bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm font-medium"
                        placeholder="작품의 핵심 내용을 한 문장으로 요약해주세요."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">요약 시놉시스 (Summary Synopsis)</label>
                      <textarea 
                        value={data.basicSettings.synopsis}
                        onChange={(e) => saveData({ ...data, basicSettings: { ...data.basicSettings, synopsis: e.target.value } })}
                        className="w-full h-40 bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm leading-relaxed"
                        placeholder="전체적인 줄거리를 요약하여 입력해주세요."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">기획 의도</label>
                        <textarea 
                          value={data.basicSettings.intention}
                          onChange={(e) => saveData({ ...data, basicSettings: { ...data.basicSettings, intention: e.target.value } })}
                          className="w-full h-32 bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                          placeholder="작품을 통해 전달하고자 하는 메시지는 무엇인가요?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">장르</label>
                        <input 
                          value={data.basicSettings.genre}
                          onChange={(e) => saveData({ ...data, basicSettings: { ...data.basicSettings, genre: e.target.value } })}
                          className="w-full bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="예: 판타지, 로맨스, 스릴러..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">핵심 키워드</label>
                        <input 
                          value={data.basicSettings.keywords}
                          onChange={(e) => saveData({ ...data, basicSettings: { ...data.basicSettings, keywords: e.target.value } })}
                          className="w-full bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="예: 성장, 복수, 우정, 비밀..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">주요 메시지</label>
                        <textarea 
                          value={data.basicSettings.message}
                          onChange={(e) => saveData({ ...data, basicSettings: { ...data.basicSettings, message: e.target.value } })}
                          className="w-full h-32 bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                          placeholder="독자에게 남기고 싶은 한 마디는?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">타겟 독자층</label>
                        <input 
                          value={data.basicSettings.target}
                          onChange={(e) => saveData({ ...data, basicSettings: { ...data.basicSettings, target: e.target.value } })}
                          className="w-full bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="예: 10대 후반 남성, 20대 직장인 여성..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'world' && (
              <motion.div 
                key="world"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex border-b border-[#D2D2D7] gap-8 mb-4 overflow-x-auto no-scrollbar">
                  <SubTabButton active={worldSubTab === 'basic'} onClick={() => setWorldSubTab('basic')} label="기본 세계관" />
                  <SubTabButton active={worldSubTab === 'map'} onClick={() => setWorldSubTab('map')} label="지도" />
                  <SubTabButton active={worldSubTab === 'countries'} onClick={() => setWorldSubTab('countries')} label="국가/지역" />
                  <SubTabButton active={worldSubTab === 'organizations'} onClick={() => setWorldSubTab('organizations')} label="조직/단체" />
                </div>

                {worldSubTab === 'basic' && (
                  <div className="space-y-8">
                    <div className="bg-white rounded-2xl p-8 border border-[#D2D2D7] shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">용어 정리</h3>
                        <button onClick={addTerminology} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
                          <Plus size={16} /> 용어 추가
                        </button>
                      </div>
                      <div className="space-y-4">
                        {data.world.terminology.map((t) => (
                          <div key={t.id} className="flex gap-4 items-start group">
                            <input 
                              value={t.term}
                              onChange={(e) => updateTerminology(t.id, { term: e.target.value })}
                              className="w-48 font-bold bg-[#F5F5F7] rounded-lg p-3 border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              placeholder="용어"
                            />
                            <textarea 
                              value={t.definition}
                              onChange={(e) => updateTerminology(t.id, { definition: e.target.value })}
                              className="flex-1 bg-[#F5F5F7] rounded-lg p-3 border-none focus:ring-2 focus:ring-indigo-500 text-sm h-20 resize-none"
                              placeholder="설명"
                            />
                            <button onClick={() => deleteTerminology(t.id)} className="p-2 text-[#86868B] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 border border-[#D2D2D7] shadow-sm">
                      <h3 className="text-xl font-bold mb-6">능력 시스템</h3>
                      <textarea 
                        value={data.world.abilitySystem}
                        onChange={(e) => saveData({ ...data, world: { ...data.world, abilitySystem: e.target.value } })}
                        className="w-full h-64 bg-[#F5F5F7] rounded-2xl p-6 border-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                        placeholder="세계관 내의 마법, 초능력, 기술 체계 등을 상세히 기록하세요..."
                      />
                    </div>
                  </div>
                )}

                {worldSubTab === 'map' && (
                  <div className="bg-white rounded-2xl p-8 border border-[#D2D2D7] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">세계 지도</h3>
                      <label className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                        <Camera size={14} /> 지도 업로드
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, (base64) => saveData({ ...data, world: { ...data.world, mapImage: base64 } }))} 
                        />
                      </label>
                    </div>
                    <div className="w-full aspect-video bg-[#F5F5F7] rounded-2xl overflow-hidden border border-[#D2D2D7] flex items-center justify-center relative group">
                      {data.world.mapImage ? (
                        <img src={data.world.mapImage} alt="World Map" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center text-[#86868B]">
                          <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">세계 지도를 업로드해주세요.</p>
                        </div>
                      )}
                      {data.world.mapImage && (
                        <button 
                          onClick={() => saveData({ ...data, world: { ...data.world, mapImage: undefined } })}
                          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {worldSubTab === 'countries' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">국가 및 지역 설정</h3>
                      <button onClick={addCountry} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
                        <Plus size={16} /> 국가 추가
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {data.world.countries.map((country) => (
                        <div key={country.id} className="bg-white rounded-2xl p-6 border border-[#D2D2D7] shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                            <input 
                              value={country.name}
                              onChange={(e) => updateCountry(country.id, { name: e.target.value })}
                              className="text-xl font-bold bg-transparent border-b border-transparent focus:border-indigo-300 focus:ring-0 p-0"
                              placeholder="국가명"
                            />
                            <button onClick={() => deleteCountry(country.id)} className="text-[#86868B] hover:text-red-500">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <WorldField label="시대 배경" value={country.era} onChange={(val) => updateCountry(country.id, { era: val })} placeholder="예: 중세 판타지, 사이버펑크..." />
                            <WorldField label="공간 배경" value={country.space} onChange={(val) => updateCountry(country.id, { space: val })} placeholder="예: 숲의 도시, 지하 기지..." />
                            <WorldField label="주요 종족" value={country.races} onChange={(val) => updateCountry(country.id, { races: val })} placeholder="예: 인간, 엘프, 드워프..." />
                            <WorldField label="역사" value={country.history} onChange={(val) => updateCountry(country.id, { history: val })} placeholder="주요 역사적 사건..." />
                            <WorldField label="사회/문화" value={country.society} onChange={(val) => updateCountry(country.id, { society: val })} placeholder="정치 체제, 풍습..." />
                            <WorldField label="환경" value={country.environment} onChange={(val) => updateCountry(country.id, { environment: val })} placeholder="기후, 지형적 특성..." />
                            <div className="md:col-span-2 lg:col-span-3">
                              <WorldField label="기타 특징" value={country.notes} onChange={(val) => updateCountry(country.id, { notes: val })} placeholder="그 외 특이사항..." />
                            </div>
                          </div>

                          {/* Background References Section */}
                          <div className="mt-8 pt-6 border-t border-[#F5F5F7]">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-sm font-bold flex items-center gap-2">
                                <ImageIcon size={16} className="text-indigo-500" />
                                배경 레퍼런스
                              </h4>
                              <label className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer flex items-center gap-1">
                                <Plus size={14} /> 추가하기
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleFileUpload(e, (base64) => {
                                    const newRefs = [...(country.references || []), { id: Date.now().toString(), url: base64, description: "배경 레퍼런스" }];
                                    updateCountry(country.id, { references: newRefs });
                                  })} 
                                />
                              </label>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              {(country.references || []).map((ref) => (
                                <div key={ref.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#D2D2D7] group/ref">
                                  <img src={ref.url} alt="ref" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <button 
                                    onClick={() => {
                                      const newRefs = country.references.filter(r => r.id !== ref.id);
                                      updateCountry(country.id, { references: newRefs });
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover/ref:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              ))}
                              {(country.references || []).length === 0 && (
                                <p className="text-xs text-[#86868B] italic">등록된 배경 레퍼런스가 없습니다.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {worldSubTab === 'organizations' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">조직 및 단체</h3>
                      <button onClick={addOrganization} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
                        <Plus size={16} /> 조직 추가
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                      {data.world.organizations.map((org) => (
                        <div key={org.id} className="bg-white rounded-2xl p-8 border border-[#D2D2D7] shadow-sm">
                          <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-48 flex flex-col items-center gap-4">
                              <div className="relative w-40 h-40 bg-[#F5F5F7] rounded-2xl overflow-hidden border border-[#D2D2D7] group/logo">
                                {org.logo ? (
                                  <img src={org.logo} alt={org.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#86868B]">
                                    <Sparkles size={48} />
                                  </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                                  로고 업로드
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleFileUpload(e, (base64) => updateOrganization(org.id, { logo: base64 }))} 
                                  />
                                </label>
                              </div>
                              <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Organization Logo</p>
                            </div>
                            <div className="flex-1 space-y-6">
                              <div className="flex justify-between items-center">
                                <input 
                                  value={org.name}
                                  onChange={(e) => updateOrganization(org.id, { name: e.target.value })}
                                  className="text-2xl font-bold bg-transparent border-b border-transparent focus:border-indigo-300 focus:ring-0 p-0"
                                  placeholder="조직명"
                                />
                                <button onClick={() => deleteOrganization(org.id)} className="text-[#86868B] hover:text-red-500">
                                  <Trash2 size={20} />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <WorldField label="목적" value={org.purpose} onChange={(val) => updateOrganization(org.id, { purpose: val })} placeholder="조직의 설립 목적..." />
                                <WorldField label="구조" value={org.structure} onChange={(val) => updateOrganization(org.id, { structure: val })} placeholder="계급 체계, 부서..." />
                                <WorldField label="상징" value={org.symbol} onChange={(val) => updateOrganization(org.id, { symbol: val })} placeholder="문양, 색상, 구호..." />
                                <WorldField label="복장" value={org.costume} onChange={(val) => updateOrganization(org.id, { costume: val })} placeholder="유니폼, 장비..." />
                              </div>
                              
                              <div className="pt-4 border-t border-[#F5F5F7]">
                                <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-3 block">소속 캐릭터 (클릭하여 추가/제거)</label>
                                <div className="flex flex-wrap gap-2">
                                  {data.characters.map(char => (
                                    <button 
                                      key={char.id}
                                      onClick={() => {
                                        const isMember = org.memberIds.includes(char.id);
                                        const newMemberIds = isMember 
                                          ? org.memberIds.filter(id => id !== char.id)
                                          : [...org.memberIds, char.id];
                                        updateOrganization(org.id, { memberIds: newMemberIds });
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                                        org.memberIds.includes(char.id)
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E5E5E7]'
                                      }`}
                                    >
                                      {char.name}
                                      {org.memberIds.includes(char.id) && (
                                        <span 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTab('characters');
                                          }}
                                          className="ml-1 p-0.5 bg-white/20 rounded-full hover:bg-white/40"
                                          title="캐릭터 시트로 이동"
                                        >
                                          <ChevronRight size={10} />
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'characters' && (
              <motion.div 
                key="characters"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Relationship Map Section */}
                <section className="bg-white rounded-2xl p-6 border border-[#D2D2D7] shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Layers size={20} className="text-indigo-500" />
                      인물 관계도 (이미지)
                    </h3>
                    <label className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                      <Camera size={14} /> 이미지 업로드
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, (base64) => saveData({ ...data, relationshipMapImage: base64 }))} 
                      />
                    </label>
                  </div>
                  
                  <div className="w-full aspect-[21/9] bg-[#F5F5F7] rounded-2xl overflow-hidden border border-[#D2D2D7] flex items-center justify-center relative group">
                    {data.relationshipMapImage ? (
                      <img src={data.relationshipMapImage} alt="Relationship Map" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center text-[#86868B]">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">직접 그린 관계도 이미지를 업로드해주세요.</p>
                      </div>
                    )}
                    {data.relationshipMapImage && (
                      <button 
                        onClick={() => saveData({ ...data, relationshipMapImage: undefined })}
                        className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </section>

                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">캐릭터 리스트</h2>
                  <button 
                    onClick={addCharacter}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={18} />
                    캐릭터 추가
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {data.characters.map((char) => (
                    <div key={char.id} className="bg-white rounded-2xl p-6 border border-[#D2D2D7] shadow-sm group">
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Image Section */}
                        <div className="w-full md:w-48 flex flex-col items-center gap-4">
                          <div className="relative w-40 h-40 bg-[#F5F5F7] rounded-2xl overflow-hidden border border-[#D2D2D7] group/img">
                            {char.profileImage ? (
                              <img src={char.profileImage} alt={char.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#86868B]">
                                <User size={48} />
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                              <Camera size={20} className="mr-2" />
                              변경하기
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, (base64) => updateCharacter(char.id, { profileImage: base64 }))} 
                              />
                            </label>
                          </div>
                          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Profile Image</p>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input 
                                value={char.name}
                                onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                                className="text-xl font-bold bg-transparent border-b border-transparent focus:border-indigo-300 focus:ring-0 p-0"
                                placeholder="이름"
                              />
                              <input 
                                value={char.role}
                                onChange={(e) => updateCharacter(char.id, { role: e.target.value })}
                                className="text-sm font-medium text-indigo-600 bg-transparent border-b border-transparent focus:border-indigo-300 focus:ring-0 p-0"
                                placeholder="역할 (예: 주연, 조연)"
                              />
                            </div>
                            <button 
                              onClick={() => deleteCharacter(char.id)}
                              className="text-[#86868B] hover:text-red-500 transition-colors p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <CharacterField 
                              label="캐치프레이즈" 
                              value={char.catchphrase || ""} 
                              onChange={(val) => updateCharacter(char.id, { catchphrase: val })} 
                              placeholder="대표 대사..."
                            />
                            <CharacterField 
                              label="욕망" 
                              value={char.desire || ""} 
                              onChange={(val) => updateCharacter(char.id, { desire: val })} 
                              placeholder="캐릭터가 원하는 것..."
                            />
                            <CharacterField 
                              label="신념" 
                              value={char.belief || ""} 
                              onChange={(val) => updateCharacter(char.id, { belief: val })} 
                              placeholder="캐릭터의 가치관..."
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <CharacterField 
                              label="키워드" 
                              value={char.keywords || ""} 
                              onChange={(val) => updateCharacter(char.id, { keywords: val })} 
                              placeholder="예: 열혈, 천재, 트라우마..."
                            />
                            <CharacterField 
                              label="성격" 
                              value={char.personality} 
                              onChange={(val) => updateCharacter(char.id, { personality: val })} 
                              placeholder="성격 묘사..."
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <CharacterField 
                              label="외양" 
                              value={char.appearance} 
                              onChange={(val) => updateCharacter(char.id, { appearance: val })} 
                              placeholder="신체적 특징, 복장..."
                            />
                            <CharacterField 
                              label="능력 (선택)" 
                              value={char.ability || ""} 
                              onChange={(val) => updateCharacter(char.id, { ability: val })} 
                              placeholder="캐릭터의 특수 능력이나 기술..."
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-6 mb-6">
                            <CharacterField 
                              label="기타 메모" 
                              value={char.notes} 
                              onChange={(val) => updateCharacter(char.id, { notes: val })} 
                              placeholder="배경 설정 등..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Character References Section */}
                      <div className="mt-8 pt-6 border-t border-[#F5F5F7]">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                            <LinkIcon size={16} className="text-indigo-500" />
                            캐릭터 레퍼런스
                          </h4>
                          <label className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer flex items-center gap-1">
                            <Plus size={14} /> 추가하기
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, (base64) => {
                                const newRefs = [...char.references, { id: Date.now().toString(), url: base64 }];
                                updateCharacter(char.id, { references: newRefs });
                              })} 
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {char.references.map((ref) => (
                            <div key={ref.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#D2D2D7] group/ref">
                              <img src={ref.url} alt="ref" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button 
                                onClick={() => {
                                  const newRefs = char.references.filter(r => r.id !== ref.id);
                                  updateCharacter(char.id, { references: newRefs });
                                }}
                                className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover/ref:opacity-100 transition-opacity"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                          {char.references.length === 0 && (
                            <p className="text-xs text-[#86868B] italic">등록된 레퍼런스가 없습니다.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'story' && (
              <motion.div 
                key="story"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles size={20} className="text-indigo-600" />
                      요약 시놉시스 (Summary Synopsis)
                    </h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-[#D2D2D7] shadow-sm">
                    <textarea 
                      value={data.basicSettings.synopsis}
                      onChange={(e) => saveData({ ...data, basicSettings: { ...data.basicSettings, synopsis: e.target.value } })}
                      className="w-full h-32 bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm leading-relaxed"
                      placeholder="전체적인 줄거리를 요약하여 입력해주세요."
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Layers size={20} className="text-purple-500" />
                    3막 15장 (Save the Cat)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.story.beats.map((beat, idx) => (
                      <div key={beat.id} className="bg-white rounded-xl p-4 border border-[#D2D2D7] shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold bg-[#F5F5F7] text-[#86868B] w-6 h-6 rounded-full flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold">{beat.title}</h4>
                        </div>
                        <textarea 
                          value={beat.content}
                          onChange={(e) => {
                            const newBeats = data.story.beats.map(b => b.id === beat.id ? { ...b, content: e.target.value } : b);
                            updateStory('beats', newBeats);
                          }}
                          className="w-full h-24 text-sm bg-transparent border-none focus:ring-0 p-0 resize-none"
                          placeholder="내용을 입력하세요..."
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <ImageIcon size={20} className="text-amber-500" />
                      타임라인 이미지
                    </h3>
                    <label className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                      <Camera size={14} /> 업로드
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, (base64) => updateStory('timelineImage', base64))} 
                      />
                    </label>
                  </div>
                  <div className="w-full aspect-[21/5] bg-white rounded-2xl overflow-hidden border border-[#D2D2D7] flex items-center justify-center relative group">
                    {data.story.timelineImage ? (
                      <img src={data.story.timelineImage} alt="Timeline" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center text-[#86868B]">
                        <ImageIcon size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs">타임라인 이미지를 업로드하세요.</p>
                      </div>
                    )}
                    {data.story.timelineImage && (
                      <button 
                        onClick={() => updateStory('timelineImage', undefined)}
                        className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <BookOpen size={20} className="text-blue-500" />
                      트리트먼트 (화별 요약)
                    </h3>
                    <button 
                      onClick={addEpisode}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      <Plus size={14} /> 화 추가
                    </button>
                  </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(data.story.episodes || []).map((ep) => (
                        <div key={ep.id} className="bg-white rounded-xl p-4 border border-[#D2D2D7] shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{ep.episodeNumber}화</span>
                              <input 
                                value={ep.title}
                                onChange={(e) => updateEpisode(ep.id, { title: e.target.value })}
                                className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0 w-32"
                                placeholder="제목"
                              />
                            </div>
                            <button onClick={() => deleteEpisode(ep.id)} className="text-[#86868B] hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <textarea 
                            value={ep.content}
                            onChange={(e) => updateEpisode(ep.id, { content: e.target.value })}
                            className="w-full h-20 bg-[#F5F5F7] rounded-lg p-2 border-none focus:ring-1 focus:ring-indigo-500 resize-none text-[10px] leading-tight"
                            placeholder="줄거리 요약..."
                          />
                        </div>
                      ))}
                    </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles size={20} className="text-amber-500" />
                      보고 싶은 장면 (상세)
                    </h3>
                    <button 
                      onClick={addDesiredScene}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      <Plus size={14} /> 장면 추가
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(data.story.desiredScenes || []).map((scene) => (
                      <div key={scene.id} className="bg-white rounded-2xl p-5 border border-[#D2D2D7] shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <input 
                            value={scene.title}
                            onChange={(e) => updateDesiredScene(scene.id, { title: e.target.value })}
                            className="text-base font-bold bg-transparent border-none focus:ring-0 p-0 w-full"
                            placeholder="장면 제목"
                          />
                          <button onClick={() => deleteDesiredScene(scene.id)} className="text-[#86868B] hover:text-red-500 ml-2">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <textarea 
                          value={scene.content}
                          onChange={(e) => updateDesiredScene(scene.id, { content: e.target.value })}
                          className="w-full h-24 bg-[#F5F5F7] rounded-xl p-3 border-none focus:ring-1 focus:ring-indigo-500 resize-none text-xs leading-relaxed"
                          placeholder="장면에 대한 설명을 입력하세요..."
                        />
                      </div>
                    ))}
                  </div>
                </section>

                  <section>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <LinkIcon size={20} className="text-emerald-500" />
                      레퍼런스 (텍스트)
                    </h3>
                    <div className="bg-white rounded-2xl p-6 border border-[#D2D2D7] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {data.story.references.map((ref, i) => (
                        <div key={i} className="flex items-center gap-2 py-2 border-b border-[#F5F5F7] last:border-0">
                          <LinkIcon size={14} className="text-indigo-500" />
                          <input 
                            value={ref}
                            onChange={(e) => {
                              const newRefs = [...data.story.references];
                              newRefs[i] = e.target.value;
                              updateStory('references', newRefs);
                            }}
                            className="flex-1 text-sm bg-transparent border-none focus:ring-0 p-0"
                            placeholder="레퍼런스 제목/링크"
                          />
                          <button 
                            onClick={() => {
                              const newRefs = data.story.references.filter((_, idx) => idx !== i);
                              updateStory('references', newRefs);
                            }}
                            className="text-[#86868B] hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => updateStory('references', [...data.story.references, ""])}
                        className="mt-2 text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline col-span-full"
                      >
                        <Plus size={14} /> 추가하기
                      </button>
                    </div>
                  </section>
              </motion.div>
            )}

            {activeTab === 'progress' && (
              <motion.div 
                key="progress"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold tracking-tight">진행 상황 (Progress Log)</h2>
                  <button 
                    onClick={addProgressEntry}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    <Plus size={20} />
                    새 로그 추가
                  </button>
                </div>

                <div className="space-y-6">
                  {(data.progress || []).map((entry) => (
                    <div key={entry.id} className="bg-white rounded-2xl p-6 border border-[#D2D2D7] shadow-sm flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 aspect-square bg-[#F5F5F7] rounded-xl overflow-hidden border border-[#D2D2D7] relative group shrink-0">
                        {entry.image ? (
                          <img src={entry.image} alt="Progress" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#86868B]">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                          이미지 첨부
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, (base64) => updateProgressEntry(entry.id, { image: base64 }))} 
                          />
                        </label>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <input 
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateProgressEntry(entry.id, { date: e.target.value })}
                            className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 text-indigo-600"
                          />
                          <button onClick={() => deleteProgressEntry(entry.id)} className="text-[#86868B] hover:text-red-500">
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <textarea 
                          value={entry.memo}
                          onChange={(e) => updateProgressEntry(entry.id, { memo: e.target.value })}
                          className="w-full h-32 bg-[#F5F5F7] rounded-xl p-4 border-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                          placeholder="오늘의 진행 상황이나 메모를 남겨주세요..."
                        />
                      </div>
                    </div>
                  ))}
                  {(!data.progress || data.progress.length === 0) && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#D2D2D7]">
                      <LayoutDashboard size={48} className="mx-auto mb-4 text-[#86868B] opacity-20" />
                      <p className="text-[#86868B]">아직 기록된 진행 상황이 없습니다.</p>
                      <button 
                        onClick={addProgressEntry}
                        className="mt-4 text-indigo-600 font-bold hover:underline"
                      >
                        첫 로그 작성하기
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'references' && (
              <motion.div 
                key="references"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">레퍼런스 보드</h2>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                      <Camera size={18} />
                      {refSubTab === 'character' ? '캐릭터 이미지' : refSubTab === 'story' ? '스토리 이미지' : '배경 이미지'} 추가
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, (base64) => {
                          if (refSubTab === 'character') {
                            // Default to first character if exists
                            if (data.characters.length > 0) {
                              const char = data.characters[0];
                              const newRefs = [...char.references, { id: Date.now().toString(), url: base64 }];
                              updateCharacter(char.id, { references: newRefs });
                            }
                          } else if (refSubTab === 'story') {
                            addStoryReference(base64);
                          } else {
                            addBackgroundReference(base64);
                          }
                        })} 
                      />
                    </label>
                  </div>
                </div>

                {/* Sub-tabs for Reference Board */}
                <div className="flex border-b border-[#D2D2D7] gap-8">
                  <button 
                    onClick={() => setRefSubTab('character')}
                    className={`pb-4 text-sm font-semibold transition-all relative ${refSubTab === 'character' ? 'text-indigo-600' : 'text-[#86868B]'}`}
                  >
                    캐릭터 시트
                    {refSubTab === 'character' && <motion.div layoutId="refTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                  </button>
                  <button 
                    onClick={() => setRefSubTab('story')}
                    className={`pb-4 text-sm font-semibold transition-all relative ${refSubTab === 'story' ? 'text-indigo-600' : 'text-[#86868B]'}`}
                  >
                    스토리
                    {refSubTab === 'story' && <motion.div layoutId="refTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                  </button>
                  <button 
                    onClick={() => setRefSubTab('background')}
                    className={`pb-4 text-sm font-semibold transition-all relative ${refSubTab === 'background' ? 'text-indigo-600' : 'text-[#86868B]'}`}
                  >
                    배경
                    {refSubTab === 'background' && <motion.div layoutId="refTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredReferences.map((ref) => (
                    <div key={ref.id} className="bg-white rounded-2xl overflow-hidden border border-[#D2D2D7] shadow-sm group">
                      <div className="relative aspect-square bg-[#F5F5F7]">
                        <img 
                          src={ref.url} 
                          alt={ref.description} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                            ref.sourceType === 'character_profile' ? 'bg-blue-100 text-blue-700' : 
                            ref.sourceType === 'character_ref' ? 'bg-purple-100 text-purple-700' : 
                            ref.sourceType === 'story_ref' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {ref.sourceType === 'character_profile' ? 'Profile' : 
                             ref.sourceType === 'character_ref' ? 'Char Ref' : 
                             ref.sourceType === 'story_ref' ? 'Story' : 'Background'}
                          </span>
                        </div>
                        {(ref.sourceType === 'background_ref' || ref.sourceType === 'story_ref') && (
                          <button 
                            onClick={() => {
                              if (ref.sourceType === 'background_ref') {
                                saveData({ ...data, backgroundReferences: data.backgroundReferences.filter(g => g.id !== ref.id) });
                              } else {
                                saveData({ ...data, story: { ...data.story, imageReferences: data.story.imageReferences.filter(s => s.id !== ref.id) } });
                              }
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-[#424245] truncate">{ref.description}</p>
                      </div>
                    </div>
                  ))}
                  {filteredReferences.length === 0 && (
                    <div className="col-span-full py-20 text-center text-[#86868B]">
                      <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                      <p>이 카테고리에 등록된 이미지가 없습니다.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  )}
</AnimatePresence>
);
}

// --- Sub-components ---

function SubTabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap ${active ? 'text-indigo-600' : 'text-[#86868B]'}`}
    >
      {label}
      {active && <motion.div layoutId="subTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
    </button>
  );
}

function WorldField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">{label}</label>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-20 text-xs bg-[#F5F5F7] rounded-xl p-3 border-none focus:ring-2 focus:ring-indigo-500 resize-none"
        placeholder={placeholder}
      />
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-[#424245] hover:bg-[#F5F5F7]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#D2D2D7] shadow-sm flex items-center gap-4">
      <div className="p-3 bg-[#F5F5F7] rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function CharacterField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">{label}</label>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-24 text-sm bg-[#F5F5F7] rounded-xl p-3 border-none focus:ring-2 focus:ring-indigo-500 resize-none"
        placeholder={placeholder}
      />
    </div>
  );
}
