import React, { useState, useRef } from 'react';
import { UserCheck, ShieldCheck, ArrowRight, UserPlus, Lock, LogIn, Camera, Download } from 'lucide-react';
import { SquashMember, BallRating } from '../types';
import { ADMIN_USER } from '../data/initialData';
import { compressImageFile } from '../utils/imageCompressor';

interface AuthGateModalProps {
  isOpen: boolean;
  members: SquashMember[];
  onLogin: (member: SquashMember) => void;
  onRegister: (newMember: SquashMember) => void;
  onOpenInstallModal?: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  members,
  onLogin,
  onRegister,
  onOpenInstallModal,
}) => {
  if (!isOpen) return null;

  // Toggle between 'login' and 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form States (Full Manual Registration)
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState<number | ''>(29);
  const [regBallRating, setRegBallRating] = useState<BallRating>('s2');
  const [regPhone, setRegPhone] = useState('010-5521-8840');
  const [regAvatarUrl, setRegAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [regAgreePush, setRegAgreePush] = useState(true);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  ];

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.8,
          maxSizeBytes: 200 * 1024,
        });
        setRegAvatarUrl(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setRegAvatarUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const ratingConfig: Record<BallRating, { label: string; sub: string; roleLabel: string; tenure: string }> = {
    s4: {
      label: 'S4 (입문/초보)',
      sub: '입문/초보부 (구력 1년 미만)',
      roleLabel: 'S4',
      tenure: 'S4 (입문/초보)',
    },
    s3: {
      label: 'S3 (중급)',
      sub: '중급부 (구력 1~3년차)',
      roleLabel: 'S3',
      tenure: 'S3 (중급)',
    },
    s2: {
      label: 'S2 (상급)',
      sub: '상급부 (구력 3~5년차)',
      roleLabel: 'S2',
      tenure: 'S2 (상급)',
    },
    s1: {
      label: 'S1 (최상급)',
      sub: '최상급부 (구력 5년 이상)',
      roleLabel: 'S1',
      tenure: 'S1 (최상급)',
    },
    master: {
      label: '마스터 (마스터부)',
      sub: '마스터부 (베테랑 마스터)',
      roleLabel: '마스터',
      tenure: '마스터 (마스터부)',
    },
    elite: {
      label: '선수 (엘리트선수)',
      sub: '엘리트선수부 (공식 선수/코치)',
      roleLabel: '선수',
      tenure: '선수 (엘리트선수)',
    },
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const input = loginUsername.trim().toLowerCase();

    // Check if logging in as Super Administrator
    if (input === 'admin' || input === '최고 관리자' || input === '최고관리자') {
      if (loginPassword !== ADMIN_USER.password) {
        setLoginError('최고 관리자 비밀번호가 일치하지 않습니다.');
        return;
      }
      onLogin(ADMIN_USER);
      return;
    }

    const targetUser = members.find(
      (m) =>
        m.username.toLowerCase() === input ||
        m.name.toLowerCase() === input
    );

    if (!targetUser) {
      setLoginError('등록된 회원 아이디 또는 이름을 찾을 수 없습니다. 신규 회원은 [일반 회원가입]을 진행해주세요.');
      return;
    }

    if (targetUser.password && targetUser.password !== loginPassword) {
      setLoginError('비밀번호가 일치하지 않습니다.');
      return;
    }

    onLogin(targetUser);
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim()) {
      alert('회원 이름을 입력해 주세요.');
      return;
    }
    if (!regUsername.trim()) {
      alert('아이디를 입력해 주세요.');
      return;
    }
    if (!regPassword.trim()) {
      alert('비밀번호를 입력해 주세요.');
      return;
    }

    if (regUsername.trim().toLowerCase() === 'admin') {
      alert('해당 아이디는 시스템 예약어이므로 사용할 수 없습니다.');
      return;
    }

    // Check duplicate username
    const exists = members.some(
      (m) => m.username.toLowerCase() === regUsername.trim().toLowerCase()
    );
    if (exists) {
      alert('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
      return;
    }

    const config = ratingConfig[regBallRating] || ratingConfig.s2;

    const newMember: SquashMember = {
      id: `m-${Date.now()}`,
      username: regUsername.trim(),
      password: regPassword.trim(),
      name: regName.trim(),
      avatar: regAvatarUrl,
      role: regBallRating === 'elite' ? 'coach' : 'member',
      roleLabel: config.roleLabel,
      tenure: config.tenure,
      age: regAge === '' ? 25 : Number(regAge),
      ballRating: regBallRating,
      ratingLabel: config.label,
      ratingSub: config.sub,
      primaryTeam: 'MAKS 스쿼시 클럽 공식 회원',
      clubPass: `#00${members.length + 25}`,
      trophiesCount: 0,
      statusColor: '#10b981',
      phone: regPhone,
      bio: `${regName.trim()} • [${config.label}] 정회원`,
      honors: [],
      photos: [],
      cheers: [],
    };

    onRegister(newMember);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg my-auto rounded-2xl bg-[#161822] border border-white/[0.12] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1d212e] to-[#161822] border-b border-white/[0.08] text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f5c200] text-[#0f1118] font-chivo font-black text-xl mb-3 shadow-[0_0_20px_rgba(245,194,0,0.35)]">
            M
          </div>
          <h2 className="font-chivo font-black text-xl sm:text-2xl text-white tracking-tight">
            MAKS SQUASH CLUB
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
            공식 명부 회원 및 관리자 전용 시스템입니다. 로그인하거나 신규 회원으로 등록하세요.
          </p>

          {/* Tab Selector: Login vs Register */}
          <div className="flex rounded-xl bg-[#0c0e15] p-1 border border-white/10 mt-5 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-chivo font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#f5c200] text-[#0f1118] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={14} />
              <span>로그인</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setLoginError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-chivo font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#f5c200] text-[#0f1118] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={14} />
              <span>일반 회원가입</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto">
          {/* ================= REGISTER VIEW ================= */}
          {authMode === 'register' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#11131a] border border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-gray-300">신규 회원 정원 현황</span>
                <span className="text-[#f5c200] font-bold">
                  {members.length}명 등록 중 (여유 있음)
                </span>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Avatar Selection */}
                <div>
                  <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1.5">
                    프로필 사진
                  </label>
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#f5c200] bg-[#0c0e15] p-0.5">
                        <img
                          src={regAvatarUrl}
                          alt="preview"
                          className="w-full h-full object-cover rounded-[8px]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#f5c200] text-[#0f1118] flex items-center justify-center shadow cursor-pointer"
                        title="사진 업로드"
                      >
                        <Camera size={10} strokeWidth={2.5} />
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileSelect}
                        className="hidden"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap flex-1">
                      {sampleAvatars.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRegAvatarUrl(url)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                            regAvatarUrl === url ? 'border-[#f5c200] scale-110' : 'border-white/20 opacity-70'
                          }`}
                        >
                          <img src={url} alt="sample" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name & Age */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                      회원 이름 (실명) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="예: 홍길동"
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                      나이
                    </label>
                    <input
                      type="number"
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="나이 입력"
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                    />
                  </div>
                </div>

                {/* Username & Password */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                      로그인 아이디 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="아이디 설정"
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                      비밀번호 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="비밀번호 설정"
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                    연락처 (휴대폰)
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                  />
                </div>

                {/* Squash Grade Selection: S4, S3, S2, S1, 마스터, 선수 */}
                <div>
                  <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1.5">
                    스쿼시 등급 선택 <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRegBallRating('s4')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        regBallRating === 's4'
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                          : 'border-white/10 bg-[#0c0e15] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="font-chivo font-bold text-white">S4 (입문/초보)</div>
                      <div className="text-[10px] text-gray-400">입문/초보부</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegBallRating('s3')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        regBallRating === 's3'
                          ? 'border-blue-500 bg-blue-950/40 text-blue-300 ring-1 ring-blue-500'
                          : 'border-white/10 bg-[#0c0e15] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="font-chivo font-bold text-white">S3 (중급)</div>
                      <div className="text-[10px] text-gray-400">중급부</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegBallRating('s2')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        regBallRating === 's2'
                          ? 'border-[#f5c200] bg-[#f5c200]/10 text-[#f5c200] ring-1 ring-[#f5c200]'
                          : 'border-white/10 bg-[#0c0e15] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="font-chivo font-bold text-white">S2 (상급)</div>
                      <div className="text-[10px] text-gray-400">상급부</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegBallRating('s1')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        regBallRating === 's1'
                          ? 'border-purple-500 bg-purple-950/40 text-purple-300 ring-1 ring-purple-500'
                          : 'border-white/10 bg-[#0c0e15] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="font-chivo font-bold text-white">S1 (최상급)</div>
                      <div className="text-[10px] text-gray-400">최상급부</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegBallRating('master')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        regBallRating === 'master'
                          ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400'
                          : 'border-white/10 bg-[#0c0e15] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="font-chivo font-bold text-white">마스터 (마스터부)</div>
                      <div className="text-[10px] text-gray-400">마스터부</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegBallRating('elite')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        regBallRating === 'elite'
                          ? 'border-red-500 bg-red-950/40 text-red-300 ring-1 ring-red-500'
                          : 'border-white/10 bg-[#0c0e15] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="font-chivo font-bold text-white">선수 (엘리트선수)</div>
                      <div className="text-[10px] text-gray-400">엘리트선수부</div>
                    </button>
                  </div>
                </div>

                {/* Desktop & Mobile App Shortcut Notice (가입화면에만 포함) */}
                <div className="p-3.5 rounded-xl bg-[#0c0e15] border border-[#f5c200]/40 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow ring-1 ring-[#f5c200]/50 p-0.5 bg-[#0f1118] shrink-0">
                      <img
                        src="/pwa-192x192.png"
                        alt="MAKS Icon"
                        className="w-full h-full object-cover rounded-[8px]"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-chivo font-black text-white flex items-center gap-1.5">
                        <span>MAKS 바탕화면 아이콘 추가 안내</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#f5c200] text-[9px] font-bold">홈 화면</span>
                      </div>
                      <div className="text-[10px] text-gray-300 mt-0.5">
                        스마트폰 홈 화면 또는 PC 바탕화면에 바로가기를 생성하여 앱처럼 사용할 수 있습니다.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-400 bg-black/40 p-2 rounded-lg border border-white/5 font-sans">
                    <div>
                      <span className="text-[#f5c200] font-bold">🍎 아이폰(Safari):</span> 하단 공유 [↑] ➔ '홈 화면에 추가'
                    </div>
                    <div>
                      <span className="text-[#f5c200] font-bold">🤖 안드로이드/PC:</span> 브라우저 메뉴 [⋮] ➔ '홈 화면에 추가' 또는 [설치]
                    </div>
                  </div>

                  {onOpenInstallModal && (
                    <button
                      type="button"
                      onClick={onOpenInstallModal}
                      className="w-full py-2 px-3 rounded-lg bg-[#1e222d] hover:bg-[#282d3c] border border-[#f5c200]/30 text-white text-xs font-chivo font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Download size={13} className="text-[#f5c200]" />
                      <span>바탕화면에 MAKS 바로가기 아이콘 생성하기</span>
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#f5c200] hover:bg-[#ffe299] active:scale-[0.98] text-[#0f1118] font-chivo font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2"
                >
                  <span>회원가입 완료 및 클럽 입장</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* ================= LOGIN VIEW ================= */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                    아이디 또는 회원 이름
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="아이디 또는 실명 입력"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                    required
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-500/20">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#f5c200] hover:bg-[#ffe299] active:scale-[0.98] text-[#0f1118] font-chivo font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <LogIn size={16} />
                  <span>로그인 완료 및 클럽 입장</span>
                </button>
              </form>
            </div>
          )}
          </div>
        </div>
      </div>
  );
};
